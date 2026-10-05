<script>
  import { fade, slide } from 'svelte/transition'
  import HardDriveDownload from '@lucide/svelte/icons/hard-drive-download'
  import ArchiveRestore from '@lucide/svelte/icons/archive-restore'
  import FolderUp from '@lucide/svelte/icons/folder-up'
  import CircleCheck from '@lucide/svelte/icons/circle-check'
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert'
  import Loader from '@lucide/svelte/icons/loader-circle'
  import { db } from '../../db.js'
  import { liveData } from '../liveQuery.svelte.js'
  import { nav } from '../nav.svelte.js'
  import { formatInstant } from '../entretiens.js'
  import {
    exporterDonnees,
    partagerFichier,
    noterExport,
    dernierExport,
    lireSauvegarde,
    restaurer,
    ErreurSauvegarde,
  } from '../sauvegarde.js'
  import Header from '../Header.svelte'

  const nbVehicules = liveData(() => db.vehicules.count(), 0)
  const nbEntretiens = liveData(() => db.entretiens.count(), 0)
  const nbFichiers = liveData(() => db.photos.count(), 0)

  let dernier = $state(dernierExport())
  let exportEnCours = $state(false)
  let messageExport = $state(null) // { ok, texte }

  let lecture = $state(false)
  // brut : un proxy réactif ne peut pas être stocké tel quel dans IndexedDB
  let aRestaurer = $state.raw(null) // résultat de lireSauvegarde
  let restaurationEnCours = $state(false)
  let messageImport = $state(null)

  const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`
  const resumeTexte = (r) =>
    `${pluriel(r.vehicules, 'véhicule')}, ${pluriel(r.entretiens, 'entretien')}, ${pluriel(r.fichiers, 'fichier')}`

  async function exporter() {
    exportEnCours = true
    messageExport = null
    try {
      const { fichier, resume } = await exporterDonnees()
      const issue = await partagerFichier(fichier)
      if (issue === 'annule') return
      noterExport()
      dernier = dernierExport()
      messageExport = { ok: true, texte: `Sauvegarde créée : ${resumeTexte(resume)}.` }
    } catch (e) {
      console.error(e)
      messageExport = { ok: false, texte: 'L’export a échoué. Réessayez ; si cela persiste, libérez de l’espace sur l’iPhone.' }
    } finally {
      exportEnCours = false
    }
  }

  async function choisirFichier(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    lecture = true
    messageImport = null
    aRestaurer = null
    try {
      aRestaurer = await lireSauvegarde(file)
    } catch (err) {
      console.error(err)
      messageImport = {
        ok: false,
        texte: err instanceof ErreurSauvegarde ? err.message : 'Ce fichier n’a pas pu être lu.',
      }
    } finally {
      lecture = false
    }
  }

  async function confirmerRestauration() {
    restaurationEnCours = true
    try {
      await restaurer(aRestaurer.donnees)
      messageImport = { ok: true, texte: `Données restaurées : ${resumeTexte(aRestaurer.resume)}.` }
      aRestaurer = null
    } catch (err) {
      console.error(err)
      messageImport = { ok: false, texte: 'La restauration a échoué ; vos données actuelles n’ont pas été modifiées.' }
    } finally {
      restaurationEnCours = false
    }
  }
</script>

<Header titre="Sauvegarde" onRetour={() => nav.retour()} />

<div class="screen">
  <p class="intro">
    Vos données ne sont que sur cet iPhone. Exportez-les régulièrement et gardez le fichier dans
    Fichiers ou iCloud Drive : c’est votre seule protection en cas de perte ou de réinitialisation.
  </p>

  <section class="panneau bloc">
    <h2 class="section-title"><HardDriveDownload size={20} />Exporter</h2>
    <p>
      Un fichier ZIP avec tout le contenu : {resumeTexte({
        vehicules: nbVehicules.value,
        entretiens: nbEntretiens.value,
        fichiers: nbFichiers.value,
      })}.
    </p>
    <p class="dernier">
      {#if dernier}Dernier export : {formatInstant(dernier)}{:else}Aucun export pour l’instant{/if}
    </p>
    <button class="btn btn--primary btn--block" onclick={exporter} disabled={exportEnCours}>
      {#if exportEnCours}<Loader size={20} class="tourne" /> Préparation…{:else}<HardDriveDownload size={20} /> Exporter mes données{/if}
    </button>
    {#if messageExport}
      <p class="message" class:message--ok={messageExport.ok} transition:fade={{ duration: 150 }}>
        {#if messageExport.ok}<CircleCheck size={18} />{:else}<CircleAlert size={18} />{/if}{messageExport.texte}
      </p>
    {/if}
  </section>

  <section class="panneau bloc">
    <h2 class="section-title"><ArchiveRestore size={20} />Restaurer</h2>
    <p>Choisissez un fichier de sauvegarde (.zip) créé par l’appli, sur cet iPhone ou un autre appareil.</p>
    <label class="btn btn--secondary btn--block" class:desactive={lecture || restaurationEnCours}>
      {#if lecture}<Loader size={20} class="tourne" /> Lecture…{:else}<FolderUp size={20} /> Choisir une sauvegarde{/if}
      <input type="file" accept=".zip,application/zip" hidden onchange={choisirFichier} />
    </label>

    {#if aRestaurer}
      <div class="confirmation" transition:slide={{ duration: 180 }}>
        <p class="confirmation__titre"><TriangleAlert size={18} />Remplacer toutes les données ?</p>
        <p>
          Sauvegarde du {formatInstant(aRestaurer.date)} : {resumeTexte(aRestaurer.resume)}.
          Les données actuelles de cet iPhone ({pluriel(nbVehicules.value, 'véhicule')},
          {pluriel(nbEntretiens.value, 'entretien')}) seront effacées.
        </p>
        {#if aRestaurer.resume.manquants}
          <p>{pluriel(aRestaurer.resume.manquants, 'fichier')} absent(s) de l’archive ne seront pas restaurés.</p>
        {/if}
        <div class="confirmation__actions">
          <button class="btn btn--secondary" onclick={() => (aRestaurer = null)}>Annuler</button>
          <button class="btn btn--danger" onclick={confirmerRestauration} disabled={restaurationEnCours}>
            {restaurationEnCours ? 'Restauration…' : 'Remplacer'}
          </button>
        </div>
      </div>
    {/if}

    {#if messageImport}
      <p class="message" class:message--ok={messageImport.ok} transition:fade={{ duration: 150 }}>
        {#if messageImport.ok}<CircleCheck size={18} />{:else}<CircleAlert size={18} />{/if}{messageImport.texte}
      </p>
    {/if}
  </section>
</div>

<style>
  .intro {
    margin: 0;
    color: var(--ink-2);
    line-height: 1.5;
  }
  .bloc {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }
  .bloc .section-title {
    margin-top: 0;
  }
  .bloc p {
    margin: 0;
    line-height: 1.5;
  }
  .dernier {
    font-size: 0.9rem;
    color: var(--ink-2);
  }
  .desactive {
    opacity: 0.55;
    pointer-events: none;
  }
  .message {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    color: var(--danger);
  }
  .message :global(svg) {
    flex-shrink: 0;
    margin-top: 0.15rem;
  }
  .message--ok {
    color: var(--celadon-ink);
  }
  .confirmation {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem;
    border-radius: var(--r-lg);
    background: var(--danger-soft);
  }
  .confirmation__titre {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
    color: var(--danger);
  }
  .confirmation__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }
</style>

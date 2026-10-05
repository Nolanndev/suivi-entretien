<script>
  import { fade } from 'svelte/transition'
  import Camera from '@lucide/svelte/icons/camera'
  import Images from '@lucide/svelte/icons/images'
  import Trash from '@lucide/svelte/icons/trash-2'
  import Tag from '@lucide/svelte/icons/tag'
  import Factory from '@lucide/svelte/icons/factory'
  import Calendar from '@lucide/svelte/icons/calendar'
  import IdCard from '@lucide/svelte/icons/id-card'
  import Gauge from '@lucide/svelte/icons/gauge'
  import Check from '@lucide/svelte/icons/check'
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import { db, TYPES_VEHICULE } from '../../db.js'
  import { redimensionnerImage } from '../image.js'
  import { nav } from '../nav.svelte.js'
  import { aujourdhui } from '../entretiens.js'
  import Header from '../Header.svelte'
  import BlobImg from '../BlobImg.svelte'
  import VehiculeIcon from '../VehiculeIcon.svelte'

  let type = $state('voiture')
  let nom = $state('')
  let marque = $state('')
  let modele = $state('')
  let annee = $state('')
  let immatriculationOuSerie = $state('')
  let uniteCompteur = $state('km')
  let compteurActuel = $state('')
  let photo = $state(null)
  let enCours = $state(false)
  let erreur = $state('')

  function choisirType(t) {
    type = t
    // Une machine de motoculture se suit généralement en heures.
    uniteCompteur = t === 'motoculture' ? 'heures' : 'km'
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      photo = await redimensionnerImage(file)
    } catch {
      erreur = 'Cette image n’a pas pu être lue. Essayez-en une autre.'
    }
  }

  async function enregistrer() {
    if (!nom.trim()) {
      erreur = 'Donnez un nom au véhicule (ex. « Clio de tous les jours »).'
      return
    }
    erreur = ''
    enCours = true
    try {
      const vehiculeId = await db.vehicules.add({
        type,
        nom: nom.trim(),
        marque: marque.trim(),
        modele: modele.trim(),
        annee: annee ? Number(annee) : null,
        immatriculationOuSerie: immatriculationOuSerie.trim(),
        uniteCompteur,
        compteurActuel: Number(compteurActuel) || 0,
      })
      if (photo) {
        await db.photos.add({
          vehiculeId,
          entretienId: null,
          pieceId: null,
          kind: 'photo',
          mime: 'image/jpeg',
          blob: photo,
          legende: 'Photo du véhicule',
          date: aujourdhui(),
        })
      }
      nav.remplacer('vehicule', { vehiculeId })
    } finally {
      enCours = false
    }
  }
</script>

<Header titre="Nouveau véhicule" onRetour={() => nav.retour()} />

<div class="screen">
  <div class="types" role="group" aria-label="Type de véhicule">
    {#each TYPES_VEHICULE as t (t.value)}
      <button
        type="button"
        class="type t-{t.value}"
        class:plaque={type === t.value}
        aria-pressed={type === t.value}
        onclick={() => choisirType(t.value)}
      >
        <VehiculeIcon type={t.value} size={28} />
        <span>{t.label}</span>
      </button>
    {/each}
  </div>

  <label class="field">
    <span class="field__label"><Tag size={14} />Nom *</span>
    <input type="text" bind:value={nom} placeholder="Ex. Clio de tous les jours" />
  </label>

  <div class="field-row">
    <label class="field">
      <span class="field__label"><Factory size={14} />Marque</span>
      <input type="text" bind:value={marque} />
    </label>
    <label class="field">
      <span class="field__label">Modèle</span>
      <input type="text" bind:value={modele} />
    </label>
  </div>

  <div class="field-row">
    <label class="field">
      <span class="field__label"><Calendar size={14} />Année</span>
      <input type="number" inputmode="numeric" bind:value={annee} placeholder="2018" />
    </label>
    <label class="field">
      <span class="field__label"><IdCard size={14} />Immat. / n° série</span>
      <input type="text" bind:value={immatriculationOuSerie} autocapitalize="characters" />
    </label>
  </div>

  <div class="field">
    <span class="field__label"><Gauge size={14} />Compteur actuel</span>
    <div class="compteur-saisie">
      <input type="number" inputmode="numeric" bind:value={compteurActuel} placeholder="0" />
      <div class="segmented" role="group" aria-label="Unité du compteur">
        <button type="button" aria-pressed={uniteCompteur === 'km'} onclick={() => (uniteCompteur = 'km')}>km</button>
        <button type="button" aria-pressed={uniteCompteur === 'heures'} onclick={() => (uniteCompteur = 'heures')}>heures</button>
      </div>
    </div>
  </div>

  <div class="field">
    <span class="field__label"><Camera size={14} />Photo du véhicule</span>
    {#if photo}
      <div class="apercu" transition:fade={{ duration: 180 }}>
        <BlobImg blob={photo} alt="Aperçu de la photo" />
        <button type="button" class="icon-btn apercu__retirer" onclick={() => (photo = null)} aria-label="Retirer la photo">
          <Trash size={20} />
        </button>
      </div>
    {:else}
      <div class="sources">
        <label class="btn btn--secondary">
          <Camera size={20} /> Prendre une photo
          <input type="file" accept="image/*" capture="environment" hidden onchange={onPhoto} />
        </label>
        <label class="btn btn--secondary">
          <Images size={20} /> Photothèque
          <input type="file" accept="image/*" hidden onchange={onPhoto} />
        </label>
      </div>
    {/if}
  </div>

  {#if erreur}
    <p class="erreur" transition:fade={{ duration: 150 }}><CircleAlert size={18} />{erreur}</p>
  {/if}
</div>

<div class="barre-action">
  <button class="btn btn--primary btn--block" onclick={enregistrer} disabled={enCours}>
    <Check size={20} />
    {enCours ? 'Enregistrement…' : 'Enregistrer le véhicule'}
  </button>
</div>

<style>
  .types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }
  .type {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    min-height: 88px;
    padding: 0.8rem 0.4rem;
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    background: var(--surface);
    color: var(--ink-2);
    font-family: var(--font-cond);
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    transition: transform 140ms var(--ease), background-color 200ms var(--ease), color 200ms var(--ease);
  }
  .type:active {
    transform: scale(0.96);
  }
  .type.plaque {
    color: var(--p-ink);
  }
  .compteur-saisie {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem;
    align-items: center;
  }
  .compteur-saisie input {
    font-family: var(--font-cond);
    font-size: 1.3rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .compteur-saisie .segmented button {
    padding: 0 0.9rem;
  }
  .sources {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
  .sources :global(svg) {
    color: var(--blue);
  }
  .apercu {
    position: relative;
    border-radius: var(--r-lg);
    overflow: hidden;
    border: 1px solid var(--line);
  }
  .apercu :global(img) {
    width: 100%;
    max-height: 14rem;
    object-fit: cover;
  }
  .apercu__retirer {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgb(0 0 0 / 0.55) !important;
    color: #fff !important;
  }
</style>

<script>
  import { fly, fade } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import Plus from '@lucide/svelte/icons/plus'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Check from '@lucide/svelte/icons/check'
  import X from '@lucide/svelte/icons/x'
  import Coins from '@lucide/svelte/icons/coins'
  import Paperclip from '@lucide/svelte/icons/paperclip'
  import House from '@lucide/svelte/icons/house'
  import Warehouse from '@lucide/svelte/icons/warehouse'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import NotebookText from '@lucide/svelte/icons/notebook-text'
  import { db } from '../../db.js'
  import { liveData } from '../liveQuery.svelte.js'
  import { nav } from '../nav.svelte.js'
  import { formatDate, formatEuros, formatNombre, totalEntretien } from '../entretiens.js'
  import { operationDe, resumeDetails } from '../operations.js'
  import Header from '../Header.svelte'
  import BlobImg from '../BlobImg.svelte'
  import VehiculeIcon from '../VehiculeIcon.svelte'
  import Compteur from '../Compteur.svelte'

  let { vehiculeId } = $props()

  const vehicule = liveData(() => db.vehicules.get(vehiculeId), undefined)
  const entretiens = liveData(() => db.entretiens.where('vehiculeId').equals(vehiculeId).toArray(), [])
  const piecesJointes = liveData(() => db.photos.where('vehiculeId').equals(vehiculeId).toArray(), [])
  const lignes = liveData(async () => {
    const ids = await db.entretiens.where('vehiculeId').equals(vehiculeId).primaryKeys()
    return db.piecesUtilisees.where('entretienId').anyOf(ids).toArray()
  }, [])

  const tries = $derived([...entretiens.value].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id)))
  const photoProfil = $derived(piecesJointes.value.find((p) => p.entretienId == null && p.pieceId == null))

  function lignesDe(id) {
    return lignes.value.filter((l) => l.entretienId === id)
  }
  function nbPiecesJointes(id) {
    return piecesJointes.value.filter((p) => p.entretienId === id).length
  }

  const anneeCourante = String(new Date().getFullYear())
  const coutAnnee = $derived(
    entretiens.value
      .filter((e) => e.date?.startsWith(anneeCourante))
      .reduce((s, e) => s + totalEntretien(e, lignesDe(e.id)), 0)
  )

  let editionCompteur = $state(false)
  let compteurSaisi = $state('')

  function editerCompteur() {
    compteurSaisi = vehicule.value?.compteurActuel ?? 0
    editionCompteur = true
  }
  async function enregistrerCompteur() {
    await db.vehicules.update(vehiculeId, { compteurActuel: Number(compteurSaisi) || 0 })
    editionCompteur = false
  }

  const LIBELLE_TYPE = { voiture: 'Voiture', moto: 'Moto', motoculture: 'Motoculture' }
</script>

{#if vehicule.value}
  {@const v = vehicule.value}
  <Header titre={v.nom} onRetour={() => nav.retour()} />

  <div class="screen t-{v.type}">
    <section class="plaque identite" style:view-transition-name="vehicule-{v.id}">
      <div class="identite__haut">
        <span class="identite__badge" role="img" aria-label={LIBELLE_TYPE[v.type]}><VehiculeIcon type={v.type} size={26} /></span>
        <div class="identite__texte">
          <span class="identite__desc">
            {[v.marque, v.modele].filter(Boolean).join(' ') || v.nom}
            {#if v.annee}<span class="num"> · {v.annee}</span>{/if}
          </span>
          {#if v.immatriculationOuSerie}
            <span class="identite__immat">{v.immatriculationOuSerie}</span>
          {/if}
        </div>
        {#if photoProfil}
          <button
            class="identite__photo"
            onclick={() => nav.ouvrirVisionneuse([photoProfil], 0)}
            aria-label="Agrandir la photo du véhicule"
          >
            <BlobImg blob={photoProfil.blob} alt="" />
          </button>
        {/if}
      </div>

      <div class="identite__compteur">
        {#if editionCompteur}
          <div class="compteur-edit" in:fade={{ duration: 150 }}>
            <input
              type="number"
              inputmode="numeric"
              bind:value={compteurSaisi}
              aria-label="Nouveau compteur"
              onkeydown={(e) => e.key === 'Enter' && enregistrerCompteur()}
            />
            <button class="icon-btn" onclick={() => (editionCompteur = false)} aria-label="Annuler"><X size={20} /></button>
            <button class="icon-btn icon-btn--ok" onclick={enregistrerCompteur} aria-label="Enregistrer le compteur"><Check size={20} /></button>
          </div>
        {:else}
          <Compteur valeur={v.compteurActuel} unite={v.uniteCompteur} taille="lg" />
          <button class="icon-btn" onclick={editerCompteur} aria-label="Modifier le compteur"><Pencil size={19} /></button>
        {/if}
      </div>

      <div class="identite__cout">
        <Coins size={16} />
        <span>Dépensé en {anneeCourante}</span>
        <strong class="num">{formatEuros(coutAnnee)}</strong>
      </div>
    </section>

    <h2 class="section-title"><NotebookText size={20} />Historique</h2>

    {#if tries.length === 0}
      <div class="empty">
        <NotebookText size={32} strokeWidth={1.5} />
        <p>Aucun entretien noté.<br />Le premier se saisit en moins d’une minute.</p>
      </div>
    {:else}
      <ol class="panneau carnet">
        {#each tries as e, i (e.id)}
          {@const op = operationDe(e)}
          {@const resume = resumeDetails(e, v.type)}
          {@const nbPj = nbPiecesJointes(e.id)}
          <li in:fly={{ y: 10, duration: 220, delay: Math.min(i, 8) * 30, easing: cubicOut }}>
            <button class="ligne" onclick={() => nav.aller('entretien', { entretienId: e.id })}>
              <span class="ligne__icone"><op.icon size={20} /></span>
              <span class="ligne__corps">
                <span class="ligne__titre">{op.id === 'autre' ? e.typeOperation : op.label}</span>
                {#if resume}<span class="ligne__resume">{resume}</span>{/if}
                <span class="ligne__meta">
                  <span class="num">{formatDate(e.date)}</span>
                  <span class="num">{formatNombre(e.compteur)} {v.uniteCompteur === 'heures' ? 'h' : 'km'}</span>
                  <span class="ligne__pj">{#if e.lieu === 'garage'}<Warehouse size={14} />Garage{:else}<House size={14} />Soi-même{/if}</span>
                  {#if nbPj}<span class="ligne__pj"><Paperclip size={13} />{nbPj}</span>{/if}
                </span>
              </span>
              <span class="ligne__fin">
                <span class="ligne__montant num">{formatEuros(totalEntretien(e, lignesDe(e.id)))}</span>
                <ChevronRight size={18} />
              </span>
            </button>
          </li>
        {/each}
      </ol>
    {/if}
  </div>

  <div class="barre-action">
    <button class="btn btn--primary btn--block" onclick={() => nav.aller('form-entretien', { vehiculeId })}>
      <Plus size={20} strokeWidth={2.25} /> Nouvel entretien
    </button>
  </div>
{/if}

<style>
  .identite {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.1rem;
  }
  .identite__haut {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.85rem;
    align-items: center;
  }
  .identite__badge {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--p);
    color: var(--p-soft);
    box-shadow: inset 0 0 0 2px var(--p), inset 0 0 0 3px color-mix(in oklab, var(--p-soft) 70%, transparent);
  }
  .identite__texte {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }
  .identite__desc {
    font-size: 1.05rem;
    font-weight: 600;
  }
  .identite__immat {
    align-self: flex-start;
    margin-top: 0.2rem;
    padding: 0.05rem 0.45rem;
    border: 1.5px solid var(--ink-2);
    border-radius: 5px;
    background: var(--surface);
    font-family: var(--font-cond);
    font-weight: 600;
    letter-spacing: 0.08em;
    font-size: 0.95rem;
  }
  .identite__photo {
    width: 72px;
    height: 72px;
    padding: 0;
    border: 2px solid var(--surface);
    border-radius: var(--r-md);
    overflow: hidden;
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--p) 40%, transparent);
  }
  .identite__photo :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .identite__compteur {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 52px;
  }
  .compteur-edit {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    width: 100%;
  }
  .compteur-edit input {
    font-family: var(--font-cond);
    font-size: 1.4rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .icon-btn--ok {
    background: var(--tile) !important;
    color: var(--tile-ink) !important;
  }
  .identite__cout {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding-top: 0.8rem;
    border-top: 1px dashed color-mix(in oklab, var(--p) 40%, transparent);
    color: var(--p-ink);
    font-size: 0.92rem;
  }
  .identite__cout strong {
    margin-left: auto;
    font-family: var(--font-cond);
    font-size: 1.25rem;
    color: var(--ink);
  }
  .carnet {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .carnet li + li {
    border-top: 1px solid var(--line);
  }
  .ligne {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.75rem;
    align-items: start;
    width: 100%;
    padding: 0.85rem 0.8rem;
    border: none;
    background: transparent;
    text-align: left;
    color: var(--ink);
    transition: background-color 160ms var(--ease);
  }
  .ligne:active {
    background: var(--surface-2);
  }
  .ligne__icone {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--p-soft);
    color: var(--p-ink);
  }
  .ligne__corps {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }
  .ligne__titre {
    font-family: var(--font-cond);
    font-size: 1.15rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .ligne__resume {
    font-size: 0.9rem;
    color: var(--ink-2);
  }
  .ligne__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.15rem 0.6rem;
    font-size: 0.82rem;
    white-space: nowrap;
    color: var(--ink-3);
  }
  .ligne__pj {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
  }
  .ligne__fin {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    color: var(--ink-3);
    align-self: center;
  }
  .ligne__montant {
    font-family: var(--font-cond);
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--ink);
  }
</style>

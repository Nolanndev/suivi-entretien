<script>
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import CalendarDays from '@lucide/svelte/icons/calendar-days'
  import Gauge from '@lucide/svelte/icons/gauge'
  import Wrench from '@lucide/svelte/icons/wrench'
  import House from '@lucide/svelte/icons/house'
  import Warehouse from '@lucide/svelte/icons/warehouse'
  import Package from '@lucide/svelte/icons/package'
  import Hammer from '@lucide/svelte/icons/hammer'
  import Paperclip from '@lucide/svelte/icons/paperclip'
  import StickyNote from '@lucide/svelte/icons/sticky-note'
  import Check from '@lucide/svelte/icons/check'
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import { db } from '../../db.js'
  import { nav } from '../nav.svelte.js'
  import {
    aujourdhui,
    chargerEntretien,
    enregistrerEntretien,
    formatEuros,
    totalPieces,
  } from '../entretiens.js'
  import { operationsPour, operationParId, operationDe } from '../operations.js'
  import Header from '../Header.svelte'
  import MontantInput from '../MontantInput.svelte'
  import DetailsOperation from '../DetailsOperation.svelte'
  import LignesPieces from '../LignesPieces.svelte'
  import EditeurPiecesJointes from '../EditeurPiecesJointes.svelte'

  // Formulaire court, pensé pour le garage : création ou modification.
  let { vehiculeId, entretienId = null } = $props()

  let vehicule = $state(null)
  let pret = $state(false)

  let date = $state(aujourdhui())
  let compteur = $state('')
  let operationId = $state('vidange')
  let precision = $state('') // libellé libre pour "Autre"
  let details = $state({})
  let lieu = $state('soi-même')
  let coutMainOeuvre = $state('')
  let notes = $state('')
  let lignes = $state([])
  let piecesJointes = $state([])
  let supprimees = $state([])

  let enCours = $state(false)
  let erreur = $state('')

  onMount(async () => {
    vehicule = await db.vehicules.get(vehiculeId)
    if (entretienId) {
      const { entretien: e, lignes: l, piecesJointes: pj } = await chargerEntretien(entretienId)
      if (e) {
        const op = operationDe(e)
        date = e.date
        compteur = e.compteur ?? ''
        operationId = op.id
        precision = op.id === 'autre' ? e.typeOperation : ''
        details = structuredClone($state.snapshot(e.details || {}))
        lieu = e.lieu || 'soi-même'
        coutMainOeuvre = e.coutMainOeuvre || ''
        notes = e.notes || ''
        lignes = l.map((x) => ({ ...x }))
        piecesJointes = pj.map((x) => ({ ...x, montant: x.montant ?? '' }))
      }
    } else {
      compteur = vehicule?.compteurActuel ?? ''
    }
    pret = true
  })

  const typeVehicule = $derived(vehicule?.type || 'voiture')
  const operations = $derived(operationsPour(typeVehicule))
  const operation = $derived(operationParId(operationId))
  const total = $derived((Number(coutMainOeuvre) || 0) + totalPieces(lignes))

  function choisirOperation(id) {
    if (id === operationId) return
    operationId = id
    details = {}
  }

  async function enregistrer() {
    const libelle = operationId === 'autre' ? precision.trim() : operation.label
    if (!libelle) {
      erreur = 'Précisez l’opération réalisée.'
      return
    }
    if (!date) {
      erreur = 'Indiquez la date de l’entretien.'
      return
    }
    erreur = ''
    enCours = true
    try {
      const id = await enregistrerEntretien({
        id: entretienId,
        vehiculeId,
        entretien: {
          date,
          compteur: Number(compteur) || 0,
          operationId,
          typeOperation: libelle,
          details: $state.snapshot(details),
          lieu,
          coutMainOeuvre: Number(coutMainOeuvre) || 0,
          notes: notes.trim(),
        },
        lignes: $state.snapshot(lignes),
        piecesJointes: piecesJointes.map((p) => ({ ...$state.snapshot(p), blob: p.blob })),
        supprimees: $state.snapshot(supprimees),
      })
      if (entretienId) nav.retour()
      else nav.remplacer('entretien', { entretienId: id })
    } catch (e) {
      console.error(e)
      erreur = 'L’enregistrement a échoué. Vos saisies sont conservées, réessayez.'
    } finally {
      enCours = false
    }
  }
</script>

<Header titre={entretienId ? 'Modifier l’entretien' : 'Nouvel entretien'} onRetour={() => nav.retour()} />

{#if pret}
  <div class="screen t-{typeVehicule}" in:fade={{ duration: 160 }}>
    <div class="field-row">
      <label class="field">
        <span class="field__label"><CalendarDays size={14} />Date</span>
        <input type="date" bind:value={date} />
      </label>
      <label class="field">
        <span class="field__label"><Gauge size={14} />Compteur ({vehicule?.uniteCompteur === 'heures' ? 'h' : 'km'})</span>
        <input class="num" type="number" inputmode="numeric" bind:value={compteur} />
      </label>
    </div>

    <div class="field">
      <span class="field__label"><Wrench size={14} />Opération</span>
      <div class="operations" role="group" aria-label="Type d’opération">
        {#each operations as op (op.id)}
          <button
            type="button"
            class="operation"
            class:plaque={operationId === op.id}
            aria-pressed={operationId === op.id}
            onclick={() => choisirOperation(op.id)}
          >
            <op.icon size={22} />
            <span>{op.label}</span>
          </button>
        {/each}
      </div>
    </div>

    {#if operationId === 'autre'}
      <label class="field" transition:slide={{ duration: 180 }}>
        <span class="field__label">Précisez</span>
        <input type="text" bind:value={precision} placeholder="Ex. remplacement du rétroviseur" />
      </label>
    {/if}

    {#key operationId}
      <div class="details" in:fade={{ duration: 160 }}>
        <DetailsOperation operation={operation} bind:details {typeVehicule} />
      </div>
    {/key}

    <div class="field">
      <span class="field__label">Lieu</span>
      <div class="segmented" role="group" aria-label="Lieu">
        <button type="button" aria-pressed={lieu === 'soi-même'} onclick={() => (lieu = 'soi-même')}>
          <House size={18} />Soi-même
        </button>
        <button type="button" aria-pressed={lieu === 'garage'} onclick={() => (lieu = 'garage')}>
          <Warehouse size={18} />Garage
        </button>
      </div>
    </div>

    <h2 class="section-title"><Package size={20} />Pièces</h2>
    <LignesPieces bind:lignes />

    <label class="field">
      <span class="field__label"><Hammer size={14} />Main d’œuvre (€)</span>
      <MontantInput class="num mo" bind:value={coutMainOeuvre} placeholder="0,00" />
    </label>

    <div class="total">
      <span>Total de l’entretien</span>
      <strong class="num">{formatEuros(total)}</strong>
    </div>

    <h2 class="section-title"><Paperclip size={20} />Photos, factures, documents</h2>
    <EditeurPiecesJointes bind:elements={piecesJointes} bind:supprimees />

    <label class="field">
      <span class="field__label"><StickyNote size={14} />Notes</span>
      <textarea rows="3" bind:value={notes} placeholder="Couple de serrage, huile utilisée, remarques…"></textarea>
    </label>

    {#if erreur}
      <p class="erreur" transition:fade={{ duration: 150 }}><CircleAlert size={18} />{erreur}</p>
    {/if}
  </div>

  <div class="barre-action">
    <button class="btn btn--primary btn--block" onclick={enregistrer} disabled={enCours}>
      <Check size={20} />
      {enCours ? 'Enregistrement…' : entretienId ? 'Enregistrer les modifications' : 'Enregistrer l’entretien'}
    </button>
  </div>
{/if}

<style>
  .operations {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  .operation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-height: 74px;
    padding: 0.55rem 0.25rem;
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    background: var(--surface);
    color: var(--ink-2);
    font-size: 0.85rem;
    font-weight: 500;
    line-height: 1.15;
    text-align: center;
    transition: transform 120ms var(--ease), background-color 180ms var(--ease), color 180ms var(--ease);
  }
  .operation:active {
    transform: scale(0.95);
  }
  .operation.plaque {
    color: var(--p-ink);
    font-weight: 600;
    border-radius: var(--r-md);
  }
  .details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .details:empty {
    display: none;
  }
  :global(input.mo) {
    text-align: right;
  }
  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.8rem 0.25rem 0;
    border-top: 2px solid var(--ink);
    font-family: var(--font-cond);
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .total strong {
    font-size: 1.45rem;
  }
</style>

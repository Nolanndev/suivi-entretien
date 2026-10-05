<script>
  import { fade, slide } from 'svelte/transition'
  import SquarePen from '@lucide/svelte/icons/square-pen'
  import CalendarDays from '@lucide/svelte/icons/calendar-days'
  import Gauge from '@lucide/svelte/icons/gauge'
  import House from '@lucide/svelte/icons/house'
  import Warehouse from '@lucide/svelte/icons/warehouse'
  import Package from '@lucide/svelte/icons/package'
  import Paperclip from '@lucide/svelte/icons/paperclip'
  import StickyNote from '@lucide/svelte/icons/sticky-note'
  import Trash from '@lucide/svelte/icons/trash-2'
  import Hammer from '@lucide/svelte/icons/hammer'
  import { db } from '../../db.js'
  import { liveData } from '../liveQuery.svelte.js'
  import { nav } from '../nav.svelte.js'
  import {
    formatDate,
    formatEuros,
    formatNombre,
    totalLigne,
    totalEntretien,
    supprimerEntretien,
  } from '../entretiens.js'
  import { operationDe, libellePosition } from '../operations.js'
  import Header from '../Header.svelte'
  import GrillePiecesJointes from '../GrillePiecesJointes.svelte'

  let { entretienId } = $props()

  const entretien = liveData(() => db.entretiens.get(entretienId), undefined)
  const vehicule = liveData(async () => {
    const e = await db.entretiens.get(entretienId)
    return e ? db.vehicules.get(e.vehiculeId) : undefined
  }, undefined)
  const lignes = liveData(() => db.piecesUtilisees.where('entretienId').equals(entretienId).toArray(), [])
  const piecesJointes = liveData(() => db.photos.where('entretienId').equals(entretienId).toArray(), [])

  const op = $derived(operationDe(entretien.value))
  const type = $derived(vehicule.value?.type || 'voiture')
  const total = $derived(totalEntretien(entretien.value, lignes.value))
  const uniteCourte = $derived(vehicule.value?.uniteCompteur === 'heures' ? 'h' : 'km')

  let confirmer = $state(false)
  let suppression = $state(false)

  async function supprimer() {
    suppression = true
    await supprimerEntretien(entretienId)
    nav.retour()
  }
</script>

{#if entretien.value}
  {@const e = entretien.value}
  <Header titre={op.id === 'autre' ? e.typeOperation : op.label} onRetour={() => nav.retour()}>
    {#snippet actions()}
      <button
        class="icon-btn"
        onclick={() => nav.aller('form-entretien', { vehiculeId: e.vehiculeId, entretienId })}
        aria-label="Modifier l’entretien"
      >
        <SquarePen size={22} />
      </button>
    {/snippet}
  </Header>

  <div class="screen t-{type}">
    <section class="plaque resume">
      <div class="resume__haut">
        <span class="resume__badge"><op.icon size={24} /></span>
        <div>
          <h2 class="resume__titre">{op.id === 'autre' ? e.typeOperation : op.label}</h2>
          {#if vehicule.value}<span class="resume__vehicule">{vehicule.value.nom}</span>{/if}
        </div>
      </div>

      {#if op.groupes.some((g) => e.details?.[g.id]?.length)}
        <dl class="details">
          {#each op.groupes as g (g.id)}
            {#if e.details?.[g.id]?.length}
              <div>
                <dt>{g.label}</dt>
                <dd>
                  {#if g.type === 'position'}
                    <span class="tag">{libellePosition(e.details[g.id], type)}</span>
                  {:else}
                    {#each e.details[g.id] as val (val)}<span class="tag">{val}</span>{/each}
                  {/if}
                </dd>
              </div>
            {/if}
          {/each}
        </dl>
      {/if}

      <div class="faits">
        <div><CalendarDays size={18} /><span class="num">{formatDate(e.date)}</span></div>
        <div><Gauge size={18} /><span class="num">{formatNombre(e.compteur)} {uniteCourte}</span></div>
        <div>
          {#if e.lieu === 'garage'}<Warehouse size={18} /><span>Garage</span>{:else}<House size={18} /><span>Soi-même</span>{/if}
        </div>
      </div>
    </section>

    <section class="bloc">
      <h2 class="section-title"><Package size={20} />Coûts</h2>
      <div class="panneau couts">
        {#each lignes.value as l (l.id)}
          <div class="cout">
            <div class="cout__nom">
              <span>{l.nom}</span>
              {#if l.reference}<span class="cout__ref num">Réf. {l.reference}</span>{/if}
            </div>
            <span class="cout__calcul num">{l.quantite} × {formatEuros(l.prixUnitaire)}</span>
            <span class="cout__montant num">{formatEuros(totalLigne(l))}</span>
          </div>
        {/each}
        <div class="cout">
          <div class="cout__nom"><span class="cout__mo"><Hammer size={15} />Main d’œuvre</span></div>
          <span></span>
          <span class="cout__montant num">{formatEuros(e.coutMainOeuvre)}</span>
        </div>
        <div class="cout cout--total">
          <span>Total</span>
          <span></span>
          <strong class="num">{formatEuros(total)}</strong>
        </div>
      </div>
    </section>

    {#if piecesJointes.value.length}
      <section class="bloc">
        <h2 class="section-title"><Paperclip size={20} />Photos et factures</h2>
        <GrillePiecesJointes elements={piecesJointes.value} />
      </section>
    {/if}

    {#if e.notes}
      <section class="bloc">
        <h2 class="section-title"><StickyNote size={20} />Notes</h2>
        <p class="notes">{e.notes}</p>
      </section>
    {/if}

    <!-- Action destructrice isolée, loin de « Modifier » -->
    <div class="danger">
      {#if confirmer}
        <div class="danger__confirm" transition:slide={{ duration: 180 }}>
          <p>Supprimer cet entretien, ses pièces et ses pièces jointes ? C’est définitif.</p>
          <div class="danger__actions">
            <button class="btn btn--secondary" onclick={() => (confirmer = false)}>Annuler</button>
            <button class="btn btn--danger" onclick={supprimer} disabled={suppression}>
              <Trash size={18} /> Supprimer
            </button>
          </div>
        </div>
      {:else}
        <button class="btn btn--ghost danger__ouvrir" onclick={() => (confirmer = true)} in:fade={{ duration: 120 }}>
          <Trash size={18} /> Supprimer l’entretien
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .resume {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.1rem;
  }
  .resume__haut {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  .resume__badge {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--p);
    color: var(--p-soft);
    box-shadow: inset 0 0 0 2px var(--p), inset 0 0 0 3px color-mix(in oklab, var(--p-soft) 70%, transparent);
    flex-shrink: 0;
  }
  .resume__titre {
    font-size: 1.5rem;
    text-transform: uppercase;
  }
  .resume__vehicule {
    font-size: 0.9rem;
    color: var(--p-ink);
  }
  .details {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0;
  }
  .details dt {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--p-ink);
    margin-bottom: 0.25rem;
  }
  .details dd {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin: 0;
  }
  .tag {
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    background: var(--surface);
    border: 1px solid color-mix(in oklab, var(--p) 35%, transparent);
    font-size: 0.92rem;
    font-weight: 500;
  }
  .faits {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    padding-top: 0.85rem;
    border-top: 1px dashed color-mix(in oklab, var(--p) 40%, transparent);
  }
  .faits div {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 500;
    white-space: nowrap;
  }
  .faits :global(svg) {
    color: var(--p-ink);
  }
  .bloc {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .couts {
    padding: 0.25rem 0.9rem;
  }
  .cout {
    display: grid;
    grid-template-columns: 1fr auto 5.5rem;
    gap: 0.6rem;
    align-items: baseline;
    padding: 0.7rem 0;
  }
  .cout + .cout {
    border-top: 1px solid var(--line);
  }
  .cout__nom {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .cout__ref {
    font-size: 0.82rem;
    color: var(--ink-3);
  }
  .cout__mo {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .cout__calcul {
    font-size: 0.85rem;
    color: var(--ink-2);
    white-space: nowrap;
  }
  .cout__montant {
    text-align: right;
    font-weight: 500;
  }
  .cout--total {
    border-top: 2px solid var(--ink) !important;
    font-family: var(--font-cond);
    font-size: 1.15rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .cout--total strong {
    text-align: right;
    font-size: 1.3rem;
  }
  .notes {
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.5;
    max-width: 65ch;
  }
  .danger {
    margin-top: 2.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
  }
  .danger__ouvrir {
    width: 100%;
    color: var(--danger);
  }
  .danger__confirm {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: var(--r-lg);
    background: var(--danger-soft);
  }
  .danger__confirm p {
    margin: 0;
  }
  .danger__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
</style>

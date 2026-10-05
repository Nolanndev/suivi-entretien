<script>
  import { slide } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import Package from '@lucide/svelte/icons/package'
  import PackagePlus from '@lucide/svelte/icons/package-plus'
  import Trash from '@lucide/svelte/icons/trash-2'
  import Hash from '@lucide/svelte/icons/hash'
  import History from '@lucide/svelte/icons/history'
  import MontantInput from './MontantInput.svelte'
  import { chercherPieces, totalLigne, totalPieces, formatEuros } from './entretiens.js'

  // Lignes de pièces d'un entretien : nom (suggéré depuis le catalogue),
  // référence, quantité, prix unitaire. Le total est recalculé en direct.
  let { lignes = $bindable([]) } = $props()

  let suggestions = $state([])
  let ligneActive = $state(null)
  let compteur = 0

  function ajouter() {
    lignes = [...lignes, { cle: `l${++compteur}`, nom: '', reference: '', quantite: 1, prixUnitaire: '' }]
  }

  function retirer(i) {
    lignes = lignes.filter((_, j) => j !== i)
  }

  async function chercher(i) {
    ligneActive = i
    suggestions = await chercherPieces(lignes[i].nom || '')
  }

  function choisir(i, piece) {
    lignes[i].nom = piece.nom
    lignes[i].reference = piece.reference || ''
    suggestions = []
    ligneActive = null
  }

  function fermerSuggestions() {
    // laisse le temps au toucher sur une suggestion d'être pris en compte
    setTimeout(() => {
      suggestions = []
      ligneActive = null
    }, 150)
  }

  const total = $derived(totalPieces(lignes))
</script>

<div class="lignes">
  {#each lignes as l, i (l.id ?? l.cle)}
    <div class="ligne" transition:slide={{ duration: 200, easing: cubicOut }}>
      <div class="ligne__nom">
        <span class="ligne__icone"><Package size={18} /></span>
        <input
          type="text"
          placeholder="Pièce (ex. plaquettes avant)"
          aria-label="Nom de la pièce"
          autocomplete="off"
          bind:value={l.nom}
          oninput={() => chercher(i)}
          onfocus={() => chercher(i)}
          onblur={fermerSuggestions}
        />
        <button type="button" class="icon-btn" onclick={() => retirer(i)} aria-label="Retirer la pièce">
          <Trash size={19} />
        </button>
        {#if ligneActive === i && suggestions.length}
          <ul class="suggestions" role="listbox" transition:slide={{ duration: 140 }}>
            {#each suggestions as p (p.id)}
              <li>
                <button type="button" role="option" aria-selected="false" onmousedown={(e) => e.preventDefault()} onclick={() => choisir(i, p)}>
                  <History size={15} />
                  <span class="suggestions__nom">{p.nom}</span>
                  {#if p.reference}<span class="suggestions__ref">{p.reference}</span>{/if}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="ligne__chiffres">
        <label class="mini">
          <span><Hash size={12} />Réf.</span>
          <input type="text" autocomplete="off" bind:value={l.reference} placeholder="—" />
        </label>
        <label class="mini mini--qte">
          <span>Qté</span>
          <input type="number" inputmode="numeric" min="1" step="1" bind:value={l.quantite} />
        </label>
        <label class="mini mini--prix">
          <span>Prix u. €</span>
          <MontantInput bind:value={l.prixUnitaire} placeholder="0,00" />
        </label>
      </div>
      <div class="ligne__total num">{formatEuros(totalLigne(l))}</div>
    </div>
  {/each}

  <button type="button" class="btn btn--secondary btn--block" onclick={ajouter}>
    <PackagePlus size={20} /> Ajouter une pièce
  </button>

  {#if lignes.length}
    <div class="lignes__total">
      <span>Total pièces</span>
      <strong class="num">{formatEuros(total)}</strong>
    </div>
  {/if}
</div>

<style>
  .lignes {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .ligne {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.6rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
  }
  .ligne__nom {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.35rem;
  }
  .ligne__icone {
    display: grid;
    place-items: center;
    width: 32px;
    color: var(--blue);
  }
  .ligne__nom .icon-btn {
    color: var(--ink-3);
  }
  .ligne__chiffres {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.45rem;
  }
  .mini {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }
  .mini:first-child {
    grid-column: 1 / -1;
  }
  .mini span {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-2);
  }
  .mini input {
    min-height: 42px !important;
    padding: 0.5rem 0.6rem !important;
  }
  .mini--qte input,
  .mini--prix :global(input) {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .ligne__total {
    align-self: flex-end;
    font-family: var(--font-cond);
    font-size: 1.1rem;
    font-weight: 600;
  }
  .lignes__total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0 0.25rem;
    color: var(--ink-2);
  }
  .lignes__total strong {
    font-family: var(--font-cond);
    font-size: 1.2rem;
    color: var(--ink);
  }
  .suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 30;
    list-style: none;
    margin: 0;
    padding: 0.3rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-float);
  }
  .suggestions button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    min-height: 44px;
    padding: 0.4rem 0.6rem;
    border: none;
    border-radius: var(--r-sm);
    background: transparent;
    text-align: left;
    color: var(--ink);
  }
  .suggestions button:hover {
    background: var(--surface-2);
  }
  .suggestions :global(svg) {
    color: var(--ink-3);
    flex-shrink: 0;
  }
  .suggestions__nom {
    flex: 1;
    min-width: 0;
  }
  .suggestions__ref {
    font-size: 0.85rem;
    color: var(--ink-2);
    font-variant-numeric: tabular-nums;
  }
</style>

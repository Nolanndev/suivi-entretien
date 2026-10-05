<script>
  import FileText from '@lucide/svelte/icons/file-text'
  import Receipt from '@lucide/svelte/icons/receipt-euro'
  import BlobImg from './BlobImg.svelte'
  import { nav } from './nav.svelte.js'
  import { formatEuros } from './entretiens.js'

  // Vignettes en lecture seule ; un toucher ouvre la visionneuse.
  let { elements = [], colonnes = 3 } = $props()
</script>

<div class="grille" style:--colonnes={colonnes}>
  {#each elements as el, i (el.id ?? el.cle ?? i)}
    <button
      type="button"
      class="grille__item"
      onclick={() => nav.ouvrirVisionneuse(elements, i)}
      aria-label="Agrandir {el.kind === 'facture' ? 'la facture' : el.kind === 'document' ? 'le document' : 'la photo'}"
    >
      {#if el.mime === 'application/pdf'}
        <span class="grille__pdf"><FileText size={28} strokeWidth={1.5} /><span>PDF</span></span>
      {:else}
        <BlobImg blob={el.blob} alt="" loading="lazy" />
      {/if}
      {#if el.kind === 'facture'}
        <span class="grille__badge">
          <Receipt size={13} strokeWidth={2} />
          {#if el.montant != null}<span class="num">{formatEuros(el.montant)}</span>{:else}Facture{/if}
        </span>
      {:else if el.kind === 'document'}
        <span class="grille__badge"><FileText size={13} strokeWidth={2} />Doc</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .grille {
    display: grid;
    grid-template-columns: repeat(var(--colonnes), 1fr);
    gap: 0.5rem;
  }
  .grille__item {
    position: relative;
    aspect-ratio: 1;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    overflow: hidden;
    background: var(--surface-2);
    transition: transform 140ms var(--ease);
  }
  .grille__item:active {
    transform: scale(0.96);
  }
  .grille__item :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .grille__pdf {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.2rem;
    height: 100%;
    color: var(--ink-2);
    font-family: var(--font-cond);
    font-weight: 600;
    letter-spacing: 0.06em;
  }
  .grille__badge {
    position: absolute;
    left: 0.3rem;
    bottom: 0.3rem;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.1rem 0.4rem;
    border-radius: 6px;
    background: var(--amber-soft);
    color: var(--amber-ink);
    font-size: 0.72rem;
    font-weight: 600;
  }
</style>

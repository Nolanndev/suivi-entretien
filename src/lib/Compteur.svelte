<script>
  // Le compteur composé en chiffres émaillés, comme une plaque de numéro.
  let { valeur = 0, unite = 'km', taille = 'md' } = $props()

  const groupes = $derived.by(() => {
    const s = String(Math.max(0, Math.round(Number(valeur) || 0)))
    const out = []
    for (let i = s.length; i > 0; i -= 3) out.unshift(s.slice(Math.max(0, i - 3), i))
    return out
  })
  const libelleUnite = $derived(unite === 'heures' ? 'h' : unite)
</script>

<span
  class="compteur compteur--{taille}"
  role="img"
  aria-label="{Number(valeur) || 0} {unite}"
>
  {#each groupes as g, gi (gi)}
    <span class="compteur__groupe">
      {#each g.split('') as c, ci (ci)}
        <span class="compteur__chiffre">{c}</span>
      {/each}
    </span>
  {/each}
  <span class="compteur__unite">{libelleUnite}</span>
</span>

<style>
  .compteur {
    display: inline-flex;
    align-items: center;
    gap: 0.28em;
    font-family: var(--font-cond);
    font-weight: 600;
    line-height: 1;
  }
  .compteur__groupe {
    display: inline-flex;
    gap: 2px;
  }
  .compteur__chiffre {
    display: inline-grid;
    place-items: center;
    width: 1.05em;
    height: 1.45em;
    border-radius: 0.2em;
    background: var(--tile);
    color: var(--tile-ink);
    box-shadow: inset 0 0 0 1.5px var(--tile), inset 0 0 0 2.5px var(--tile-rim);
    font-variant-numeric: tabular-nums;
  }
  .compteur__unite {
    margin-left: 0.15em;
    font-size: 0.72em;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--p-ink, var(--ink-2));
  }
  .compteur--sm { font-size: 0.95rem; }
  .compteur--md { font-size: 1.25rem; }
  .compteur--lg { font-size: 1.85rem; }
  .compteur--lg .compteur__groupe { gap: 3px; }
</style>

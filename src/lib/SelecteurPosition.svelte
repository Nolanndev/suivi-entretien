<script>
  import { ROUES } from './operations.js'

  // Sélection des roues concernées, vue de dessus (avant en haut).
  // Voiture / motoculture : 4 roues + raccourcis Tous / Avant / Arrière.
  // Moto : avant / arrière.
  let { valeurs = $bindable([]), typeVehicule = 'voiture' } = $props()

  const deuxRoues = $derived(typeVehicule === 'moto')
  const actives = $derived(new Set(valeurs))

  function basculer(r) {
    const s = new Set(valeurs)
    s.has(r) ? s.delete(r) : s.add(r)
    valeurs = ordonner([...s])
  }

  function ordonner(liste) {
    const ordre = deuxRoues ? ['AV', 'AR'] : ROUES
    return ordre.filter((r) => liste.includes(r))
  }

  function raccourci(liste) {
    const memes = liste.length === valeurs.length && liste.every((r) => actives.has(r))
    valeurs = memes ? [] : [...liste]
  }

  const RACCOURCIS = $derived(
    deuxRoues
      ? [{ label: 'Les deux', roues: ['AV', 'AR'] }]
      : [
          { label: 'Tous', roues: ROUES },
          { label: 'Avant', roues: ['AVG', 'AVD'] },
          { label: 'Arrière', roues: ['ARG', 'ARD'] },
        ]
  )

  function estRaccourci(liste) {
    return liste.length === valeurs.length && liste.every((r) => actives.has(r))
  }

  const LIBELLES = { AVG: 'AV G', AVD: 'AV D', ARG: 'AR G', ARD: 'AR D', AV: 'Avant', AR: 'Arrière' }
</script>

<div class="position">
  <div class="chips">
    {#each RACCOURCIS as r (r.label)}
      <button type="button" class="chip" aria-pressed={estRaccourci(r.roues)} onclick={() => raccourci(r.roues)}>
        {r.label}
      </button>
    {/each}
  </div>

  <div class="schema" class:schema--moto={deuxRoues}>
    <svg class="schema__caisse" viewBox="0 0 60 120" aria-hidden="true">
      {#if deuxRoues}
        <path d="M30 12 L30 108" />
        <path d="M18 30 L42 30" />
        <rect x="24" y="44" width="12" height="34" rx="6" />
      {:else}
        <rect x="8" y="6" width="44" height="108" rx="14" />
        <path d="M13 34 Q30 26 47 34" />
        <path d="M13 92 Q30 98 47 92" />
      {/if}
    </svg>
    {#each deuxRoues ? ['AV', 'AR'] : ROUES as r (r)}
      <button
        type="button"
        class="roue roue--{r.toLowerCase()}"
        aria-pressed={actives.has(r)}
        onclick={() => basculer(r)}
      >
        <span class="roue__pneu"></span>
        <span class="roue__label">{LIBELLES[r]}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .position {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .schema {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 64px 1fr;
    grid-template-rows: auto auto;
    row-gap: 2.2rem;
    align-items: center;
    padding: 0.5rem 0;
    max-width: 22rem;
    margin: 0 auto;
    width: 100%;
  }
  .schema__caisse {
    grid-column: 2;
    grid-row: 1 / 3;
    width: 64px;
    height: 128px;
    fill: none;
    stroke: var(--ink-3);
    stroke-width: 1.75;
    stroke-linecap: round;
  }
  .schema--moto {
    grid-template-columns: 64px auto;
    justify-content: center;
    column-gap: 1.25rem;
    row-gap: 1.2rem;
  }
  .schema--moto .schema__caisse {
    grid-column: 1;
  }
  .roue {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 48px;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    background: var(--surface);
    color: var(--ink-2);
    font-family: var(--font-cond);
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.04em;
    transition: background-color 160ms var(--ease), border-color 160ms var(--ease), color 160ms var(--ease),
      transform 120ms var(--ease);
  }
  .roue:active {
    transform: scale(0.95);
  }
  .roue__pneu {
    width: 12px;
    height: 26px;
    border-radius: 4px;
    border: 2px solid currentColor;
    transition: background-color 160ms var(--ease);
  }
  .roue[aria-pressed='true'] {
    background: var(--blue-soft);
    border-color: var(--blue);
    color: var(--blue-ink);
  }
  .roue[aria-pressed='true'] .roue__pneu {
    background: var(--blue);
    border-color: var(--blue);
  }
  .roue--avg { grid-column: 1; grid-row: 1; justify-self: end; flex-direction: row-reverse; }
  .roue--avd { grid-column: 3; grid-row: 1; justify-self: start; }
  .roue--arg { grid-column: 1; grid-row: 2; justify-self: end; flex-direction: row-reverse; }
  .roue--ard { grid-column: 3; grid-row: 2; justify-self: start; }
  .roue--av { grid-column: 2; grid-row: 1; justify-self: start; }
  .roue--ar { grid-column: 2; grid-row: 2; justify-self: start; }
</style>

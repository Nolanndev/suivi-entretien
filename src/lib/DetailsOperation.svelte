<script>
  import { slide } from 'svelte/transition'
  import Check from '@lucide/svelte/icons/check'
  import SelecteurPosition from './SelecteurPosition.svelte'
  import { optionsDuGroupe } from './operations.js'

  // Détails d'une opération : un bloc par groupe défini dans operations.js.
  let { operation, details = $bindable({}), typeVehicule = 'voiture' } = $props()

  function basculer(groupeId, option) {
    const actuelles = details[groupeId] || []
    details[groupeId] = actuelles.includes(option)
      ? actuelles.filter((o) => o !== option)
      : [...actuelles, option]
  }
</script>

{#each operation.groupes as g (operation.id + g.id)}
  <div class="groupe" transition:slide={{ duration: 200 }}>
    <span class="label">{g.label}</span>
    {#if g.type === 'position'}
      <SelecteurPosition bind:valeurs={() => details[g.id] || [], (v) => (details[g.id] = v)} {typeVehicule} />
    {:else}
      <div class="chips">
        {#each optionsDuGroupe(g, typeVehicule) as o (o)}
          {@const actif = (details[g.id] || []).includes(o)}
          <button type="button" class="chip" aria-pressed={actif} onclick={() => basculer(g.id, o)}>
            {#if actif}<Check size={15} strokeWidth={2.5} />{/if}{o}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/each}

<style>
  .groupe {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>

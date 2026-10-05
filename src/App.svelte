<script>
  import { onMount } from 'svelte'
  import { demanderStockagePersistant } from './db.js'
  import { nav } from './lib/nav.svelte.js'
  import { theme } from './lib/theme.svelte.js'
  import Visionneuse from './lib/Visionneuse.svelte'
  import Accueil from './lib/screens/Accueil.svelte'
  import AjouterVehicule from './lib/screens/AjouterVehicule.svelte'
  import FicheVehicule from './lib/screens/FicheVehicule.svelte'
  import DetailEntretien from './lib/screens/DetailEntretien.svelte'
  import FormEntretien from './lib/screens/FormEntretien.svelte'

  onMount(() => {
    theme.init()
    demanderStockagePersistant()
  })

  const courant = $derived(nav.courant)
</script>

<main class="app">
  {#key courant}
    {#if courant.ecran === 'accueil'}
      <Accueil />
    {:else if courant.ecran === 'ajouter-vehicule'}
      <AjouterVehicule />
    {:else if courant.ecran === 'vehicule'}
      <FicheVehicule vehiculeId={courant.params.vehiculeId} />
    {:else if courant.ecran === 'entretien'}
      <DetailEntretien entretienId={courant.params.entretienId} />
    {:else if courant.ecran === 'form-entretien'}
      <FormEntretien vehiculeId={courant.params.vehiculeId} entretienId={courant.params.entretienId ?? null} />
    {/if}
  {/key}
</main>

{#if nav.visionneuse}
  <Visionneuse elements={nav.visionneuse.elements} index={nav.visionneuse.index} />
{/if}

<style>
  .app {
    min-height: 100vh;
    min-height: 100dvh;
  }
</style>

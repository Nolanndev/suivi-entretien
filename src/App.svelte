<script>
  import { onMount, flushSync } from 'svelte'
  import { demanderStockagePersistant } from './db.js'
  import { nav } from './lib/nav.svelte.js'
  import { theme } from './lib/theme.svelte.js'
  import { activerChampSuivant } from './lib/champSuivant.js'
  import Visionneuse from './lib/Visionneuse.svelte'
  import Accueil from './lib/screens/Accueil.svelte'
  import AjouterVehicule from './lib/screens/AjouterVehicule.svelte'
  import FicheVehicule from './lib/screens/FicheVehicule.svelte'
  import DetailEntretien from './lib/screens/DetailEntretien.svelte'
  import FormEntretien from './lib/screens/FormEntretien.svelte'
  import Sauvegarde from './lib/screens/Sauvegarde.svelte'

  let defilDevant = $state()
  let defilDessous = $state()

  onMount(() => {
    theme.init()
    demanderStockagePersistant()
    nav.definirConteneur(defilDevant)
    const arreter = activerChampSuivant()
    // touchmove non passif : nécessaire pour bloquer le défilement pendant le geste
    const opts = { passive: false }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, opts)
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      arreter()
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove, opts)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  })

  const courant = $derived(nav.courant)

  // --- Balayage depuis le bord gauche pour revenir en arrière (comme iOS) ---
  const BORD = 28 // zone de départ en px
  let geste = null // { x0, y0, t0, verrouille }
  let glisse = $state(false) // l'écran précédent est monté dessous
  let entreeDessous = $state(null) // figée au début du geste
  let bascule = $state(false) // retour validé : on masque le devant le temps du rendu
  let dx = $state(0)
  let anime = $state(false) // transition CSS de fin de geste

  const largeur = () => window.innerWidth

  function onTouchStart(e) {
    if (e.touches.length !== 1 || !nav.precedent || nav.visionneuse || anime) return
    const t = e.touches[0]
    if (t.clientX > BORD) return
    geste = { x0: t.clientX, y0: t.clientY, t0: performance.now(), verrouille: false }
  }

  function onTouchMove(e) {
    if (!geste) return
    const t = e.touches[0]
    const ddx = t.clientX - geste.x0
    const ddy = t.clientY - geste.y0
    if (!geste.verrouille) {
      if (Math.abs(ddy) > 10 && Math.abs(ddy) > Math.abs(ddx)) {
        geste = null
        return
      }
      if (ddx < 10) return
      geste.verrouille = true
      document.activeElement?.blur?.()
      entreeDessous = nav.precedent
      glisse = true
      queueMicrotask(() => {
        if (defilDessous) defilDessous.scrollTop = entreeDessous?.defilement || 0
      })
    }
    e.preventDefault()
    dx = Math.max(0, ddx)
  }

  function onTouchEnd() {
    if (!geste) return
    const { verrouille, t0 } = geste
    geste = null
    if (!verrouille) return
    const vitesse = dx / Math.max(1, performance.now() - t0) // px/ms
    const valide = dx > largeur() * 0.35 || (vitesse > 0.45 && dx > 40)
    anime = true
    dx = valide ? largeur() : 0
    setTimeout(() => {
      if (valide) {
        bascule = true
        flushSync(() => nav.retour({ anime: false }))
        // laisse le nouvel écran charger ses données avant de retirer le dessous
        setTimeout(() => {
          glisse = false
          bascule = false
        }, 140)
      } else {
        glisse = false
      }
      anime = false
      dx = 0
    }, 230)
  }

  const progression = $derived(glisse ? Math.min(1, dx / largeur()) : 0)
</script>

{#snippet ecran(entree)}
  {#if entree.ecran === 'accueil'}
    <Accueil />
  {:else if entree.ecran === 'ajouter-vehicule'}
    <AjouterVehicule />
  {:else if entree.ecran === 'vehicule'}
    <FicheVehicule vehiculeId={entree.params.vehiculeId} />
  {:else if entree.ecran === 'entretien'}
    <DetailEntretien entretienId={entree.params.entretienId} />
  {:else if entree.ecran === 'form-entretien'}
    <FormEntretien vehiculeId={entree.params.vehiculeId} entretienId={entree.params.entretienId ?? null} />
  {:else if entree.ecran === 'sauvegarde'}
    <Sauvegarde />
  {/if}
{/snippet}

<main class="app">
  {#if glisse && entreeDessous}
    <div
      class="couche couche--dessous"
      inert
      style:transform="translateX({-28 * (1 - progression)}%)"
      class:anime
    >
      <div class="couche__defil" bind:this={defilDessous}>
        {@render ecran(entreeDessous)}
      </div>
      <div class="couche__voile" style:opacity={0.18 * (1 - progression)}></div>
    </div>
  {/if}

  <div
    class="couche couche--devant"
    class:glisse
    class:anime
    class:bascule
    style:transform={glisse && !bascule ? `translateX(${dx}px)` : null}
  >
    <div class="couche__defil" bind:this={defilDevant}>
      {#key courant}
        {@render ecran(courant)}
      {/key}
    </div>
  </div>
</main>

{#if nav.visionneuse}
  <Visionneuse elements={nav.visionneuse.elements} index={nav.visionneuse.index} />
{/if}

<style>
  .app {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--ground);
  }
  /* Chaque écran défile dans sa couche ; une couche transformée devient
     le repère de ses éléments fixes (en-tête, barre d'action), qui
     suivent donc le doigt pendant le balayage. */
  .couche {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--ground);
  }
  .couche__defil {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior-y: contain;
  }
  .couche--devant.glisse {
    box-shadow: -10px 0 28px rgb(0 0 0 / 0.18);
  }
  .couche--devant.bascule {
    visibility: hidden;
  }
  .couche--dessous {
    pointer-events: none;
  }
  .couche__voile {
    position: absolute;
    inset: 0;
    background: #000;
    pointer-events: none;
  }
  .anime {
    transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
</style>

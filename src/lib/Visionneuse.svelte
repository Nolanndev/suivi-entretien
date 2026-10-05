<script>
  import { fade, scale } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import X from '@lucide/svelte/icons/x'
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import FileText from '@lucide/svelte/icons/file-text'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import ZoomIn from '@lucide/svelte/icons/zoom-in'
  import ZoomOut from '@lucide/svelte/icons/zoom-out'
  import { nav } from './nav.svelte.js'
  import { formatEuros } from './entretiens.js'

  // Visionneuse plein écran : glisser pour passer d'une image à l'autre,
  // double-toucher (ou bouton loupe) pour zoomer, glisser vers le bas pour fermer.
  let { elements, index: depart = 0 } = $props()

  // L'index de départ n'est lu qu'à l'ouverture : la visionneuse est
  // recréée à chaque ouverture.
  // svelte-ignore state_referenced_locally
  let index = $state(depart)
  let zoom = $state(false)
  let conteneur = $state()
  let decalage = $state({ x: 0, y: 0 })
  let debut = $state(null)

  const courant = $derived(elements[index])
  const estPdf = $derived(courant?.mime === 'application/pdf')
  const url = $derived(courant?.blob ? URL.createObjectURL(courant.blob) : null)
  $effect(() => {
    const u = url
    return () => u && URL.revokeObjectURL(u)
  })

  const LIBELLES = { photo: 'Photo', facture: 'Facture', document: 'Document' }

  function aller(delta) {
    const n = index + delta
    if (n < 0 || n >= elements.length) return
    zoom = false
    index = n
  }

  function fermer() {
    nav.fermerVisionneuse()
  }

  function basculerZoom(e) {
    if (estPdf) return
    zoom = !zoom
    if (zoom && conteneur && e?.clientX != null) {
      const r = conteneur.getBoundingClientRect()
      const fx = (e.clientX - r.left) / r.width
      const fy = (e.clientY - r.top) / r.height
      requestAnimationFrame(() => {
        conteneur.scrollLeft = fx * conteneur.scrollWidth - r.width / 2
        conteneur.scrollTop = fy * conteneur.scrollHeight - r.height / 2
      })
    }
  }

  function onTouchStart(e) {
    if (zoom || e.touches.length > 1) return
    debut = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchMove(e) {
    if (!debut) return
    decalage = { x: e.touches[0].clientX - debut.x, y: e.touches[0].clientY - debut.y }
  }
  function onTouchEnd() {
    if (!debut) return
    const { x, y } = decalage
    debut = null
    decalage = { x: 0, y: 0 }
    if (Math.abs(x) > 60 && Math.abs(x) > Math.abs(y)) aller(x < 0 ? 1 : -1)
    else if (y > 110) fermer()
  }

  function onKey(e) {
    if (e.key === 'Escape') fermer()
    if (e.key === 'ArrowRight') aller(1)
    if (e.key === 'ArrowLeft') aller(-1)
  }
</script>

<svelte:window onkeydown={onKey} />

<div
  class="visionneuse"
  role="dialog"
  aria-modal="true"
  aria-label="Visionneuse"
  transition:fade={{ duration: 200 }}
>
  <div class="visionneuse__barre">
    <span class="visionneuse__compte num">{index + 1} / {elements.length}</span>
    <div class="visionneuse__outils">
      {#if !estPdf}
        <button class="icon-btn" onclick={basculerZoom} aria-label={zoom ? 'Dézoomer' : 'Zoomer'}>
          {#if zoom}<ZoomOut size={22} />{:else}<ZoomIn size={22} />{/if}
        </button>
      {/if}
      <button class="icon-btn" onclick={fermer} aria-label="Fermer">
        <X size={24} />
      </button>
    </div>
  </div>

  <div
    role="presentation"
    class="visionneuse__scene"
    class:zoom
    bind:this={conteneur}
    ontouchstart={onTouchStart}
    ontouchmove={onTouchMove}
    ontouchend={onTouchEnd}
  >
    {#key index}
      <div
        class="visionneuse__media"
        style:transform={debut ? `translate(${decalage.x}px, ${Math.max(0, decalage.y)}px)` : null}
        in:scale={{ start: 0.96, duration: 220, easing: cubicOut }}
      >
        {#if estPdf}
          <div class="visionneuse__pdf">
            <FileText size={56} strokeWidth={1.5} />
            <span>{courant.nom || 'Document PDF'}</span>
            <a class="btn btn--primary" href={url} target="_blank" rel="noopener">
              <ExternalLink size={18} /> Ouvrir le PDF
            </a>
          </div>
        {:else if url}
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <img src={url} alt={courant.legende || ''} ondblclick={basculerZoom} draggable="false" />
        {/if}
      </div>
    {/key}
  </div>

  {#if elements.length > 1}
    <button class="visionneuse__nav visionneuse__nav--g icon-btn" onclick={() => aller(-1)} disabled={index === 0} aria-label="Précédente">
      <ChevronLeft size={28} />
    </button>
    <button class="visionneuse__nav visionneuse__nav--d icon-btn" onclick={() => aller(1)} disabled={index === elements.length - 1} aria-label="Suivante">
      <ChevronRight size={28} />
    </button>
  {/if}

  <div class="visionneuse__legende">
    <span class="visionneuse__type">{LIBELLES[courant?.kind] || 'Photo'}</span>
    {#if courant?.kind === 'facture' && courant?.montant != null}
      <span class="num">{formatEuros(courant.montant)}</span>
    {/if}
    {#if courant?.legende}<span>{courant.legende}</span>{/if}
  </div>
</div>

<style>
  .visionneuse {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgb(10 14 18 / 0.96);
    color: #eef0ec;
    display: flex;
    flex-direction: column;
  }
  .visionneuse__barre {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: calc(env(safe-area-inset-top, 0px) + 0.5rem) 0.5rem 0.5rem 1rem;
  }
  .visionneuse__compte {
    font-family: var(--font-cond);
    font-size: 1.05rem;
    letter-spacing: 0.04em;
  }
  .visionneuse__outils {
    display: flex;
    gap: 0.25rem;
  }
  .visionneuse .icon-btn {
    color: #eef0ec;
  }
  .visionneuse .icon-btn:hover {
    background: rgb(255 255 255 / 0.1);
  }
  .visionneuse__scene {
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    touch-action: pan-y;
  }
  .visionneuse__scene.zoom {
    overflow: auto;
    place-items: start;
    touch-action: auto;
  }
  .visionneuse__media {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    transition: transform 120ms linear;
  }
  .visionneuse__media img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    user-select: none;
    -webkit-user-select: none;
  }
  .zoom .visionneuse__media {
    width: 250%;
    height: auto;
  }
  .zoom .visionneuse__media img {
    max-width: none;
    max-height: none;
    width: 100%;
  }
  .visionneuse__pdf {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    padding: 2rem;
  }
  .visionneuse__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgb(0 0 0 / 0.35) !important;
  }
  .visionneuse__nav:disabled {
    opacity: 0.25;
  }
  .visionneuse__nav--g { left: 0.5rem; }
  .visionneuse__nav--d { right: 0.5rem; }
  @media (hover: none) {
    .visionneuse__nav { display: none; }
  }
  .visionneuse__legende {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.75rem 1rem calc(env(safe-area-inset-bottom, 0px) + 0.9rem);
    font-size: 0.95rem;
    color: #c8d0d6;
  }
  .visionneuse__type {
    font-family: var(--font-cond);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #eef0ec;
  }
</style>

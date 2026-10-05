<script>
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'

  let { titre, onRetour = null, actions = null, classe = '' } = $props()
</script>

<header class="header {classe}">
  {#if onRetour}
    <button class="icon-btn header__back" onclick={onRetour} aria-label="Retour">
      <ChevronLeft size={26} strokeWidth={2} />
    </button>
  {/if}
  <h1 class="header__title">{titre}</h1>
  {#if actions}
    <div class="header__actions">{@render actions()}</div>
  {/if}
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 56px;
    padding: calc(env(safe-area-inset-top, 0px) + 0.4rem) max(0.5rem, calc((100% - 38rem) / 2)) 0.4rem;
    background: color-mix(in oklab, var(--ground) 88%, transparent);
    -webkit-backdrop-filter: saturate(1.4) blur(14px);
    backdrop-filter: saturate(1.4) blur(14px);
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid var(--line);
    view-transition-name: entete;
  }
  .header__back {
    color: var(--ink);
  }
  .header__title {
    flex: 1;
    min-width: 0;
    font-size: 1.3rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding-left: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .header__back + .header__title {
    padding-left: 0;
  }
  .header__actions {
    display: flex;
    gap: 0.15rem;
  }
</style>

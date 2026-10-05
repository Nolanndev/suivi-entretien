<script>
  import { slide } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import Camera from '@lucide/svelte/icons/camera'
  import Images from '@lucide/svelte/icons/images'
  import Paperclip from '@lucide/svelte/icons/paperclip'
  import Image from '@lucide/svelte/icons/image'
  import Receipt from '@lucide/svelte/icons/receipt-euro'
  import FileText from '@lucide/svelte/icons/file-text'
  import Trash from '@lucide/svelte/icons/trash-2'
  import Loader from '@lucide/svelte/icons/loader-circle'
  import BlobImg from './BlobImg.svelte'
  import MontantInput from './MontantInput.svelte'
  import { preparerFichier } from './image.js'
  import { nav } from './nav.svelte.js'

  // elements : pièces jointes existantes ({ id, … }) ou nouvelles ({ cle, blob, … })
  // supprimees : ids existants retirés, à effacer à l'enregistrement
  let { elements = $bindable([]), supprimees = $bindable([]) } = $props()

  let enTraitement = $state(false)
  let erreur = $state('')
  let compteur = 0

  const TYPES = [
    { value: 'photo', label: 'Photo', icon: Image },
    { value: 'facture', label: 'Facture', icon: Receipt },
    { value: 'document', label: 'Doc', icon: FileText },
  ]

  async function ajouter(e, kindParDefaut) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    enTraitement = true
    erreur = ''
    try {
      const prepares = await Promise.all(files.map(preparerFichier))
      elements = [
        ...elements,
        ...prepares.map((p) => ({
          ...p,
          cle: `n${++compteur}`,
          kind: p.mime === 'application/pdf' && kindParDefaut === 'photo' ? 'document' : kindParDefaut,
          legende: '',
          montant: '',
        })),
      ]
    } catch {
      erreur = 'Un fichier n’a pas pu être lu. Réessayez avec une autre image ou un PDF.'
    } finally {
      enTraitement = false
    }
  }

  function retirer(i) {
    const el = elements[i]
    if (el.id) supprimees = [...supprimees, el.id]
    elements = elements.filter((_, j) => j !== i)
  }
</script>

<div class="pj">
  <div class="pj__sources">
    <label class="pj__source">
      <Camera size={22} />
      <span>Photo</span>
      <input type="file" accept="image/*" capture="environment" hidden onchange={(e) => ajouter(e, 'photo')} />
    </label>
    <label class="pj__source">
      <Images size={22} />
      <span>Photothèque</span>
      <input type="file" accept="image/*" multiple hidden onchange={(e) => ajouter(e, 'photo')} />
    </label>
    <label class="pj__source">
      <Paperclip size={22} />
      <span>Fichier / PDF</span>
      <input type="file" accept="image/*,application/pdf" multiple hidden onchange={(e) => ajouter(e, 'facture')} />
    </label>
  </div>

  {#if enTraitement}
    <p class="pj__info"><Loader size={16} class="tourne" /> Préparation des fichiers…</p>
  {/if}
  {#if erreur}
    <p class="erreur">{erreur}</p>
  {/if}

  {#if elements.length}
    <ul class="pj__liste">
      {#each elements as el, i (el.id ?? el.cle)}
        <li class="pj__item" transition:slide={{ duration: 200, easing: cubicOut }}>
          <button
            type="button"
            class="pj__vignette"
            onclick={() => nav.ouvrirVisionneuse(elements, i)}
            aria-label="Agrandir"
          >
            {#if el.mime === 'application/pdf'}
              <FileText size={26} strokeWidth={1.5} />
            {:else}
              <BlobImg blob={el.blob} alt="" />
            {/if}
          </button>

          <div class="pj__champs">
            <div class="segmented segmented--compact" role="group" aria-label="Type de pièce jointe">
              {#each TYPES as t (t.value)}
                <button type="button" aria-pressed={el.kind === t.value} onclick={() => (el.kind = t.value)}>
                  <t.icon size={16} />{t.label}
                </button>
              {/each}
            </div>
            {#if el.kind === 'facture'}
              <div class="pj__montant" transition:slide={{ duration: 160 }}>
                <MontantInput
                  placeholder="Montant TTC"
                  aria-label="Montant de la facture"
                  bind:value={el.montant}
                />
                <span>€</span>
              </div>
            {/if}
          </div>

          <button type="button" class="icon-btn pj__retirer" onclick={() => retirer(i)} aria-label="Retirer">
            <Trash size={20} />
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .pj {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .pj__sources {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  .pj__source {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-height: 72px;
    padding: 0.6rem 0.25rem;
    border: 1px dashed color-mix(in oklab, var(--ink-3) 60%, transparent);
    border-radius: var(--r-md);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.85rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: transform 120ms var(--ease), border-color 160ms var(--ease), background-color 160ms var(--ease);
  }
  .pj__source:active {
    transform: scale(0.96);
    background: var(--blue-soft);
    border-color: var(--blue);
  }
  .pj__source :global(svg) {
    color: var(--blue);
  }
  .pj__info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    font-size: 0.9rem;
    color: var(--ink-2);
  }
  .pj__liste {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .pj__item {
    display: grid;
    grid-template-columns: 64px 1fr auto;
    gap: 0.65rem;
    align-items: center;
    padding: 0.5rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
  }
  .pj__vignette {
    width: 64px;
    height: 64px;
    padding: 0;
    border: none;
    border-radius: var(--r-sm);
    overflow: hidden;
    background: var(--surface-2);
    color: var(--ink-2);
    display: grid;
    place-items: center;
  }
  .pj__vignette :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pj__champs {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
  }
  .segmented--compact button {
    min-height: 34px;
    font-size: 0.82rem;
    gap: 0.25rem;
    padding: 0 0.2rem;
  }
  .pj__montant {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .pj__montant :global(input) {
    min-height: 40px !important;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .pj__montant span {
    color: var(--ink-2);
  }
  .pj__retirer {
    color: var(--ink-3);
    align-self: start;
  }
  :global(.tourne) {
    animation: tourne 0.9s linear infinite;
  }
  @keyframes tourne {
    to { transform: rotate(360deg); }
  }
</style>

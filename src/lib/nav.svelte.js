import { flushSync } from 'svelte'

// Navigation en pile, animée par l'API View Transitions quand elle existe
// (Safari 18+). Le sens (avant / retour) pilote l'animation en CSS.
// Chaque écran défile dans son propre conteneur (voir App.svelte) : la
// position de défilement est mémorisée et restaurée au retour.
const etat = $state({
  pile: [{ ecran: 'accueil', params: {}, defilement: 0 }],
  visionneuse: null, // { elements: [{ blob, mime, legende, kind }], index }
})

let conteneur = null

const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const sommet = () => etat.pile[etat.pile.length - 1]

function memoriserDefilement() {
  if (conteneur) sommet().defilement = conteneur.scrollTop
}

function placerDefilement() {
  if (conteneur) conteneur.scrollTop = sommet().defilement || 0
}

function transition(sens, maj, anime = true) {
  const html = document.documentElement
  if (!anime || !document.startViewTransition || reduit()) {
    flushSync(maj)
    placerDefilement()
    return
  }
  html.dataset.nav = sens
  const t = document.startViewTransition(() => {
    flushSync(maj)
    placerDefilement()
  })
  t.finished.finally(() => delete html.dataset.nav)
}

export const nav = {
  get courant() {
    return sommet()
  },
  get precedent() {
    return etat.pile.length > 1 ? etat.pile[etat.pile.length - 2] : null
  },
  get visionneuse() {
    return etat.visionneuse
  },
  definirConteneur(el) {
    conteneur = el
  },
  aller(ecran, params = {}) {
    memoriserDefilement()
    transition('avant', () => etat.pile.push({ ecran, params, defilement: 0 }))
  },
  // Remplace l'écran courant (ex. formulaire → détail après enregistrement).
  remplacer(ecran, params = {}) {
    transition('avant', () => {
      etat.pile[etat.pile.length - 1] = { ecran, params, defilement: 0 }
    })
  },
  // { anime: false } quand le geste de balayage a déjà fait l'animation.
  retour({ anime = true } = {}) {
    if (etat.pile.length <= 1) return
    transition('retour', () => etat.pile.pop(), anime)
  },
  ouvrirVisionneuse(elements, index = 0) {
    etat.visionneuse = { elements, index }
  },
  fermerVisionneuse() {
    etat.visionneuse = null
  },
}

import { flushSync } from 'svelte'

// Navigation en pile, animée par l'API View Transitions quand elle existe
// (Safari 18+). Le sens (avant / retour) pilote l'animation en CSS.
const etat = $state({
  pile: [{ ecran: 'accueil', params: {} }],
  visionneuse: null, // { elements: [{ blob, mime, legende, kind }], index }
})

const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function transition(sens, maj) {
  const html = document.documentElement
  if (!document.startViewTransition || reduit()) {
    maj()
    window.scrollTo(0, 0)
    return
  }
  html.dataset.nav = sens
  const t = document.startViewTransition(() => {
    flushSync(maj)
    window.scrollTo(0, 0)
  })
  t.finished.finally(() => delete html.dataset.nav)
}

export const nav = {
  get courant() {
    return etat.pile[etat.pile.length - 1]
  },
  get visionneuse() {
    return etat.visionneuse
  },
  aller(ecran, params = {}) {
    transition('avant', () => etat.pile.push({ ecran, params }))
  },
  // Remplace l'écran courant (ex. formulaire → détail après enregistrement).
  remplacer(ecran, params = {}) {
    transition('avant', () => {
      etat.pile[etat.pile.length - 1] = { ecran, params }
    })
  },
  retour() {
    if (etat.pile.length <= 1) return
    transition('retour', () => etat.pile.pop())
  },
  // Revient jusqu'à l'écran donné (ou à l'accueil).
  retourA(ecran) {
    transition('retour', () => {
      while (etat.pile.length > 1 && etat.pile[etat.pile.length - 1].ecran !== ecran) {
        etat.pile.pop()
      }
    })
  },
  ouvrirVisionneuse(elements, index = 0) {
    etat.visionneuse = { elements, index }
  },
  fermerVisionneuse() {
    etat.visionneuse = null
  },
}

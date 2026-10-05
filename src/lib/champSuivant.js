// Clavier mobile : « Entrée » passe au champ suivant de l'écran, et le
// dernier champ ferme le clavier. La touche affiche « suivant » / « OK »
// grâce à enterkeyhint. Les zones de texte multilignes gardent le retour
// à la ligne.

const SAISIE =
  'input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]):not([disabled]), select:not([disabled]), textarea:not([disabled])'

function champs(depuis) {
  const racine = depuis.closest('.screen') || document
  return [...racine.querySelectorAll(SAISIE)].filter((el) => el.offsetParent !== null && !el.readOnly)
}

function suivant(el) {
  const liste = champs(el)
  return liste[liste.indexOf(el) + 1] || null
}

function onFocusIn(e) {
  const el = e.target
  if (!(el instanceof HTMLInputElement) || el.matches('[type=file]')) return
  if (!el.hasAttribute('data-enter-auto') && el.hasAttribute('enterkeyhint')) return
  el.setAttribute('data-enter-auto', '')
  el.setAttribute('enterkeyhint', suivant(el) ? 'next' : 'done')
}

function onKeyDown(e) {
  const el = e.target
  if (e.key !== 'Enter' || e.isComposing || e.defaultPrevented) return
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return
  if (el.matches('[type=file], [type=button], [type=submit]')) return
  e.preventDefault()
  const prochain = suivant(el)
  if (prochain) {
    prochain.focus()
    prochain.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
  } else {
    el.blur()
  }
}

export function activerChampSuivant() {
  document.addEventListener('focusin', onFocusIn)
  document.addEventListener('keydown', onKeyDown)
  return () => {
    document.removeEventListener('focusin', onFocusIn)
    document.removeEventListener('keydown', onKeyDown)
  }
}

// Thème : "systeme" (par défaut), "clair" ou "sombre".
// Le choix est mémorisé localement ; en mode système on suit iOS.
const CLE = 'suivi-entretien:theme'
export const THEMES = ['systeme', 'clair', 'sombre']

function lire() {
  try {
    const v = localStorage.getItem(CLE)
    return THEMES.includes(v) ? v : 'systeme'
  } catch {
    return 'systeme'
  }
}

const etat = $state({ choix: lire() })

function appliquer() {
  const html = document.documentElement
  if (etat.choix === 'systeme') delete html.dataset.theme
  else html.dataset.theme = etat.choix === 'sombre' ? 'dark' : 'light'

  const sombre =
    etat.choix === 'sombre' ||
    (etat.choix === 'systeme' && matchMedia('(prefers-color-scheme: dark)').matches)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', sombre ? '#0f1d30' : '#eef0ec')
}

export const theme = {
  get choix() {
    return etat.choix
  },
  definir(v) {
    etat.choix = v
    try {
      localStorage.setItem(CLE, v)
    } catch {
      /* stockage indisponible : le choix vaut pour la session */
    }
    appliquer()
  },
  suivant() {
    this.definir(THEMES[(THEMES.indexOf(etat.choix) + 1) % THEMES.length])
  },
  init() {
    appliquer()
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', appliquer)
  },
}

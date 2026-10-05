// Immatriculation française au format SIV en vigueur depuis 2009 : AB-123-CD.
// La mise en forme se fait pendant la saisie ; une saisie qui ne suit pas ce
// format (ancienne plaque FNI, plaque étrangère…) est seulement mise en
// majuscules, jamais bloquée.

const SIV_PARTIEL = /^[A-Z]{1,2}$|^[A-Z]{2}\d{1,3}$|^[A-Z]{2}\d{3}[A-Z]{1,2}$/
const SIV_COMPLET = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/
// Lettres exclues par le SIV (I, O, U), blocs interdits (SS, WW, 000).
const SIV_INVALIDE = /[IOU]|^SS|^WW|-SS$|-000-/

export function formaterPlaque(saisie) {
  const brut = (saisie || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!brut) return ''
  if (!SIV_PARTIEL.test(brut)) return (saisie || '').toUpperCase().trim()
  const parties = [brut.slice(0, 2), brut.slice(2, 5), brut.slice(5, 7)].filter(Boolean)
  return parties.join('-')
}

// 'valide' | 'invalide' (forme SIV mais lettres ou blocs interdits) | 'autre'
export function etatPlaque(valeur) {
  if (!SIV_COMPLET.test(valeur || '')) return 'autre'
  return SIV_INVALIDE.test(valeur) ? 'invalide' : 'valide'
}

export function estPlaqueSIV(valeur) {
  return SIV_COMPLET.test(valeur || '')
}

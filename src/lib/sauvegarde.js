import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate'
import { db } from '../db.js'
import { aujourdhui } from './entretiens.js'

// Sauvegarde complète en un fichier ZIP :
//   donnees.json         toutes les tables (sans les fichiers binaires)
//   fichiers/<id>.<ext>  photos, factures et documents
// Les identifiants sont conservés pour garder les liens entre tables.

const FORMAT = 'suivi-entretien'
const VERSION = 1
const TABLES = ['vehicules', 'entretiens', 'pieces', 'piecesUtilisees', 'offresPrix', 'rappels', 'photos']
const CLE_DERNIER_EXPORT = 'suivi-entretien:dernier-export'

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }
const MIMES = Object.fromEntries(Object.entries(EXTENSIONS).map(([m, e]) => [e, m]))

export class ErreurSauvegarde extends Error {}

// --- Export ---------------------------------------------------------------

export async function exporterDonnees() {
  const donnees = {}
  const fichiers = {}

  for (const t of TABLES) {
    const lignes = await db.table(t).toArray()
    if (t !== 'photos') {
      donnees[t] = lignes
      continue
    }
    donnees.photos = []
    for (const { blob, ...p } of lignes) {
      const mime = p.mime || blob?.type || 'image/jpeg'
      const chemin = `fichiers/${p.id}.${EXTENSIONS[mime] || 'bin'}`
      if (blob) fichiers[chemin] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }]
      donnees.photos.push({ ...p, mime, fichier: blob ? chemin : null })
    }
  }

  const manifeste = { format: FORMAT, version: VERSION, date: new Date().toISOString(), donnees }
  const zip = zipSync({ 'donnees.json': strToU8(JSON.stringify(manifeste, null, 1)), ...fichiers })

  const fichier = new File([zip], `entretien-sauvegarde-${aujourdhui()}.zip`, { type: 'application/zip' })
  const resume = {
    vehicules: donnees.vehicules.length,
    entretiens: donnees.entretiens.length,
    fichiers: Object.keys(fichiers).length,
  }
  return { fichier, resume }
}

// Propose le fichier : feuille de partage iOS (Enregistrer dans Fichiers,
// iCloud Drive, AirDrop…) quand elle existe, téléchargement sinon.
export async function partagerFichier(fichier) {
  if (navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], title: fichier.name })
      return 'partage'
    } catch (e) {
      if (e?.name === 'AbortError') return 'annule'
      // repli sur le téléchargement
    }
  }
  const url = URL.createObjectURL(fichier)
  const a = Object.assign(document.createElement('a'), { href: url, download: fichier.name })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'telecharge'
}

export function noterExport() {
  try {
    localStorage.setItem(CLE_DERNIER_EXPORT, new Date().toISOString())
  } catch {
    /* sans importance */
  }
}

export function dernierExport() {
  try {
    return localStorage.getItem(CLE_DERNIER_EXPORT)
  } catch {
    return null
  }
}

// --- Import ---------------------------------------------------------------

// Lit et valide une sauvegarde sans rien écrire.
export async function lireSauvegarde(file) {
  let entrees
  try {
    entrees = unzipSync(new Uint8Array(await file.arrayBuffer()))
  } catch {
    throw new ErreurSauvegarde('Ce fichier n’est pas une archive ZIP lisible.')
  }
  if (!entrees['donnees.json']) {
    throw new ErreurSauvegarde('Ce ZIP ne contient pas de sauvegarde Suivi d’entretien (donnees.json absent).')
  }
  let manifeste
  try {
    manifeste = JSON.parse(strFromU8(entrees['donnees.json']))
  } catch {
    throw new ErreurSauvegarde('Le fichier donnees.json est illisible.')
  }
  if (manifeste?.format !== FORMAT || typeof manifeste.donnees !== 'object') {
    throw new ErreurSauvegarde('Ce fichier ne vient pas de Suivi d’entretien.')
  }
  if (manifeste.version > VERSION) {
    throw new ErreurSauvegarde('Cette sauvegarde vient d’une version plus récente de l’appli. Mettez l’appli à jour.')
  }
  const d = manifeste.donnees
  for (const t of TABLES) {
    if (d[t] == null) d[t] = []
    if (!Array.isArray(d[t]) || d[t].some((l) => typeof l !== 'object' || l === null || !Number.isInteger(l.id))) {
      throw new ErreurSauvegarde(`Données invalides dans la table « ${t} ».`)
    }
  }

  let manquants = 0
  d.photos = d.photos.map(({ fichier, ...p }) => {
    const octets = fichier ? entrees[fichier] : null
    if (!octets) {
      manquants++
      return null
    }
    const mime = p.mime || MIMES[fichier.split('.').pop()] || 'application/octet-stream'
    return { ...p, mime, blob: new Blob([octets], { type: mime }) }
  }).filter(Boolean)

  return {
    date: manifeste.date,
    donnees: d,
    resume: { vehicules: d.vehicules.length, entretiens: d.entretiens.length, fichiers: d.photos.length, manquants },
  }
}

// Remplace toutes les données locales par la sauvegarde (en une transaction :
// en cas d'échec, rien n'est modifié).
export async function restaurer(donnees) {
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear()
      if (donnees[t].length) await db.table(t).bulkAdd(donnees[t])
    }
  })
}

import { db } from '../db.js'

// Montants en euros, calculés à l'affichage (jamais stockés).
export function totalLigne(l) {
  return (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0)
}

export function totalPieces(lignes) {
  return (lignes || []).reduce((s, l) => s + totalLigne(l), 0)
}

export function totalEntretien(entretien, lignes) {
  return (Number(entretien?.coutMainOeuvre) || 0) + totalPieces(lignes)
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
export function formatEuros(n) {
  return euros.format(Number(n) || 0)
}

const nombres = new Intl.NumberFormat('fr-FR')
export function formatNombre(n) {
  return nombres.format(Number(n) || 0)
}

export function formatDate(iso) {
  if (!iso) return ''
  const [a, m, j] = iso.split('-').map(Number)
  return new Date(a, m - 1, j).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function aujourdhui() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// --- Lecture --------------------------------------------------------------

export async function chargerEntretien(id) {
  const [entretien, lignes, piecesJointes] = await Promise.all([
    db.entretiens.get(id),
    db.piecesUtilisees.where('entretienId').equals(id).toArray(),
    db.photos.where('entretienId').equals(id).toArray(),
  ])
  return { entretien, lignes, piecesJointes }
}

// Suggestions du catalogue de pièces (par nom ou référence).
export async function chercherPieces(texte) {
  const q = texte.trim().toLowerCase()
  if (q.length < 1) return []
  const toutes = await db.pieces.toArray()
  return toutes
    .filter(
      (p) =>
        p.nom?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q)
    )
    .slice(0, 6)
}

// --- Écriture -------------------------------------------------------------

async function trouverOuCreerPiece(nom, reference) {
  const n = nom.trim()
  const r = (reference || '').trim()
  const existantes = await db.pieces
    .filter(
      (p) =>
        p.nom?.toLowerCase() === n.toLowerCase() &&
        (p.reference || '').toLowerCase() === r.toLowerCase()
    )
    .toArray()
  if (existantes.length) return existantes[0].id
  return db.pieces.add({ nom: n, reference: r, referencesEquivalentes: [], notes: '' })
}

/**
 * Crée ou met à jour un entretien avec ses lignes de pièces et ses pièces
 * jointes, en une seule transaction.
 * - piecesJointes : éléments existants ({ id, ... }) ou nouveaux ({ blob, ... })
 * - supprimees    : ids des pièces jointes existantes à retirer
 */
export async function enregistrerEntretien({
  id = null,
  vehiculeId,
  entretien,
  lignes,
  piecesJointes,
  supprimees = [],
}) {
  return db.transaction(
    'rw',
    [db.entretiens, db.piecesUtilisees, db.pieces, db.photos, db.vehicules],
    async () => {
      const donnees = { ...entretien, vehiculeId }
      let entretienId = id
      if (id) {
        await db.entretiens.put({ ...donnees, id })
      } else {
        entretienId = await db.entretiens.add(donnees)
      }

      // Lignes de pièces : on réécrit l'ensemble, plus simple et sûr.
      await db.piecesUtilisees.where('entretienId').equals(entretienId).delete()
      for (const l of lignes) {
        if (!l.nom?.trim()) continue
        const pieceId = await trouverOuCreerPiece(l.nom, l.reference)
        await db.piecesUtilisees.add({
          entretienId,
          pieceId,
          nom: l.nom.trim(),
          reference: (l.reference || '').trim(),
          quantite: Number(l.quantite) || 1,
          prixUnitaire: Number(l.prixUnitaire) || 0,
        })
      }

      if (supprimees.length) await db.photos.bulkDelete(supprimees)
      for (const pj of piecesJointes) {
        const champs = {
          kind: pj.kind || 'photo',
          legende: pj.legende || '',
          montant: pj.kind === 'facture' && pj.montant !== '' ? Number(pj.montant) || 0 : null,
        }
        if (pj.id) {
          await db.photos.update(pj.id, champs)
        } else {
          await db.photos.add({
            ...champs,
            vehiculeId,
            entretienId,
            pieceId: null,
            blob: pj.blob,
            mime: pj.mime || pj.blob?.type || 'image/jpeg',
            nom: pj.nom || '',
            date: entretien.date,
          })
        }
      }

      const vehicule = await db.vehicules.get(vehiculeId)
      if (vehicule && Number(entretien.compteur) > (vehicule.compteurActuel ?? 0)) {
        await db.vehicules.update(vehiculeId, { compteurActuel: Number(entretien.compteur) })
      }
      return entretienId
    }
  )
}

export async function supprimerEntretien(id) {
  return db.transaction('rw', [db.entretiens, db.piecesUtilisees, db.photos], async () => {
    await db.piecesUtilisees.where('entretienId').equals(id).delete()
    await db.photos.where('entretienId').equals(id).delete()
    await db.entretiens.delete(id)
  })
}

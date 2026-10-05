import Dexie from 'dexie'

export const db = new Dexie('suivi-entretien')

// Schéma complet (7 tables) posé dès le socle pour éviter des migrations
// douloureuses plus tard.
db.version(1).stores({
  vehicules: '++id, type, nom',
  entretiens: '++id, vehiculeId, date',
  pieces: '++id, nom, reference',
  piecesUtilisees: '++id, entretienId, pieceId',
  offresPrix: '++id, pieceId, date',
  rappels: '++id, vehiculeId, typeOperation',
  photos: '++id, vehiculeId, entretienId, pieceId',
})

// v2 : les "photos" deviennent des pièces jointes typées (photo, facture,
// document) et peuvent être des PDF ; les entretiens portent des détails.
db.version(2)
  .stores({
    photos: '++id, vehiculeId, entretienId, pieceId, kind',
  })
  .upgrade(async (tx) => {
    await tx
      .table('photos')
      .toCollection()
      .modify((p) => {
        if (!p.kind) p.kind = 'photo'
        if (!p.mime) p.mime = p.blob?.type || 'image/jpeg'
      })
    await tx
      .table('entretiens')
      .toCollection()
      .modify((e) => {
        if (!e.details) e.details = {}
      })
  })

export const TYPES_VEHICULE = [
  { value: 'voiture', label: 'Voiture' },
  { value: 'moto', label: 'Moto' },
  { value: 'motoculture', label: 'Motoculture' },
]

export const UNITES_COMPTEUR = [
  { value: 'km', label: 'km' },
  { value: 'heures', label: 'heures' },
]

export const TYPES_PIECE_JOINTE = [
  { value: 'photo', label: 'Photo' },
  { value: 'facture', label: 'Facture' },
  { value: 'document', label: 'Document' },
]

export async function demanderStockagePersistant() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist()
    } catch {
      return false
    }
  }
  return false
}

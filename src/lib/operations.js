// Référentiel des types d'opération et de leurs détails.
// Fichier volontairement déclaratif : pour ajouter / corriger un détail,
// il suffit de modifier les listes ci-dessous.
//
// Chaque groupe de détails est soit :
//  - "choix"    : cases à cocher (plusieurs valeurs possibles)
//  - "position" : sélecteur de roues (Tous / AV / AR / AVG / AVD / ARG / ARD),
//                 réduit à AV / AR pour une moto.
import Droplet from '@lucide/svelte/icons/droplet'
import Disc from '@lucide/svelte/icons/disc-3'
import CircleDot from '@lucide/svelte/icons/circle-dot'
import Cog from '@lucide/svelte/icons/cog'
import ClipboardCheck from '@lucide/svelte/icons/clipboard-check'
import Zap from '@lucide/svelte/icons/zap'
import Wind from '@lucide/svelte/icons/wind'
import BatteryCharging from '@lucide/svelte/icons/battery-charging'
import Droplets from '@lucide/svelte/icons/droplets'
import Lightbulb from '@lucide/svelte/icons/lightbulb'
import Scissors from '@lucide/svelte/icons/scissors'
import ShieldCheck from '@lucide/svelte/icons/shield-check'
import Wrench from '@lucide/svelte/icons/wrench'

const TOUS = ['voiture', 'moto', 'motoculture']

export const OPERATIONS = [
  {
    id: 'vidange',
    label: 'Vidange',
    icon: Droplet,
    pour: TOUS,
    groupes: [
      {
        id: 'elements',
        label: 'Éléments remplacés',
        type: 'choix',
        options: ['Huile moteur', 'Filtre à huile', 'Joint / bouchon de vidange'],
      },
    ],
  },
  {
    id: 'freins',
    label: 'Freins',
    icon: Disc,
    pour: ['voiture', 'moto'],
    groupes: [
      { id: 'position', label: 'Position', type: 'position' },
      {
        id: 'elements',
        label: 'Éléments',
        type: 'choix',
        options: ['Plaquettes', 'Disques', 'Mâchoires / tambours', 'Liquide de frein', 'Étriers', 'Flexibles'],
      },
    ],
  },
  {
    id: 'pneus',
    label: 'Pneus',
    icon: CircleDot,
    pour: TOUS,
    groupes: [
      { id: 'position', label: 'Position', type: 'position' },
      {
        id: 'intervention',
        label: 'Intervention',
        type: 'choix',
        options: ['Remplacement', 'Permutation', 'Réparation', 'Équilibrage', 'Géométrie', 'Pression'],
      },
    ],
  },
  {
    id: 'transmission',
    label: 'Courroie / chaîne',
    icon: Cog,
    pour: TOUS,
    groupes: [
      {
        id: 'elements',
        label: 'Éléments',
        type: 'choix',
        options: {
          voiture: ['Kit distribution', 'Courroie de distribution', 'Pompe à eau', 'Courroie d’accessoires', 'Galets'],
          moto: ['Kit chaîne', 'Graissage', 'Tension', 'Courroie de transmission'],
          motoculture: ['Courroie de transmission', 'Courroie de lame', 'Chaîne', 'Galets'],
        },
      },
    ],
  },
  {
    id: 'revision',
    label: 'Révision',
    icon: ClipboardCheck,
    pour: TOUS,
    groupes: [
      {
        id: 'niveau',
        label: 'Type de révision',
        type: 'choix',
        options: ['Petite révision', 'Grande révision', 'Révision constructeur', 'Hivernage', 'Remise en route'],
      },
    ],
  },
  {
    id: 'bougies',
    label: 'Bougies',
    icon: Zap,
    pour: TOUS,
    groupes: [
      {
        id: 'elements',
        label: 'Éléments',
        type: 'choix',
        options: ['Bougies d’allumage', 'Bougies de préchauffage', 'Antiparasites', 'Bobines'],
      },
      {
        id: 'cylindres',
        label: 'Cylindres',
        type: 'choix',
        options: ['Tous', 'Cyl. 1', 'Cyl. 2', 'Cyl. 3', 'Cyl. 4'],
      },
    ],
  },
  {
    id: 'filtres',
    label: 'Filtres',
    icon: Wind,
    pour: TOUS,
    groupes: [
      {
        id: 'elements',
        label: 'Filtres',
        type: 'choix',
        options: ['Filtre à air', 'Filtre à huile', 'Filtre à carburant', 'Filtre d’habitacle'],
      },
    ],
  },
  {
    id: 'batterie',
    label: 'Batterie',
    icon: BatteryCharging,
    pour: TOUS,
    groupes: [
      {
        id: 'intervention',
        label: 'Intervention',
        type: 'choix',
        options: ['Remplacement', 'Charge', 'Contrôle', 'Nettoyage des bornes'],
      },
    ],
  },
  {
    id: 'liquides',
    label: 'Liquides',
    icon: Droplets,
    pour: TOUS,
    groupes: [
      {
        id: 'elements',
        label: 'Liquides',
        type: 'choix',
        options: [
          'Liquide de refroidissement',
          'Liquide de frein',
          'Huile de boîte',
          'Huile de pont',
          'Direction assistée',
          'Lave-glace',
        ],
      },
      {
        id: 'intervention',
        label: 'Intervention',
        type: 'choix',
        options: ['Vidange complète', 'Mise à niveau'],
      },
    ],
  },
  {
    id: 'eclairage',
    label: 'Éclairage',
    icon: Lightbulb,
    pour: ['voiture', 'moto'],
    groupes: [
      {
        id: 'elements',
        label: 'Feux',
        type: 'choix',
        options: ['Croisement', 'Route', 'Position', 'Clignotants', 'Stop', 'Feux arrière', 'Antibrouillard'],
      },
      {
        id: 'cote',
        label: 'Côté',
        type: 'choix',
        options: ['Gauche', 'Droite', 'Les deux'],
      },
    ],
  },
  {
    id: 'coupe',
    label: 'Lame / coupe',
    icon: Scissors,
    pour: ['motoculture'],
    groupes: [
      {
        id: 'elements',
        label: 'Organe de coupe',
        type: 'choix',
        options: ['Lame', 'Chaîne de tronçonneuse', 'Guide-chaîne', 'Fil / tête de débroussailleuse'],
      },
      {
        id: 'intervention',
        label: 'Intervention',
        type: 'choix',
        options: ['Affûtage', 'Remplacement', 'Équilibrage', 'Tension'],
      },
    ],
  },
  {
    id: 'controle-technique',
    label: 'Contrôle technique',
    icon: ShieldCheck,
    pour: ['voiture', 'moto'],
    groupes: [
      {
        id: 'resultat',
        label: 'Résultat',
        type: 'choix',
        options: ['Favorable', 'Défavorable', 'Contre-visite'],
      },
    ],
  },
  {
    id: 'autre',
    label: 'Autre',
    icon: Wrench,
    pour: TOUS,
    groupes: [],
  },
]

export function operationsPour(typeVehicule) {
  return OPERATIONS.filter((o) => o.pour.includes(typeVehicule || 'voiture'))
}

export function operationParId(id) {
  return OPERATIONS.find((o) => o.id === id)
}

// Retrouve l'opération d'un entretien, y compris pour les anciens
// enregistrements qui ne stockaient que le libellé.
export function operationDe(entretien) {
  return (
    operationParId(entretien?.operationId) ||
    OPERATIONS.find((o) => o.label === entretien?.typeOperation) ||
    operationParId('autre')
  )
}

export function optionsDuGroupe(groupe, typeVehicule) {
  if (Array.isArray(groupe.options)) return groupe.options
  return groupe.options?.[typeVehicule] || []
}

// --- Positions de roues -------------------------------------------------

export const ROUES = ['AVG', 'AVD', 'ARG', 'ARD']

export function libellePosition(valeurs, typeVehicule) {
  const v = new Set(valeurs || [])
  if (!v.size) return ''
  if (typeVehicule === 'moto') {
    if (v.has('AV') && v.has('AR')) return 'Avant + arrière'
    return v.has('AV') ? 'Avant' : 'Arrière'
  }
  if (ROUES.every((r) => v.has(r))) return 'Tous'
  if (v.has('AVG') && v.has('AVD') && v.size === 2) return 'Avant'
  if (v.has('ARG') && v.has('ARD') && v.size === 2) return 'Arrière'
  return ROUES.filter((r) => v.has(r)).join(' · ')
}

// Résumé lisible : "Plaquettes, Disques · Avant"
export function resumeDetails(entretien, typeVehicule) {
  const op = operationDe(entretien)
  const details = entretien?.details || {}
  const morceaux = []
  for (const g of op.groupes) {
    const valeurs = details[g.id]
    if (!valeurs?.length) continue
    morceaux.push(g.type === 'position' ? libellePosition(valeurs, typeVehicule) : valeurs.join(', '))
  }
  return morceaux.join(' · ')
}

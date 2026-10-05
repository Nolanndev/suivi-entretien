// Redimensionne une image à ~1600px de large max, ré-encodée en JPEG qualité 0.8,
// pour éviter de saturer le stockage IndexedDB (voir cahier des charges, risques).
export async function redimensionnerImage(file, { maxSize = 1600, quality = 0.8 } = {}) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )
  return blob
}

// Prépare un fichier choisi par l'utilisateur : les images sont réduites,
// les PDF sont gardés tels quels.
export async function preparerFichier(file) {
  if (file.type === 'application/pdf') {
    return { blob: file, mime: 'application/pdf', nom: file.name }
  }
  const blob = await redimensionnerImage(file)
  return { blob, mime: 'image/jpeg', nom: file.name }
}

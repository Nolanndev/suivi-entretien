const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const BG = [30, 41, 59] // slate-800
const RING = [251, 146, 60] // orange-400
const NEEDLE = [248, 250, 252] // slate-50

function drawIcon(size, { padded = false } = {}) {
  const png = new PNG({ width: size, height: size })
  const cx = size / 2
  const cy = size / 2
  const pad = padded ? size * 0.16 : 0
  const r = size / 2 - pad - size * 0.06

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      let color = BG
      if (dist < r && dist > r - size * 0.045) {
        color = RING
      } else if (dist <= r - size * 0.045) {
        color = BG
      }
      png.data[idx] = color[0]
      png.data[idx + 1] = color[1]
      png.data[idx + 2] = color[2]
      png.data[idx + 3] = 255
    }
  }

  // simple needle (gauge) from center toward upper-right
  const angle = -Math.PI / 4
  const len = r * 0.72
  const steps = Math.ceil(len * 2)
  for (let i = 0; i < steps; i++) {
    const t = i / steps
    const x = Math.round(cx + Math.cos(angle) * len * t)
    const y = Math.round(cy + Math.sin(angle) * len * t)
    for (let ox = -Math.ceil(size * 0.015); ox <= Math.ceil(size * 0.015); ox++) {
      for (let oy = -Math.ceil(size * 0.015); oy <= Math.ceil(size * 0.015); oy++) {
        const px = x + ox
        const py = y + oy
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const idx = (size * py + px) << 2
          png.data[idx] = NEEDLE[0]
          png.data[idx + 1] = NEEDLE[1]
          png.data[idx + 2] = NEEDLE[2]
          png.data[idx + 3] = 255
        }
      }
    }
  }
  // hub
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      if (Math.sqrt(dx * dx + dy * dy) < size * 0.06) {
        const idx = (size * y + x) << 2
        png.data[idx] = NEEDLE[0]
        png.data[idx + 1] = NEEDLE[1]
        png.data[idx + 2] = NEEDLE[2]
        png.data[idx + 3] = 255
      }
    }
  }

  return png
}

const outDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192, padded: false },
  { file: 'icon-512.png', size: 512, padded: false },
  { file: 'maskable-512.png', size: 512, padded: true },
  { file: 'apple-touch-icon.png', size: 180, padded: false },
]

for (const t of targets) {
  const png = drawIcon(t.size, { padded: t.padded })
  const buf = PNG.sync.write(png)
  fs.writeFileSync(path.join(outDir, t.file), buf)
  console.log('wrote', t.file)
}

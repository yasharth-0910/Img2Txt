import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const files = [
  {
    source: '../node_modules/tesseract.js/dist/worker.min.js',
    dest: '../public/tesseract/worker.min.js'
  },
  {
    source: '../node_modules/tesseract.js-core/tesseract-core.wasm.js',
    dest: '../public/tesseract/tesseract-core.wasm.js'
  }
]

// Create directory if it doesn't exist
const tesseractDir = path.join(__dirname, '../public/tesseract')
if (!fs.existsSync(tesseractDir)) {
  fs.mkdirSync(tesseractDir, { recursive: true })
}

// Copy files
files.forEach(({ source, dest }) => {
  const sourcePath = path.join(__dirname, source)
  const destPath = path.join(__dirname, dest)
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath)
    console.log(`✅ Copied ${source} to ${dest}`)
  } else {
    console.error(`❌ Source file not found: ${source}`)
  }
})

console.log('✨ Tesseract setup complete!') 
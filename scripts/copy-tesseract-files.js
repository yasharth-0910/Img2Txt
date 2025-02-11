const fs = require('fs')
const path = require('path')

const files = [
  {
    source: 'node_modules/tesseract.js/dist/worker.min.js',
    dest: 'public/tesseract/worker.min.js'
  },
  {
    source: 'node_modules/tesseract.js-core/tesseract-core.wasm.js',
    dest: 'public/tesseract/tesseract-core.wasm.js'
  }
]

// Create directory if it doesn't exist
if (!fs.existsSync('public/tesseract')) {
  fs.mkdirSync('public/tesseract', { recursive: true })
}

// Copy files
files.forEach(({ source, dest }) => {
  fs.copyFileSync(
    path.join(process.cwd(), source),
    path.join(process.cwd(), dest)
  )
  console.log(`Copied ${source} to ${dest}`)
}) 
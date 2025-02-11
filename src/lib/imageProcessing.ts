interface EnhancementOptions {
  grayscale?: boolean
  contrast?: number
  brightness?: number
  sharpen?: boolean
  denoise?: boolean
  autoRotate?: boolean
}

export async function enhanceImage(
  file: File, 
  options: EnhancementOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      try {
        canvas.width = img.width
        canvas.height = img.height

        if (!ctx) throw new Error('Could not get canvas context')

        // Auto-rotate based on EXIF data if needed
        if (options.autoRotate) {
          // Add auto-rotation logic here
        }

        ctx.drawImage(img, 0, 0)
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let data = imageData.data

        // Apply enhancements
        if (options.grayscale) {
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] = data[i + 1] = data[i + 2] = avg
          }
        }

        if (options.contrast) {
          const factor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast))
          for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128
            data[i + 1] = factor * (data[i + 1] - 128) + 128
            data[i + 2] = factor * (data[i + 2] - 128) + 128
          }
        }

        if (options.brightness) {
          for (let i = 0; i < data.length; i += 4) {
            data[i] += options.brightness
            data[i + 1] += options.brightness
            data[i + 2] += options.brightness
          }
        }

        if (options.sharpen) {
          // Apply sharpening kernel
          const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
          ]
          imageData = applyKernel(imageData, kernel)
          data = imageData.data
        }

        if (options.denoise) {
          // Apply simple median filter for denoising
          imageData = medianFilter(imageData)
          data = imageData.data
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to convert canvas to blob'))
        }, 'image/png')
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function applyKernel(imageData: ImageData, kernel: number[]): ImageData {
  const side = Math.round(Math.sqrt(kernel.length))
  const halfSide = Math.floor(side/2)
  const src = imageData.data
  const sw = imageData.width
  const sh = imageData.height
  const tmpCanvas = document.createElement('canvas')
  const tmpCtx = tmpCanvas.getContext('2d')!
  tmpCanvas.width = sw
  tmpCanvas.height = sh
  const output = tmpCtx.createImageData(sw, sh)
  const dst = output.data

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      let r = 0, g = 0, b = 0
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide
          const scx = x + cx - halfSide
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            const srcOff = (scy*sw + scx)*4
            const wt = kernel[cy*side + cx]
            r += src[srcOff] * wt
            g += src[srcOff+1] * wt
            b += src[srcOff+2] * wt
          }
        }
      }
      const dstOff = (y*sw + x)*4
      dst[dstOff] = Math.min(Math.max(r, 0), 255)
      dst[dstOff+1] = Math.min(Math.max(g, 0), 255)
      dst[dstOff+2] = Math.min(Math.max(b, 0), 255)
      dst[dstOff+3] = 255
    }
  }
  return output
}

function medianFilter(imageData: ImageData): ImageData {
  // Implementation of median filter for denoising
  // ... (add implementation)
  return imageData
} 
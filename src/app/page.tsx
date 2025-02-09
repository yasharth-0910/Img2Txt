'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createWorker } from 'tesseract.js'

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsProcessing(true)
    try {
      const worker = await createWorker()
      
      const imageUrl = URL.createObjectURL(acceptedFiles[0])
      await worker.loadLanguage('eng')
      await worker.initialize('eng')
      
      const { data: { text } } = await worker.recognize(imageUrl)
      setExtractedText(text)
      
      await worker.terminate()
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Please try again.')
    }
    setIsProcessing(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText)
    alert('Text copied to clipboard!')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">
          Image to Text Converter
        </h1>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <p>Processing image...</p>
          ) : isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <p>Drag and drop an image here, or click to select</p>
          )}
        </div>

        {extractedText && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
              <p className="whitespace-pre-wrap">{extractedText}</p>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </main>
  )
} 
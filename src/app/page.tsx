'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createWorker, CreateWorkerOptions } from 'tesseract.js'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Copy, Upload, RefreshCcw, Github } from "lucide-react"
import Link from 'next/link'

interface LoggerMessage {
  status: string;
  progress: number;
}

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const processImage = async (file: File | Blob) => {
    setIsProcessing(true)
    setProgress(0)
    try {
      const worker = await createWorker({
        logger: (m: LoggerMessage) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      } as CreateWorkerOptions)
      
      const imageUrl = URL.createObjectURL(file)
      await (worker as any).loadLanguage('eng')
      await (worker as any).initialize('eng')
      
      const { data: { text } } = await (worker as any).recognize(imageUrl)
      setExtractedText(text)
      
      await worker.terminate()
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Please try again.')
    }
    setIsProcessing(false)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    await processImage(acceptedFiles[0])
  }, [])

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    const imageItem = Array.from(items).find(item => item.type.indexOf('image') !== -1)
    
    if (imageItem) {
      const file = imageItem.getAsFile()
      if (file) {
        await processImage(file)
      }
    }
  }, [])

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

  const resetAll = () => {
    setExtractedText('')
    setProgress(0)
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="border-none shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Image to Text Converter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              {...getRootProps()}
              onPaste={handlePaste}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200 ease-in-out
                ${isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted'}
                hover:border-primary hover:bg-primary/5 hover:scale-[0.99]
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <Upload className="w-12 h-12 text-muted-foreground" />
                {isProcessing ? (
                  <div className="space-y-4 w-full max-w-xs">
                    <Progress value={progress} className="h-2" />
                    <p className="text-muted-foreground">Processing image... {progress}%</p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-primary">Drop the image here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Drag and drop an image here</p>
                    <p className="text-sm text-muted-foreground">or click to select a file</p>
                    <p className="text-sm text-muted-foreground mt-2">You can also paste (Ctrl+V) an image directly</p>
                  </div>
                )}
              </div>
            </div>

            {extractedText && (
              <Card className="border-none bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl">Extracted Text</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={resetAll}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      New
                    </Button>
                    <Button 
                      onClick={copyToClipboard}
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap font-mono text-sm">
                    {extractedText}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
            <p>Made with ❤️ by Yasharth Singh</p>
            <Link 
              href="https://github.com/yasharth-0910" 
              target="_blank"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
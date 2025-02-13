'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { createWorker } from 'tesseract.js'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, RefreshCcw, Github, Volume2, Languages, Search, Tags, Download, History, Copy, Wand2 } from "lucide-react"
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { enhanceImage } from '@/lib/imageProcessing'
import { useSubscription } from '@/hooks/useSubscription'
import { useSession } from "next-auth/react"

interface SavedText {
  text: string;
  timestamp: number;
  language: string;
}

interface AIAnalysis {
  enhanced?: string;
  keywords?: string[];
  analysis?: string;
  classification?: {
    category: string;
    explanation: string;
  };
}

interface Languages {
  [key: string]: string;
}

const languages: Languages = {
  eng: 'English',
  fra: 'French',
  spa: 'Spanish',
  deu: 'German',
  ita: 'Italian',
  por: 'Portuguese',
  hin: 'Hindi',
  jpn: 'Japanese',
  kor: 'Korean',
  chi_sim: 'Chinese Simplified'
}

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('eng')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [savedTexts, setSavedTexts] = useState<SavedText[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [useImageEnhancement, setUseImageEnhancement] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [enhancementOptions, setEnhancementOptions] = useState({
    grayscale: true,
    contrast: 20,
    brightness: 0,
    sharpen: false,
    denoise: false,
    autoRotate: true
  })
  const { plan } = useSubscription()
  const { data: session } = useSession()

  // Load saved texts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('extractedTexts')
    if (saved) {
      setSavedTexts(JSON.parse(saved))
    }
  }, [])

  // Auto-save extracted text
  useEffect(() => {
    if (extractedText) {
      const newSavedTexts = [{
        text: extractedText,
        timestamp: Date.now(),
        language: selectedLanguage
      }, ...savedTexts].slice(0, 10)
      
      setSavedTexts(newSavedTexts)
      localStorage.setItem('extractedTexts', JSON.stringify(newSavedTexts))
    }
  }, [extractedText, savedTexts, selectedLanguage])

  const saveConversion = async (text: string, filename: string) => {
    if (!session?.user?.email) return

    try {
      await fetch('/api/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          filename,
          language: selectedLanguage
        })
      })
    } catch (error) {
      console.error('Error saving conversion:', error)
    }
  }

  const processImage = async (file: File | Blob) => {
    if (!plan?.limits?.enhancementOptions && useImageEnhancement) {
      toast.error('Image enhancement is a Pro feature')
      return
    }
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      let imageToProcess = file
      let previewUrlToSet = null

      if (useImageEnhancement && file instanceof File) {
        imageToProcess = await enhanceImage(file)
        previewUrlToSet = URL.createObjectURL(imageToProcess)
        setPreviewUrl(previewUrlToSet)
      }

      const worker = await createWorker({
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract/tesseract-core.wasm.js',
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
        errorHandler: err => {
          console.error('Worker error:', err)
          toast.error('Error processing image')
        }
      })      
      
      await worker.loadLanguage(selectedLanguage)
      await worker.initialize(selectedLanguage)
      
      const { data: { text } } = await worker.recognize(imageToProcess)
      
      setExtractedText(text)
      
      if (session?.user?.email) {
        await saveConversion(text, file instanceof File ? file.name : 'image.png')
      }
      
      await worker.terminate()

      if (previewUrlToSet) {
        URL.revokeObjectURL(previewUrlToSet)
      }
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Error processing image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const processTextFile = async (file: File) => {
    try {
      const text = await file.text()
      setExtractedText(text)
    } catch (error) {
      console.error('Error reading text file:', error)
      toast.error('Error reading text file')
    }
  }

  const processDocxFile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // You'll need to set up a simple API route to handle DOCX conversion
      const response = await fetch('/api/convert-docx', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Failed to convert DOCX')
      
      const { text } = await response.json()
      setExtractedText(text)
    } catch (error) {
      console.error('Error processing DOCX:', error)
      toast.error('Error processing DOCX file')
    }
  }

  const processFile = useCallback(async (file: File) => {
    const fileType = file.type.toLowerCase()
    
    if (fileType.includes('image')) {
      await processImage(file)
    } else if (fileType === 'text/plain') {
      await processTextFile(file)
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      await processDocxFile(file)
    } else {
      toast.error('Unsupported file type')
    }
  }, [processImage, processTextFile, processDocxFile])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    await processFile(acceptedFiles[0])
  }, [processFile])

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    const imageItem = Array.from(items).find(item => item.type.indexOf('image') !== -1)
    
    if (imageItem) {
      const file = imageItem.getAsFile()
      if (file) {
        await processFile(file)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText)
    toast.success('Text copied to clipboard')
  }

  const speakText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(extractedText)
      
      // Set language based on selected OCR language
      const langMap: { [key: string]: string } = {
        eng: 'en-US',
        fra: 'fr-FR',
        spa: 'es-ES',
        deu: 'de-DE',
        ita: 'it-IT',
        por: 'pt-PT',
        hin: 'hi-IN',
        jpn: 'ja-JP',
        kor: 'ko-KR',
        chi_sim: 'zh-CN'
      }
      
      utterance.lang = langMap[selectedLanguage] || 'en-US'
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        window.speechSynthesis.speak(utterance)
      }
    } else {
      toast.error('Text-to-speech is not supported in your browser')
    }
  }

  const resetAll = () => {
    setExtractedText('')
    setProgress(0)
    setSelectedLanguage('eng')
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(timestamp))
  }

  const processWithAI = async (task: string) => {
    if (!extractedText) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText, task })
      })
      
      if (!response.ok) throw new Error('AI processing failed')
      
      const data = await response.json()
      
      switch (task) {
        case 'enhance':
          setAiAnalysis(prev => ({ ...prev, enhanced: data.result }))
          break
        case 'keywords':
          setAiAnalysis(prev => ({ ...prev, keywords: JSON.parse(data.result) }))
          break
        case 'analyze':
          setAiAnalysis(prev => ({ ...prev, analysis: data.result }))
          break
        case 'classify':
          setAiAnalysis(prev => ({ ...prev, classification: JSON.parse(data.result) }))
          break
      }
    } catch (error) {
      console.error('AI Processing Error:', error)
      toast.error('AI processing failed')
    }
    setIsAnalyzing(false)
  }

  const downloadFile = (content: string | Blob, filename: string) => {
    const url = content instanceof Blob ? 
      URL.createObjectURL(content) : 
      URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportText = async (format: 'txt' | 'json') => {
    if (!extractedText) return
    
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `extracted-text-${timestamp}`
    
    switch (format) {
      case 'txt':
        downloadFile(extractedText, `${filename}.txt`)
        break
        
      case 'json':
        const jsonData = {
          text: extractedText,
          metadata: {
            timestamp: Date.now(),
            language: selectedLanguage,
            aiAnalysis: aiAnalysis
          }
        }
        downloadFile(
          JSON.stringify(jsonData, null, 2),
          `${filename}.json`
        )
        break
    }
    
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  const renderEnhancementToggle = () => (
    <div className="flex items-center gap-2">
      <Switch
        id="image-enhancement"
        checked={useImageEnhancement}
        onCheckedChange={setUseImageEnhancement}
      />
      <Label htmlFor="image-enhancement">
        Enable Image Enhancement
      </Label>
    </div>
  )

  const renderPreview = () => (
    previewUrl && (
      <div className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">Enhanced Image Preview:</p>
        <div className="relative aspect-video w-full max-w-sm mx-auto">
          <Image
            src={previewUrl}
            alt="Enhanced preview"
            fill
            className="object-contain rounded-lg"
          />
        </div>
      </div>
    )
  )

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-none shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                Image to Text Converter
              </CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <History className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>History</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {savedTexts.map((saved, index) => (
                      <Card key={index} className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(saved.timestamp)} - {languages[saved.language]}
                        </p>
                        <p className="text-sm line-clamp-2">{saved.text}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setExtractedText(saved.text)
                            setSelectedLanguage(saved.language)
                          }}
                        >
                          Restore
                        </Button>
                      </Card>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex justify-center mt-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[180px]">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Select onValueChange={exportText}>
                <SelectTrigger className="w-[130px]">
                  <Download className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Export As..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">Text (.txt)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {plan?.limits?.enhancementOptions && renderEnhancementToggle()}
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
                    <p className="text-muted-foreground">Processing... {progress}%</p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-primary">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Drag and drop a file here</p>
                    <p className="text-sm text-muted-foreground">or click to select a file</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supports images (.jpg, .png, .gif), text (.txt), and Word (.docx)
                    </p>
                  </div>
                )}
              </div>
            </div>
            {renderPreview()}

            {extractedText && (
              <>
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
                        onClick={speakText}
                        variant="outline"
                        size="sm"
                        className={`gap-2 ${isSpeaking ? 'text-primary' : ''}`}
                      >
                        <Volume2 className="w-4 h-4" />
                        {isSpeaking ? 'Stop' : 'Speak'}
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

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => processWithAI('enhance')}
                      disabled={isAnalyzing}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Enhance Text
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => processWithAI('keywords')}
                      disabled={isAnalyzing}
                    >
                      <Tags className="w-4 h-4 mr-2" />
                      Extract Keywords
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => processWithAI('analyze')}
                      disabled={isAnalyzing}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Content
                    </Button>
                  </div>

                  {isAnalyzing && (
                    <div className="flex items-center gap-4">
                      <Progress value={undefined} className="flex-1" />
                      <span className="text-sm text-muted-foreground">Processing with AI...</span>
                    </div>
                  )}

                  {plan?.limits?.aiAnalysis ? (
                    Object.keys(aiAnalysis).length > 0 && (
                      <div className="space-y-6">
                        {aiAnalysis.enhanced && (
                          <div className="p-6 rounded-lg bg-muted/50">
                            <h3 className="text-lg font-semibold mb-3">Enhanced Text</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              {aiAnalysis.enhanced.split('\n').map((paragraph, i) => (
                                <p key={i} className="mb-4 leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {aiAnalysis.keywords && (
                          <div className="p-6 rounded-lg bg-muted/50">
                            <h3 className="text-lg font-semibold mb-3">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                              {aiAnalysis.keywords.map((keyword, i) => (
                                <span 
                                  key={i} 
                                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {aiAnalysis.analysis && (
                          <div className="p-6 rounded-lg bg-muted/50">
                            <h3 className="text-lg font-semibold mb-3">Content Analysis</h3>
                            <div className="space-y-4 text-sm leading-relaxed">
                              {aiAnalysis.analysis.split('**').map((section, i) => {
                                if (i % 2 === 1) { // Headings
                                  return (
                                    <h4 key={i} className="font-medium text-primary mt-4">
                                      {section}
                                    </h4>
                                  )
                                }
                                // Content sections
                                return section.split('*').map((text, j) => (
                                  <p key={`${i}-${j}`} className="ml-4">
                                    {text.startsWith(' ') ? text.substring(1) : text}
                                  </p>
                                ))
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      AI analysis is available in Pro plan
                    </p>
                  )}
                </div>
              </>
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
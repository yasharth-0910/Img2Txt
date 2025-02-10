'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { createWorker } from 'tesseract.js'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Copy, Upload, RefreshCcw, Github, Volume2, Languages, History, Bot, Wand2, Search, Tags } from "lucide-react"
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('eng')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [savedTexts, setSavedTexts] = useState<SavedText[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const languages = {
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
      }, ...savedTexts].slice(0, 10) // Keep last 10 entries
      
      setSavedTexts(newSavedTexts)
      localStorage.setItem('extractedTexts', JSON.stringify(newSavedTexts))
    }
  }, [extractedText])

  const processImage = async (file: File | Blob) => {
    setIsProcessing(true)
    setProgress(0)
    try {
      const worker = await createWorker({
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      })      
      
      const imageUrl = URL.createObjectURL(file)
      await worker.loadLanguage(selectedLanguage)
      await worker.initialize(selectedLanguage)
      
      const { data: { text } } = await worker.recognize(imageUrl)
      setExtractedText(text)
      
      await worker.terminate()
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Error processing image. Please try again.')
    }
    setIsProcessing(false)
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

  const processFile = async (file: File) => {
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
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    await processFile(acceptedFiles[0])
  }, [])

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

  const renderAIButtons = () => (
    <div className="flex flex-wrap gap-2 mt-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => processWithAI('enhance')}
          >
            <Wand2 className="w-4 h-4" />
            Enhance Text
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Enhanced Text</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="enhanced" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
            </TabsList>
            <TabsContent value="original">
              <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                <p className="whitespace-pre-wrap">{extractedText}</p>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="enhanced">
              <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center h-full">
                    <Progress value={100} className="w-[60%]" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{aiAnalysis.enhanced}</p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => processWithAI('keywords')}
          >
            <Tags className="w-4 h-4" />
            Extract Keywords
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keywords</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-wrap gap-2">
            {isAnalyzing ? (
              <Progress value={100} className="w-[60%]" />
            ) : (
              aiAnalysis.keywords?.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => processWithAI('analyze')}
          >
            <Bot className="w-4 h-4" />
            AI Analysis
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI Analysis</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center h-full">
                <Progress value={100} className="w-[60%]" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="whitespace-pre-wrap">{aiAnalysis.analysis}</p>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Original Text:</p>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{extractedText}</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => processWithAI('classify')}
          >
            <Search className="w-4 h-4" />
            Classify
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Classification</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isAnalyzing ? (
              <Progress value={100} className="w-[60%]" />
            ) : aiAnalysis.classification ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Category:</span>
                  <span className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                    {aiAnalysis.classification.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {aiAnalysis.classification.explanation}
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto space-y-8">
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
                {renderAIButtons()}
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
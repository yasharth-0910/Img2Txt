"use client"

import { useState } from 'react'
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { X, CheckCircle, AlertCircle } from "lucide-react"

interface BatchFile {
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  text?: string
  error?: string
}

interface BatchProcessingProps {
  onProcess: (file: File) => Promise<string>
  onComplete: (results: { file: File; text: string }[]) => void
}

export function BatchProcessing({ onProcess, onComplete }: BatchProcessingProps) {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addFiles = (newFiles: File[]) => {
    const batchFiles: BatchFile[] = newFiles.map(file => ({
      file,
      status: 'pending'
    }))
    setFiles(prev => [...prev, ...batchFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const processAll = async () => {
    setIsProcessing(true)
    const results: { file: File; text: string }[] = []

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'completed') continue

      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' } : f
      ))

      try {
        const text = await onProcess(files[i].file)
        results.push({ file: files[i].file, text })
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'completed', text } : f
        ))
      } catch (error) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: 'Failed to process' } : f
        ))
      }
    }

    setIsProcessing(false)
    if (results.length > 0) {
      onComplete(results)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Batch Processing</h3>
        <Button
          onClick={processAll}
          disabled={isProcessing || files.length === 0}
        >
          Process All Files
        </Button>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => (
          <Card key={index} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {file.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {file.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              <span className="font-medium">{file.file.name}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {file.status === 'processing' && (
                <Progress value={undefined} className="w-24" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Share2, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface ShareDialogProps {
  text: string
  filename: string
}

export function ShareDialog({ text, filename }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = `${window.location.origin}/share?text=${encodeURIComponent(text)}&filename=${encodeURIComponent(filename)}`
  
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaEmail = () => {
    const subject = `Shared Text: ${filename}`
    const body = `Check out this text I extracted:\n\n${text}\n\nShared via Img2Txt`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Text</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly />
            <Button size="icon" onClick={copyLink}>
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button className="w-full" onClick={shareViaEmail}>
            Share via Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
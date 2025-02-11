'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Clock, Download, Eye } from "lucide-react"
import { format } from 'date-fns'
import { useSession } from "next-auth/react"
import { PreviewDialog } from "./preview-dialog"

interface HistoryItem {
  id: string
  filename: string
  text: string
  timestamp: Date
  language: string
}

export function FileHistory() {
  const { data: session } = useSession()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/conversions')
        if (!response.ok) throw new Error('Failed to fetch history')
        const data = await response.json()
        setHistory(data)
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [session])

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Conversions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Loading history...
              </p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No conversion history yet
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{item.filename}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(item.timestamp), 'PPp')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadText(item.text, item.filename)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewItem(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{item.text}</p>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      <PreviewDialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
        text={previewItem?.text || ''}
        filename={previewItem?.filename || ''}
      />
    </>
  )
} 
'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { diffChars } from 'diff'

export function TextComparison() {
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')
  const [diff, setDiff] = useState<any[]>([])

  const compareDiff = () => {
    const differences = diffChars(original, modified)
    setDiff(differences)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Original Text</label>
          <Textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here..."
            className="h-[200px]"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Modified Text</label>
          <Textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text here..."
            className="h-[200px]"
          />
        </div>
      </div>
      
      <Button onClick={compareDiff}>Compare Texts</Button>
      
      {diff.length > 0 && (
        <div className="p-4 border rounded-lg">
          <div className="prose prose-sm max-w-none">
            {diff.map((part, i) => (
              <span
                key={i}
                className={
                  part.added
                    ? 'bg-green-200 dark:bg-green-900'
                    : part.removed
                    ? 'bg-red-200 dark:bg-red-900'
                    : ''
                }
              >
                {part.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
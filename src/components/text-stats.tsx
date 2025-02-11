'use client'

interface TextStatsProps {
  text: string
}

export function TextStats({ text }: TextStatsProps) {
  const stats = {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    sentences: text.split(/[.!?]+/).length - 1,
    paragraphs: text.split(/\n\s*\n/).length,
    readingTime: Math.ceil(text.trim().split(/\s+/).length / 200) // 200 words per minute
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-2xl font-bold">{stats.characters}</p>
        <p className="text-sm text-muted-foreground">Characters</p>
      </div>
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-2xl font-bold">{stats.words}</p>
        <p className="text-sm text-muted-foreground">Words</p>
      </div>
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-2xl font-bold">{stats.sentences}</p>
        <p className="text-sm text-muted-foreground">Sentences</p>
      </div>
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-2xl font-bold">{stats.paragraphs}</p>
        <p className="text-sm text-muted-foreground">Paragraphs</p>
      </div>
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-2xl font-bold">{stats.readingTime} min</p>
        <p className="text-sm text-muted-foreground">Reading Time</p>
      </div>
    </div>
  )
} 
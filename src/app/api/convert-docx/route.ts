import { NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    return NextResponse.json({ text: result.value })
  } catch (error) {
    console.error('Error converting DOCX:', error)
    return NextResponse.json({ error: 'Failed to convert DOCX' }, { status: 500 })
  }
} 
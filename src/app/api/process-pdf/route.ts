import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Dynamic import to avoid client-side issues
const getPdfParse = async () => {
  try {
    const pdfParse = await import('pdf-parse')
    return pdfParse.default
  } catch (error) {
    console.error('Failed to load pdf-parse:', error)
    throw new Error('PDF processing module failed to load')
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const pdfParse = await getPdfParse()
      const data = await pdfParse(buffer)
      
      return NextResponse.json({ 
        text: data.text,
        pages: data.numpages,
        info: data.info 
      })
    } catch (parseError) {
      console.error('PDF parsing error:', parseError)
      return NextResponse.json({ 
        error: 'Failed to parse PDF file' 
      }, { status: 422 })
    }
  } catch (error) {
    console.error('PDF processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process PDF' 
    }, { status: 500 })
  }
} 
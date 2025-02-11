import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pdf from 'pdf-parse'

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

    const buffer = Buffer.from(await file.arrayBuffer())
    const data = await pdf(buffer)
    
    return NextResponse.json({ 
      text: data.text,
      pages: data.numpages,
      info: data.info 
    })
  } catch (error) {
    console.error('PDF processing error:', error)
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 })
  }
} 
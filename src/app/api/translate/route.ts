import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const GOOGLE_TRANSLATE_API = "https://translation.googleapis.com/language/translate/v2"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, targetLanguage } = await req.json()

    const response = await fetch(`${GOOGLE_TRANSLATE_API}?key=${process.env.GOOGLE_TRANSLATE_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    })

    const data = await response.json()
    return NextResponse.json({ 
      translatedText: data.data.translations[0].translatedText 
    })
  } catch (error: unknown) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
} 
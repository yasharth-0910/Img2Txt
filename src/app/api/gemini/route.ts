import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

export async function POST(request: Request) {
  try {
    const { text, task } = await request.json()

    let prompt = ""
    switch (task) {
      case "enhance":
        prompt = `Please enhance and correct any OCR errors in the following text while maintaining its original meaning: "${text}"`
        break
      case "keywords":
        prompt = `Extract the main keywords and key phrases from the following text. Format your response as a simple JSON array of strings, like this: ["keyword1", "keyword2"]. Text: "${text}"`
        break
      case "analyze":
        prompt = `Analyze the following text and provide key insights, main topics, and a brief summary. Keep it concise: "${text}"`
        break
      case "classify":
        prompt = `Classify the following text into one of these categories: Receipt, Invoice, Handwritten Note, Letter, Article, or Other. Return a JSON object with exactly this format: {"category": "category_name", "explanation": "your explanation"}. Text: "${text}"`
        break
      default:
        return NextResponse.json({ error: "Invalid task" }, { status: 400 })
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    let aiResponse = data.candidates[0].content.parts[0].text

    // Clean up JSON responses
    if (task === 'keywords' || task === 'classify') {
      try {
        // Find the first [ or { in the response
        const jsonStart = aiResponse.indexOf('[') !== -1 ? 
          aiResponse.indexOf('[') : aiResponse.indexOf('{')
        // Find the last ] or } in the response
        const jsonEnd = aiResponse.lastIndexOf(']') !== -1 ? 
          aiResponse.lastIndexOf(']') + 1 : aiResponse.lastIndexOf('}') + 1
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          aiResponse = aiResponse.substring(jsonStart, jsonEnd)
        }
      } catch (e) {
        console.error('Error cleaning JSON response:', e)
      }
    }

    return NextResponse.json({ result: aiResponse })
  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
  }
} 
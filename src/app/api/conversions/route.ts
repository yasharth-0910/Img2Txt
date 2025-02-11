import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../auth/[...nextauth]/route"
import { handleApiError } from "@/middleware/error"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, filename, language } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const conversion = await prisma.conversion.create({
      data: {
        userId: user.id,
        text,
        filename,
        language
      }
    })

    return NextResponse.json(conversion)
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const conversions = await prisma.conversion.findMany({
      where: { 
        user: { email: session.user.email } 
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        filename: true,
        text: true,
        language: true,
        timestamp: true
      }
    })

    return NextResponse.json(conversions)
  } catch (error) {
    return handleApiError(error)
  }
} 
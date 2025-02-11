import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/middleware/error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversions = await prisma.conversion.findMany({
      where: { 
        user: { email: session.user.email } 
      },
      select: {
        language: true,
        text: true,
        timestamp: true
      }
    })

    const stats = {
      totalCharacters: conversions.reduce((sum, conv) => sum + conv.text.length, 0),
      byLanguage: conversions.reduce((acc, conv) => {
        acc[conv.language] = (acc[conv.language] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      lastWeekCount: conversions.filter(conv => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(conv.timestamp) > weekAgo
      }).length
    }

    return NextResponse.json(stats)
  } catch (error) {
    return handleApiError(error)
  }
} 
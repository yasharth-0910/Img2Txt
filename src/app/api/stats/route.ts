import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../auth/[...nextauth]/route"
import { handleApiError } from "@/middleware/error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [conversionsCount, savedTextsCount] = await Promise.all([
      prisma.conversion.count({
        where: {
          user: {
            email: session.user.email
          }
        }
      }),
      prisma.savedText.count({
        where: {
          user: {
            email: session.user.email
          }
        }
      })
    ])

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const monthlyConversions = await prisma.conversion.count({
      where: {
        user: {
          email: session.user.email
        },
        timestamp: {
          gte: monthStart
        }
      }
    })

    const monthlyLimit = 100 // or get from user's plan
    const monthlyUsage = (monthlyConversions / monthlyLimit) * 100

    return NextResponse.json({
      totalConversions: conversionsCount,
      savedTexts: savedTextsCount,
      monthlyUsage: Math.min(monthlyUsage, 100).toFixed(1)
    })
  } catch (error) {
    return handleApiError(error)
  }
} 
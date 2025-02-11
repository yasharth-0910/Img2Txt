import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, amount } = await req.json()

    // Update user's subscription
    await prisma.subscription.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        userId: session.user.id,
        status: 'active',
        planId,
        amount,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      update: {
        status: 'active',
        planId,
        amount,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('UPI verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
} 
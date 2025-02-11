import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/middleware/error"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, paymentId, signature } = await req.json()

    const text = `${orderId}|${paymentId}`
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex')

    if (generated !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Update user's subscription
    await prisma.subscription.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        userId: session.user.id,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      update: {
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
} 
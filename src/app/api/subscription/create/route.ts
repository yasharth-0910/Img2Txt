import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, amount, upiId } = await req.json()

    // Require UPI ID verification for high-value transactions
    if (amount >= 500 && !upiId) {
      return NextResponse.json(
        { error: 'UPI ID verification required for transactions over ₹500' }, 
        { status: 400 }
      )
    }

    // Create/Update subscription with pending status for high-value transactions
    await prisma.subscription.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        userId: session.user.id,
        status: amount >= 500 ? 'pending_verification' : 'active',
        planId,
        amount,
        customerUpiId: upiId,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      update: {
        status: amount >= 500 ? 'pending_verification' : 'active',
        planId,
        amount,
        customerUpiId: upiId,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    // For high-value transactions, send notification to admin (implement your notification system)
    if (amount >= 500) {
      // Example: Send email to admin
      await sendAdminNotification({
        email: session.user.email,
        amount,
        upiId,
        planId
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

async function sendAdminNotification(details: {
  email: string
  amount: number
  upiId: string
  planId: string
}) {
  // Implement your notification system here
  // Example: Send email, Slack notification, etc.
  console.log('High-value transaction needs verification:', details)
} 
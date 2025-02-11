import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { sendSubscriptionEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId, approve } = await req.json()

    const subscription = await prisma.subscription.update({
      where: {
        id: subscriptionId
      },
      data: {
        status: approve ? 'active' : 'rejected',
        currentPeriodEnd: approve 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
          : undefined
      },
      include: {
        user: true
      }
    })

    // Send email notification to user
    await sendSubscriptionEmail({
      to: subscription.user.email!,
      status: approve ? 'approved' : 'rejected',
      planId: subscription.planId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 })
  }
}

function isAdmin(email: string) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(email)
} 
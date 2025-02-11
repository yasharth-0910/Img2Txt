import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Always return free plan for now since premium is coming soon
    return NextResponse.json({ 
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null
    })

    /* Commented out actual subscription check for now
    if (!session?.user?.email) {
      return NextResponse.json({ plan: 'free' })
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!subscription || 
        subscription.status !== 'active' || 
        !subscription.currentPeriodEnd || 
        subscription.currentPeriodEnd < new Date()) {
      return NextResponse.json({ plan: 'free' })
    }

    return NextResponse.json({
      plan: subscription.planId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd
    })
    */
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json({ 
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null
    })
  }
} 
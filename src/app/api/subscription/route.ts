import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Always return free plan for now since premium is coming soon
    return NextResponse.json({ 
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json({ 
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null
    })
  }
} 
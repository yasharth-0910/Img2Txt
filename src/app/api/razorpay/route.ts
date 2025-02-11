import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import Razorpay from "razorpay"
import { authOptions } from "../auth/[...nextauth]/route"
import { handleApiError } from "@/middleware/error"
import { plans } from "@/config/subscriptions"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await req.json()
    const planDetails = plans[plan as keyof typeof plans]
    
    if (!planDetails) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const amount = Math.round(planDetails.price * 100) // Convert to paise
    
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userEmail: session.user.email,
        plan
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    return handleApiError(error)
  }
} 
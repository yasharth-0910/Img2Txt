import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPaymentOrder } from "@/lib/payment-gateway"
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount } = await req.json()

    const orderId = `order_${uuidv4()}`

    const order = await createPaymentOrder({
      orderId,
      amount,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
} 
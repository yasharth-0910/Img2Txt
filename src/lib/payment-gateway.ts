import crypto from 'crypto'

const CASHFREE_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg'

export async function createPaymentOrder(params: {
  orderId: string
  amount: number
  customerEmail: string
  customerPhone?: string
  customerName?: string
}) {
  const { orderId, amount, customerEmail, customerPhone, customerName } = params

  const headers = {
    'x-client-id': process.env.CASHFREE_APP_ID!,
    'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
    'x-api-version': '2022-09-01',
    'Content-Type': 'application/json'
  }

  const payload = {
    order_id: orderId,
    order_amount: amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: orderId,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      customer_name: customerName
    },
    order_meta: {
      return_url: `${process.env.NEXTAUTH_URL}/payment/status?order_id={order_id}`
    },
    order_tags: {
      type: 'subscription'
    }
  }

  const response = await fetch(`${CASHFREE_API_URL}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error('Failed to create payment order')
  }

  return response.json()
}

export function verifyPaymentSignature(params: {
  orderId: string
  orderAmount: string
  referenceId: string
  txStatus: string
  paymentMode: string
  txMsg: string
  txTime: string
  signature: string
}) {
  const { orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime, signature } = params
  
  const data = `${orderId}${orderAmount}${referenceId}${txStatus}${paymentMode}${txMsg}${txTime}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY!)
    .update(data)
    .digest('base64')

  return expectedSignature === signature
} 
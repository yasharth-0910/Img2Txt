'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PaymentStatus() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(searchParams))
        })

        if (!response.ok) throw new Error('Payment verification failed')
        
        toast.success('Payment successful!')
        router.push('/settings')
      } catch (error) {
        toast.error('Payment verification failed')
        router.push('/settings')
      }
    }

    if (searchParams.get('order_id')) {
      verifyPayment()
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying Payment</h1>
        <p className="text-muted-foreground">Please wait while we verify your payment...</p>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic' 
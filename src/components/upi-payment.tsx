'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Smartphone } from 'lucide-react'

interface UPIPaymentProps {
  amount: number
  planId: string
  onSuccess: () => void
}

export function UPIPayment({ amount, planId, onSuccess }: UPIPaymentProps) {
  const [loading, setLoading] = useState(false)
  const phonepeLink = `upi://pay?pa=8448173449@ybl&pn=Img2Txt&am=${amount}&cu=INR&tn=Subscription`

  const handlePayment = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, amount })
      })

      if (!response.ok) throw new Error('Failed to create subscription')
      
      window.location.href = phonepeLink
      
      setTimeout(() => {
        if (confirm('Did you complete the payment?')) {
          onSuccess()
        }
      }, 1000)
    } catch {
      toast.error('Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <QRCodeSVG value={phonepeLink} size={200} />
        <p className="text-sm text-muted-foreground">Scan with any UPI app</p>
      </div>

      <div className="flex flex-col gap-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.open(phonepeLink, '_blank')}
          disabled={loading}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Open in UPI App
        </Button>

        <Button 
          className="w-full" 
          onClick={handlePayment}
          disabled={loading}
        >
          Pay ₹{amount}
        </Button>
      </div>
    </div>
  )
} 
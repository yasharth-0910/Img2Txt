'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Copy, Smartphone, AlertCircle } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface UPIPaymentProps {
  amount: number
  planId: string
  onSuccess: () => void
}

export function UPIPayment({ amount, planId, onSuccess }: UPIPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [upiId, setUpiId] = useState('')
  const phonepeLink = `upi://pay?pa=8448173449@ybl&pn=Img2Txt&am=${amount}&cu=INR&tn=Subscription`
  const requiresVerification = amount >= 500 // Require verification for ₹500 or more

  const handlePayment = async () => {
    try {
      setLoading(true)
      
      if (requiresVerification && !upiId) {
        toast.error('Please enter your UPI ID for verification')
        return
      }

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId, 
          amount,
          upiId: requiresVerification ? upiId : undefined
        })
      })

      if (!response.ok) throw new Error('Failed to create subscription')
      
      window.location.href = phonepeLink
      
      setTimeout(() => {
        if (confirm('Did you complete the payment?')) {
          onSuccess()
        }
      }, 1000)
    } catch (error) {
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

      {requiresVerification && (
        <div className="space-y-2">
          <Label htmlFor="upiId">Your UPI ID for verification</Label>
          <Input
            id="upiId"
            placeholder="Enter your UPI ID (e.g., name@upi)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Required for transactions over ₹500
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.open(phonepeLink, '_blank')}
          disabled={loading || (requiresVerification && !upiId)}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Open in UPI App
        </Button>

        <Button 
          className="w-full" 
          onClick={handlePayment}
          disabled={loading || (requiresVerification && !upiId)}
        >
          Pay ₹{amount}
        </Button>
      </div>
    </div>
  )
} 
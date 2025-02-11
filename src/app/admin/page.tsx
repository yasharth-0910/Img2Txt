'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, X } from "lucide-react"

interface PendingSubscription {
  id: string
  userId: string
  user: {
    name: string
    email: string
  }
  planId: string
  amount: number
  customerUpiId: string
  createdAt: string
}

export default function AdminDashboard() {
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingSubscriptions()
  }, [])

  const fetchPendingSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions/pending')
      const data = await response.json()
      setPendingSubscriptions(data.subscriptions)
    } catch (_) {
      toast.error('Failed to fetch pending subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (subscriptionId: string, approve: boolean) => {
    try {
      const response = await fetch('/api/admin/subscriptions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, approve })
      })

      if (!response.ok) throw new Error('Verification failed')
      
      toast.success(approve ? 'Subscription approved' : 'Subscription rejected')
      fetchPendingSubscriptions()
    } catch (_) {
      toast.error('Failed to process verification')
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : pendingSubscriptions.length === 0 ? (
              <p className="text-muted-foreground">No pending verifications</p>
            ) : (
              <div className="space-y-4">
                {pendingSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{sub.user.name}</h3>
                      <p className="text-sm text-muted-foreground">{sub.user.email}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Plan: {sub.planId}</p>
                        <p>Amount: ₹{sub.amount}</p>
                        <p>UPI ID: {sub.customerUpiId}</p>
                        <p>Date: {new Date(sub.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => handleVerification(sub.id, true)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleVerification(sub.id, false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
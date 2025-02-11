import { useState, useEffect } from 'react'
import { plans } from '@/config/subscriptions'
import { toast } from 'sonner'

export function useSubscription() {
  const [plan, setPlan] = useState(plans.free)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/subscription')
        const data = await response.json()
        
        if (data.plan === 'pro') {
          setPlan(plans.pro)
        } else {
          setPlan(plans.free)
        }
      } catch (error) {
        console.error('Subscription check error:', error)
        toast.error('Failed to check subscription status')
        setPlan(plans.free)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [])

  return { plan, loading }
} 
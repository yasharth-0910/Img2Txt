"use client"

import { useSession } from "next-auth/react"
import { plans } from "@/config/subscriptions"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, CreditCard } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useSubscription } from "@/hooks/useSubscription"
import { UPIPayment } from "@/components/upi-payment"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { plan: currentPlan } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (planId: string) => {
    const plan = plans[planId as keyof typeof plans]
    if (!plan) return

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full" disabled>
            Coming Soon
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premium Plans Coming Soon!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We're working hard to bring you premium features. Stay tuned!
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Features you'll get:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.location.href = "mailto:yasharthsingh0910@gmail.com?subject=Interested%20in%20Premium%20Plan"}
            >
              Notify Me When Available
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* User Profile Section */}
          <h1 className="text-3xl font-bold">Settings</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={session?.user?.image || ''} 
                  alt={session?.user?.name || ''} 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{session?.user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Plan: {currentPlan.name}</h4>
                <ul className="text-sm space-y-2">
                  {currentPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <h2 className="text-2xl font-bold">Available Plans</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(plans).map(([id, plan]) => (
              <Card key={id} className="relative">
                {id === 'pro' && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                    Coming Soon
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-3xl font-bold mb-6">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  {handleSubscribe(id)}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
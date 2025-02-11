import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSubscriptionEmail({ 
  to, 
  status, 
  planId 
}: { 
  to: string
  status: 'approved' | 'rejected'
  planId: string
}) {
  const subject = status === 'approved' 
    ? 'Your subscription has been approved!' 
    : 'Subscription update'

  const html = status === 'approved'
    ? `
      <h1>Your subscription is active!</h1>
      <p>Your ${planId} plan subscription has been approved and is now active.</p>
      <p>You can now enjoy all the premium features.</p>
    `
    : `
      <h1>Subscription Update</h1>
      <p>Unfortunately, we couldn't verify your subscription payment.</p>
      <p>Please contact support if you believe this is an error.</p>
    `

  try {
    await resend.emails.send({
      from: 'Img2Txt <notifications@your-domain.com>',
      to,
      subject,
      html
    })
  } catch (error) {
    console.error('Email send error:', error)
  }
} 
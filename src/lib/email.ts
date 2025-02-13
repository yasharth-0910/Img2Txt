import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailParams {
  to: string
  status: 'approved' | 'rejected'
  planId: string
}

export async function sendSubscriptionEmail({ to, status, planId }: EmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured')
    return
  }

  try {
    const subject = status === 'approved' 
      ? 'Your subscription has been approved!' 
      : 'Subscription update'

    const body = status === 'approved'
      ? `Your subscription to the ${planId} plan has been approved. You can now access all features.`
      : `Your subscription request for the ${planId} plan could not be processed at this time.`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
      to,
      subject,
      html: `
        <div>
          <h1>${subject}</h1>
          <p>${body}</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
} 
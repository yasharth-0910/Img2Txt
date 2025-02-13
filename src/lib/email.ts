import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailParams {
  to: string
  status: 'approved' | 'rejected'
  planId: string
}

export async function sendSubscriptionEmail({ to, status, planId }: EmailParams) {
  try {
    const subject = status === 'approved' 
      ? 'Your subscription has been approved!' 
      : 'Subscription update'

    const text = status === 'approved'
      ? `Your subscription to the ${planId} plan has been approved. You can now access all features.`
      : `Your subscription request for the ${planId} plan could not be processed at this time.`

    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to,
      subject,
      text
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
} 
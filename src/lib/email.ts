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

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">
              ${subject}
            </h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              ${status === 'approved' 
                ? `Your subscription to the ${planId} plan has been approved. You can now access all features.`
                : `Your subscription request for the ${planId} plan could not be processed at this time.`
              }
            </p>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
      to,
      subject,
      html
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
} 
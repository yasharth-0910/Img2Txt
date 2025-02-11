export const plans = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    features: [
      'Basic OCR functionality',
      'Up to 50 conversions/month',
      'Standard text extraction',
      'Basic file formats support'
    ],
    limits: {
      extractionsPerDay: 50,
      batchSize: 1,
      enhancementOptions: false,
      aiAnalysis: false
    }
  },
  pro: {
    name: 'Pro',
    description: 'For power users (Coming Soon)',
    price: 499,
    features: [
      'Everything in Free',
      'Unlimited conversions',
      'AI text enhancement',
      'Priority support',
      'Advanced file formats',
      'Batch processing',
      'Export to multiple formats',
      'Advanced analytics'
    ],
    limits: {
      extractionsPerDay: Infinity,
      batchSize: 50,
      enhancementOptions: true,
      aiAnalysis: true
    }
  }
}

export type Plan = typeof plans.free 
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Img2Txt - AI-Powered Image to Text Converter',
  description: 'Convert images to text with AI enhancement, OCR, and smart analysis. Features include text enhancement, language detection, keyword extraction, and more.',
  keywords: [
    'OCR',
    'image to text',
    'AI text enhancement',
    'document scanning',
    'text extraction',
    'machine learning',
    'language detection',
    'keyword extraction',
    'document analysis',
    'text recognition'
  ],
  authors: [{ name: 'Yasharth Singh' }],
  openGraph: {
    type: 'website',
    title: 'Img2Txt - AI-Powered Image to Text Converter',
    description: 'Convert images to text with AI enhancement and smart analysis',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Img2Txt - AI-Powered Image to Text Converter',
    description: 'Convert images to text with AI enhancement and smart analysis',
    images: ['/twitter-image.png'],
  }
} 
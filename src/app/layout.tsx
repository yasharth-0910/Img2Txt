import { Inter } from "next/font/google"
import "./globals.css"
import { RootLayout } from "@/components/root-layout"
import { headers } from 'next/headers'

const inter = Inter({ subsets: ["latin"] })

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Img2Txt",
  "description": "AI-powered image to text converter with smart analysis",
  "applicationCategory": "Utility",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "featureList": [
    "OCR Text Extraction",
    "AI Text Enhancement",
    "Language Detection",
    "Keyword Extraction",
    "Document Analysis"
  ]
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering
  headers()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <RootLayout className={inter.className}>
          {children}
        </RootLayout>
      </body>
    </html>
  )
}
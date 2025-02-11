'use client'

import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { Providers } from "@/components/providers"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { ComingSoonBanner } from '@/components/coming-soon-banner'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ComingSoonBanner />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container py-4">
                <nav className="mx-auto max-w-4xl flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Link href="/" className="text-2xl font-bold">
                      Img2Txt
                    </Link>
                    <div className="hidden md:flex gap-4">
                      <Link 
                        href="/dashboard" 
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/settings" 
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserNav />
                  </div>
                </nav>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container">
                <div className="mx-auto max-w-4xl h-16 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Made with ❤️ by Yasharth Singh
                  </p>
                  <div className="flex items-center gap-4">
                    <Link 
                      href="https://github.com/yasharth-0910" 
                      target="_blank"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      GitHub
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
export const metadata = {
  title: 'Image to Text Converter',
  description: 'Convert images to text using OCR technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CivicMind - Community Decision Intelligence Platform',
  description: 'AI-powered platform for smarter community decisions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f172a] antialiased">
        {children}
      </body>
    </html>
  )
}

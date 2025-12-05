import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haunted Helpdesk - AI-Powered IT Operations',
  description: 'Where IT Nightmares Come to Die',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Creepster&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

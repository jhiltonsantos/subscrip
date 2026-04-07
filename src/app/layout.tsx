import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { cn } from "@/lib/utils/helpers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Subscrip | Subscription Management",
  description: "Control your recurring expenses and avoid surprises.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
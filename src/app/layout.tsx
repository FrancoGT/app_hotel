import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/common/Header"
import { AuthProvider } from "@/context/AuthContext" // Contexto de Autenticación

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Hotel ILLARY",
  description: "Reservas de Hotel",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ Envolver TODO con el AuthProvider */}
        <AuthProvider>
          <div className="flex flex-col min-h-screen w-full">
            <Header />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
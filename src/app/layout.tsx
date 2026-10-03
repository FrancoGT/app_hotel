import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBookingBar } from "@/components/layout/MobileBookingBar";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hotel Illari en Arequipa",
  description:
    "Hotel Illari, Avenida Vidaurrazaga 5, Arequipa. Conoce nuestras habitaciones y consulta disponibilidad para tu próxima estancia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen w-full overflow-x-clip">
            <Header />
            <main className="flex-1 p-4 md:p-6">{children}</main>
            <Footer />
            <MobileBookingBar />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

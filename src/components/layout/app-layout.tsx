"use client"

import type React from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
}
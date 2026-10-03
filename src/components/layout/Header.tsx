"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, LogOut, CalendarCheck, LayoutDashboard, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { BOOKING_PATH, HOTEL } from "@/config/hotel"

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#habitaciones", label: "Habitaciones" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/#contacto", label: "Contacto" },
]

const navLinkClass =
  "rounded px-1 py-1 text-[0.95rem] font-medium text-[var(--illary-ink)] hover:text-[var(--illary-primary)] hover:underline underline-offset-4"

export function Header() {
  const router = useRouter()
  const { isLoggedIn, user, logout, isAdmin } = useAuth()

  const handleLogout = async () => {
    await logout()
    // replace para que no pueda volver con "atrás"
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--illary-line)] bg-white/95 backdrop-blur soft-shadow">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${HOTEL.name}, ir al inicio`}>
          <Image src="/logo_illari_mark.svg" alt="" width={48} height={45} className="h-11 w-auto" priority />
          <span className="font-serif text-xl font-semibold leading-tight text-[var(--illary-ink)]">
            {HOTEL.name}
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={BOOKING_PATH} className="btn-illary hidden sm:inline-flex">
            Consultar disponibilidad
          </Link>

          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="Menú de tu cuenta">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[var(--illary-primary)] text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-md border border-[var(--border-color)] bg-white shadow-md" align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium leading-none text-[var(--illary-ink)]">{user.name}</p>
                  <p className="mt-1 text-xs text-[var(--illary-text)]">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mis-reservas">
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    <span>Mis reservas</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Gestión</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="hidden rounded px-2 py-1 text-sm text-[var(--illary-text)] hover:text-[var(--illary-primary)] hover:underline md:inline"
            >
              Iniciar sesión
            </Link>
          )}

          {/* Menú de navegación en celular y tablet */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menú de navegación">
                  <Menu className="h-6 w-6 text-[var(--illary-ink)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 w-60 rounded-md border border-[var(--border-color)] bg-white shadow-md">
                {NAV_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="text-base">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/nosotros" className="text-base">
                    Nosotros
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={BOOKING_PATH} className="text-base font-semibold text-[var(--illary-primary)]">
                    Consultar disponibilidad
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={HOTEL.phoneHref} className="text-base">
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar al hotel
                  </a>
                </DropdownMenuItem>
                {!isLoggedIn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login">Iniciar sesión</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Registrarse</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

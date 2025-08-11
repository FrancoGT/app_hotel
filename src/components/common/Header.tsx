"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, User, LogOut, Settings, CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logoutUser } from "@/lib/fetcher"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { fetchCurrentUser } from "@/lib/fetcher"

export default function Header() {
  const router = useRouter()
  const { isLoggedIn, user, login, logout } = useAuth()

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          const userResp = await fetchCurrentUser(token)

          if (userResp.data) 
          {
            login(
              {
                name: userResp.data.displayName,
                email: userResp.data.login,
                avatar: "/placeholder.svg?height=32&width=32",
              },
              token
            )
          } 
          else 
          {
            console.error("No se pudo obtener el usuario:", userResp.error)
            logout()
          
          }
        } 
        catch (error) 
        {
          console.error("Error al cargar usuario:", error)
          logout()
        }
      }
    }
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) await logoutUser(token)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      logout()
      router.push("/login")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 soft-shadow">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 md:h-24 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3 header-logo transition-transform hover:scale-105"
          >
            <Image
              src="/logo_reservation.svg"
              alt="ILLARY Logo"
              width={48}
              height={48}
              className="h-12 w-12 md:h-16 md:w-16 transition-all duration-300"
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-[#9F836A] font-serif hover:underline">
              Habitaciones
            </Link>
            <Link href="/nosotros" className="text-sm font-medium text-[#9F836A] font-serif hover:underline">
              Nosotros
            </Link>

            {/* NEW: Mis reservas solo para usuarios logueados (navbar desktop) */}
            {isLoggedIn && user && (
              <Link href="/mis-reservas" className="text-sm font-medium text-[#9F836A] font-serif hover:underline">
                Mis reservas
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-[#9F836A] text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white shadow-md border border-[#e8e0d6] rounded-md"
                  align="end"
                >
                  <DropdownMenuItem className="flex flex-col items-start space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {/* NEW: Mis reservas en el dropdown del avatar (desktop y mobile) */}
                  <DropdownMenuItem asChild>
                    <Link href="/mis-reservas">
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      <span>Mis reservas</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="border-2 border-[#9F836A] text-[#9F836A] bg-transparent hover:bg-[#9F836A] hover:text-white px-4 py-2 text-sm font-medium font-serif rounded-md transition inline-flex items-center justify-center min-w-[120px]"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>

                  <Link href="/register">
                    <Button
                      className="bg-[#9F836A] hover:bg-[#8A7158] text-white px-4 py-2 text-sm font-medium font-serif rounded-md transition inline-flex items-center justify-center min-w-[120px]"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>

                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6 text-[#9F836A]" />
                        <span className="sr-only">Menú de opciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      forceMount
                      className="w-48 bg-white shadow-md border border-[#e8e0d6] rounded-md z-50"
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/">Habitaciones</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/nosotros">Nosotros</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/login">Iniciar Sesión</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">Registrarse</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
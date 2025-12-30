interface WelcomeBannerProps {
  show: boolean
  isLoggedIn: boolean
  user: any
}

export default function WelcomeBanner({ show, isLoggedIn, user }: WelcomeBannerProps) {
  if (!show) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[55] w-full max-w-md mx-4 transition-all duration-500 ease-in-out translate-y-0 opacity-100">
      {isLoggedIn && user ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl shadow-lg backdrop-blur-sm text-center">
          <p className="text-lg font-medium">
            ¡Bienvenido(a), <span className="font-bold">{user.name}</span>!
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl shadow-lg backdrop-blur-sm text-center">
          <p>
            ¡Hola! Para solicitar alguna reserva debes <strong>iniciar sesión</strong> o{" "}
            <strong>registrarte</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
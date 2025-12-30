type NotificationState = {
  show: boolean
  type: "success" | "error"
  message: string
}

interface NotificationProps {
  notification: NotificationState
  onClose: () => void
}

export default function Notification({ notification, onClose }: NotificationProps) {
  if (!notification.show) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] w-full max-w-md mx-4 transition-all duration-500 ease-in-out translate-y-0 opacity-100">
      <div className={`${
        notification.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      } border-2 p-4 rounded-xl shadow-lg backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === "success" ? "bg-green-100" : "bg-red-100"
            }`}>
              {notification.type === "success" ? "✓" : "✕"}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {notification.type === "success" ? "¡Reserva Confirmada!" : "Error en la Reserva"}
              </p>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
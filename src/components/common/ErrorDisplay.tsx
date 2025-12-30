interface ErrorDisplayProps {
  error: string
  onRetry: () => void
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Servicio no disponible</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
        <button
          onClick={onRetry}
          className="bg-[var(--illary-primary)] hover:bg-[var(--illary-primary-dark)] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  )
}
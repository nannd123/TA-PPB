import { AlertCircle, LoaderCircle, SearchX } from 'lucide-react'

export function LoadingState({ label = 'Memuat data...' }) {
  return (
    <div className="state-card loading-state" role="status">
      <LoaderCircle aria-hidden="true" size={22} />
      <strong>{label}</strong>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-card" role="alert">
      <AlertCircle aria-hidden="true" size={22} />
      <strong>Data belum dapat dimuat</strong>
      <p>{error?.message || 'Terjadi kesalahan saat menghubungi server.'}</p>
      {onRetry && (
        <button className="secondary-button" type="button" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, description, children }) {
  return (
    <div className="state-card">
      <SearchX aria-hidden="true" size={22} />
      <strong>{title}</strong>
      <p>{description}</p>
      {children}
    </div>
  )
}

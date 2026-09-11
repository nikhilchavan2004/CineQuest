export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--text-secondary)]">
      <div className="flex items-center gap-3" aria-live="polite">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--accent)] border-t-transparent" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  )
}

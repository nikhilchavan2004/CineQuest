export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between">
      <span>{message || 'Something went wrong. Please try again.'}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="self-start rounded-md border border-red-300/40 px-3 py-1.5 font-semibold hover:bg-red-500/20 sm:self-auto">
          Try again
        </button>
      ) : null}
    </div>
  )
}

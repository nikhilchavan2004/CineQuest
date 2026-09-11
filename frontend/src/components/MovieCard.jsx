import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

export default function MovieCard({ movie }) {
  const { addToWishlist, removeFromWishlist, isInWishlist, pendingMovieId } = useWishlist()
  const movieId = String(movie.id ?? movie.movieId)
  const title = movie.title || 'Untitled movie'
  const saved = isInWishlist(movieId)
  const pending = pendingMovieId === movieId

  async function handleWishlistClick(event) {
    event.preventDefault()
    event.stopPropagation()
    if (pending) return

    if (saved) {
      await removeFromWishlist(movieId)
    } else {
      await addToWishlist(movie)
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_16px_40px_rgba(0,0,0,0.50)] transition-all duration-280 ease-out hover:-translate-y-1.5 hover:scale-[1.015] hover:border-[color:var(--border-hover)] hover:shadow-[0_24px_70px_rgba(225,29,72,0.14)]">
      <Link to={`/movie/${movieId}`} className="block" aria-label={`View details for ${title}`}>
        <div className="relative aspect-[2/3] overflow-hidden bg-[color:var(--surface-raised)]">
          {movie.posterUrl ? (
            <>
              <img
                src={movie.posterUrl}
                alt={`${title} poster`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-450 ease-out group-hover:scale-104"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg)]/75 via-transparent to-transparent opacity-80" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[color:var(--text-secondary)]">
              Poster unavailable
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold text-[color:var(--text-primary)]">{title}</h3>
            <span className="rounded-full bg-[color:var(--rating)]/15 px-2 py-1 text-xs font-medium text-[color:var(--rating)]">
              {movie.rating ?? 'NR'}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 px-4 pb-4">
        <p className="text-sm text-[color:var(--text-secondary)]">{movie.releaseDate?.slice(0, 4) || 'Release year TBD'}</p>
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={pending}
          aria-label={saved ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
          aria-pressed={saved}
          className={`rounded-lg px-3 py-2 text-lg leading-none transition-all duration-250 ease-out focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${saved ? 'scale-105 border border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-hover)] hover:bg-[color:var(--accent-soft)]' : 'border border-[color:var(--border)] bg-[color:var(--surface-raised)] text-[color:var(--text-secondary)] hover:scale-105 hover:border-[color:var(--border-hover)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-primary)]'}`}
        >
          {pending ? '...' : saved ? '♥' : '♡'}
        </button>
      </div>
    </article>
  )
}

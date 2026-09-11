import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import LoadingState from '../components/LoadingState'
import { useWishlist } from '../context/WishlistContext'
import { getApiErrorMessage, movieApi } from '../services/api'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToWishlist, removeFromWishlist, isInWishlist, pendingMovieId } = useWishlist()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const validMovieId = /^\d+$/.test(id || '') && Number(id) > 0

  useEffect(() => {
    if (!validMovieId) {
      setMovie(null)
      setError('Movie ID must be a positive number.')
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    setLoading(true)
    setError('')

    movieApi.getMovieById(id, controller.signal)
      .then((response) => setMovie(response.data.data))
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setError(getApiErrorMessage(requestError, 'Unable to load this movie.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [id, retryToken, validMovieId])

  if (loading) return <LoadingState message="Loading movie details..." />
  if (error) return <div className="space-y-4"><Button variant="secondary" onClick={() => navigate(-1)}>Back</Button><ErrorMessage message={error} onRetry={validMovieId ? () => setRetryToken((current) => current + 1) : undefined} /></div>
  if (!movie) return <div className="space-y-4"><Button variant="secondary" onClick={() => navigate(-1)}>Back</Button><ErrorMessage message="The requested movie could not be found." onRetry={validMovieId ? () => setRetryToken((current) => current + 1) : undefined} /></div>

  const saved = isInWishlist(movie.id)
  const pending = pendingMovieId === String(movie.id)

  async function handleWishlist() {
    if (saved) await removeFromWishlist(movie.id)
    else await addToWishlist(movie)
  }

  return (
    <div className="space-y-6">
      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      <article className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <div className="relative min-h-[260px] overflow-hidden bg-[color:var(--bg-secondary)]">
          {movie.backdropUrl ? <img src={movie.backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg)] via-[color:var(--surface)]/80 to-transparent" />
          <div className="relative flex min-h-[260px] items-end p-6 sm:p-10">
            <h1 className="font-display max-w-3xl text-4xl text-[color:var(--text-primary)] sm:text-5xl">{movie.title}</h1>
          </div>
        </div>
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[240px_1fr]">
          <div className="overflow-hidden rounded-xl bg-[color:var(--surface-raised)]">
            {movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} className="aspect-[2/3] w-full object-cover" /> : <div className="flex aspect-[2/3] items-center justify-center p-4 text-center text-sm text-[color:var(--text-secondary)]">Poster unavailable</div>}
          </div>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 text-sm text-[color:var(--text-secondary)]">
              <span className="rounded-md bg-[color:var(--accent-soft)] px-2 py-1 text-[color:var(--rating)]">Rating: {movie.rating ?? 'NR'}</span>
              <span>Votes: {movie.voteCount ?? 0}</span>
              <span>{movie.releaseDate || 'Release date TBD'}</span>
              {movie.runtime ? <span>{movie.runtime} min</span> : null}
            </div>
            <p className="max-w-3xl text-base leading-7 text-[color:var(--text-secondary)]">{movie.overview || 'No overview available.'}</p>
            <dl className="grid gap-4 border-t border-[color:var(--border)] pt-4 text-sm sm:grid-cols-2">
              <div><dt className="text-[color:var(--secondary)]">Genres</dt><dd className="mt-1 text-[color:var(--text-primary)]">{movie.genres?.join(', ') || 'Not available'}</dd></div>
              <div><dt className="text-[color:var(--secondary)]">Original language</dt><dd className="mt-1 uppercase text-[color:var(--text-primary)]">{movie.language || 'Not available'}</dd></div>
            </dl>
            <Button onClick={handleWishlist} disabled={pending} variant={saved ? 'secondary' : 'primary'}>
              {pending ? 'Updating...' : saved ? 'Remove from wishlist' : 'Add to wishlist'}
            </Button>
          </div>
        </div>
      </article>
    </div>
  )
}
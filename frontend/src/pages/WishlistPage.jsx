import { useWishlist } from '../context/WishlistContext'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import LoadingState from '../components/LoadingState'
import MovieCard from '../components/MovieCard'
import Button from '../components/Button'
import { Link } from 'react-router-dom'

export default function WishlistPage() {
  const { wishlist, isLoading, error } = useWishlist()

  if (isLoading) return <LoadingState message="Loading your wishlist..." />

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!wishlist.length) {
    return (
      <EmptyState
        title="No movies in your wishlist yet"
        description="Save a movie while exploring to keep it here for later."
        action={<Button as={Link} to="/">Discover movies</Button>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[color:var(--text-primary)]">Wishlist</h1>
        <p className="mt-2 text-[color:var(--text-secondary)]">Your saved movies, ready when you are.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {wishlist.map((movie) => <MovieCard key={movie.movieId} movie={{ ...movie, id: movie.movieId }} />)}
      </div>
    </div>
  )
}

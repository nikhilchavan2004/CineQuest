import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import LoadingState from '../components/LoadingState'
import MovieCard from '../components/MovieCard'
import { getApiErrorMessage, movieApi } from '../services/api'

const sections = [
  { key: 'trending', title: 'Trending today', request: movieApi.getTrending },
  { key: 'popular', title: 'Popular now', request: movieApi.getPopular },
  { key: 'topRated', title: 'Top rated', request: movieApi.getTopRated },
  { key: 'upcoming', title: 'Coming soon', request: movieApi.getUpcoming },
]

function MovieSection({ title, movies, loading, error, onRetry }) {
  return (
    <section className="space-y-4" aria-labelledby={`${title}-heading`}>
      <div className="flex items-end justify-between gap-4 border-b border-[color:var(--border)] pb-3">
        <h2 id={`${title}-heading`} className="font-display text-2xl text-[color:var(--text-primary)]">{title}</h2>
        <span className="text-sm text-[color:var(--text-muted)]">Curated through TMDB</span>
      </div>
      {loading ? <LoadingState message={`Loading ${title.toLowerCase()}...`} /> : null}
      {error ? <ErrorMessage message={error} onRetry={onRetry} /> : null}
      {!loading && !error && !movies.length ? (
        <div className="rounded-xl border border-dashed border-[color:var(--border-hover)] p-6 text-sm text-[color:var(--text-secondary)]">No movies available right now.</div>
      ) : null}
      {!loading && !error && movies.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      ) : null}
    </section>
  )
}

export default function HomePage() {
  const [sectionData, setSectionData] = useState(() =>
    Object.fromEntries(sections.map(({ key }) => [key, { movies: [], loading: true, error: '' }]))
  )

  async function loadSection(section) {
    setSectionData((current) => ({ ...current, [section.key]: { ...current[section.key], loading: true, error: '' } }))

    try {
      const response = await section.request(1)
      setSectionData((current) => ({ ...current, [section.key]: { movies: response.data.data || [], loading: false, error: '' } }))
    } catch (requestError) {
      setSectionData((current) => ({ ...current, [section.key]: { movies: [], loading: false, error: getApiErrorMessage(requestError, 'Unable to load this section.') } }))
    }
  }

  useEffect(() => {
    let active = true
    Promise.all(sections.map(async (section) => {
      try {
        const response = await section.request(1)
        if (active) setSectionData((current) => ({ ...current, [section.key]: { movies: response.data.data || [], loading: false, error: '' } }))
      } catch (requestError) {
        if (active) setSectionData((current) => ({ ...current, [section.key]: { movies: [], loading: false, error: getApiErrorMessage(requestError, 'Unable to load this section.') } }))
      }
    }))
    return () => { active = false }
  }, [])

  return (
    <div className="space-y-10">
      <section className="ticket-edge relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:p-12">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[color:var(--secondary)] blur-3xl" />
          <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[color:var(--accent)] blur-3xl opacity-40" />
        </div>
        <div className="relative max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--secondary)]">
            Discover your next favorite film
          </p>
          <h1 className="font-display max-w-[15ch] text-4xl leading-[1.05] text-[color:var(--text-primary)] sm:text-5xl">
            Browse trending titles and build your perfect watchlist.
          </h1>
          <p className="mt-4 max-w-xl text-base text-[color:var(--text-secondary)]">
            Explore upcoming releases, trending picks, and movie details from a clean movie discovery experience.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button as={Link} to="/search">Start searching</Button>
            <Button as={Link} to="/wishlist" variant="secondary">View wishlist</Button>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        {sections.map((section) => (
          <MovieSection
            key={section.key}
            title={section.title}
            movies={sectionData[section.key].movies}
            loading={sectionData[section.key].loading}
            error={sectionData[section.key].error}
            onRetry={() => loadSection(section)}
          />
        ))}
      </div>
    </div>
  )
}
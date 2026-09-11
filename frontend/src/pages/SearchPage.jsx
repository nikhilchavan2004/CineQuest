import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import MovieCard from '../components/MovieCard'
import { getApiErrorMessage, movieApi } from '../services/api'

const DEFAULT_SORT = 'popularity'
const SORT_OPTIONS = {
  popularity: 'Popularity',
  rating: 'Rating',
  releaseDate: 'Release date',
  title: 'Title',
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const requestedSort = searchParams.get('sort') || DEFAULT_SORT
  const sort = Object.prototype.hasOwnProperty.call(SORT_OPTIONS, requestedSort) ? requestedSort : DEFAULT_SORT
  const parsedPage = Number(searchParams.get('page') || 1)
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const [input, setInput] = useState(query)
  const [movies, setMovies] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => setInput(query), [query])

  useEffect(() => {
    const nextQuery = input.trim()
    const timer = window.setTimeout(() => {
      if (nextQuery !== query) {
        const params = new URLSearchParams()
        if (nextQuery) {
          params.set('q', nextQuery)
          params.set('page', '1')
          params.set('sort', sort)
        }
        setSearchParams(params)
      }
    }, 450)
    return () => window.clearTimeout(timer)
  }, [input, query, sort, setSearchParams])

  useEffect(() => {
    if (!query.trim()) {
      setMovies([])
      setPagination(null)
      setError('')
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    setLoading(true)
    setError('')

    movieApi.searchMovies(query, page, sort, controller.signal)
      .then((response) => {
        setMovies(response.data.data || [])
        setPagination(response.data.pagination || null)
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setError(getApiErrorMessage(requestError, 'Unable to search movies.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, query, retryToken, sort])

  function submitSearch(event) {
    event.preventDefault()
    const nextQuery = input.trim()
    setInput(nextQuery)
    const params = new URLSearchParams()
    if (nextQuery) {
      params.set('q', nextQuery)
      params.set('page', '1')
      params.set('sort', sort)
    }
    setSearchParams(params)
  }

  function handleSortChange(event) {
    const nextSort = event.target.value
    const params = new URLSearchParams(searchParams)
    params.set('sort', nextSort)
    params.set('page', '1')
    setSearchParams(params)
  }

  function retrySearch() {
    setRetryToken((current) => current + 1)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h1 className="font-display text-3xl text-[color:var(--text-primary)]">Search movies</h1>
        <p className="mt-2 text-[color:var(--text-secondary)]">Explore TMDB-backed movie results with reusable ordering.</p>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
          <label htmlFor="movie-search" className="sr-only">
            Search for a movie
          </label>
          <input
            id="movie-search"
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search for a title..."
            className="w-full rounded-xl border border-[color:var(--border-hover)] bg-[color:var(--surface-raised)] px-4 py-3 text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:outline-none"
          />
          <select value={sort} onChange={handleSortChange} className="rounded-xl border border-[color:var(--border-hover)] bg-[color:var(--surface-raised)] px-4 py-3 text-[color:var(--text-primary)] focus:border-[color:var(--accent)] focus:outline-none">
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button type="submit" className="sm:w-auto">Search</Button>
        </form>
      </div>

      {!query.trim() ? <EmptyState title="Search for a movie" description="Enter a title to discover matching movies." /> : null}
      {loading ? <LoadingState message={`Searching for “${query}”...`} /> : null}
      {error ? <ErrorMessage message={error} onRetry={retrySearch} /> : null}
      {!loading && !error && query.trim() && !movies.length ? <EmptyState title="No movies found" description={`We couldn't find results for “${query}”. Try another title.`} /> : null}
      {!loading && !error && movies.length ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
          {pagination?.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm text-[color:var(--text-secondary)]">
              <button type="button" disabled={page <= 1} onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.set('page', String(page - 1))
                setSearchParams(params)
              }} className="rounded-md border border-[color:var(--border-hover)] px-3 py-2 disabled:opacity-40">Previous</button>
              <span>Page {page} of {pagination.totalPages}</span>
              <button type="button" disabled={page >= pagination.totalPages} onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.set('page', String(page + 1))
                setSearchParams(params)
              }} className="rounded-md border border-[color:var(--border-hover)] px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
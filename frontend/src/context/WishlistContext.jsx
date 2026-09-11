import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAnonymousUserId } from '../hooks/useAnonymousUserId'
import { getApiErrorMessage, wishlistApi } from '../services/api'

const WishlistContext = createContext(null)

function normalizeId(value) {
  return String(value ?? '').trim()
}

function normalizeWishlistItems(items = []) {
  return items.map((item) => {
    const normalizedMovieId = normalizeId(item.movieId ?? item.id)
    return {
      ...item,
      movieId: normalizedMovieId,
      id: normalizedMovieId,
    }
  })
}

export function WishlistProvider({ children }) {
  const anonymousUserId = useAnonymousUserId()
  const [wishlist, setWishlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingMovieId, setPendingMovieId] = useState(null)
  const [error, setError] = useState('')
  const latestLoadRunRef = useRef(0)

  const loadWishlist = useCallback(async () => {
    const runId = latestLoadRunRef.current + 1
    latestLoadRunRef.current = runId

    setIsLoading(true)
    setError('')

    try {
      const response = await wishlistApi.getWishlist(anonymousUserId)
      if (runId !== latestLoadRunRef.current) return

      setWishlist(normalizeWishlistItems(response.data.data || []))
    } catch (requestError) {
      if (runId !== latestLoadRunRef.current) return
      setError(getApiErrorMessage(requestError, 'Unable to load your wishlist.'))
    } finally {
      if (runId === latestLoadRunRef.current) setIsLoading(false)
    }
  }, [anonymousUserId])

  useEffect(() => {
    let cancelled = false

    async function fetchWishlist() {
      if (cancelled) return
      await loadWishlist()
    }

    fetchWishlist()

    return () => {
      cancelled = true
    }
  }, [anonymousUserId, loadWishlist])

  async function addToWishlist(movie) {
    const normalizedMovieId = normalizeId(movie.id ?? movie.movieId)
    const moviePayload = {
      anonymousUserId,
      movieId: normalizedMovieId,
      title: movie.title,
      posterUrl: movie.posterUrl,
      releaseDate: movie.releaseDate,
      rating: movie.rating,
    }

    if (pendingMovieId === normalizedMovieId) return { success: false, message: 'Request already in progress.' }

    setPendingMovieId(normalizedMovieId)
    setError('')

    try {
      const response = await wishlistApi.addToWishlist(moviePayload)
      setWishlist((currentWishlist) => {
        const alreadyPresent = currentWishlist.some((item) => String(item.movieId ?? item.id) === normalizedMovieId)
        if (alreadyPresent) return currentWishlist
        return [...currentWishlist, normalizeWishlistItems([response.data.data])[0]]
      })
      return { success: true }
    } catch (requestError) {
      if (requestError?.response?.status === 409) {
        await loadWishlist()
        return { success: true, message: 'This movie is already in your wishlist.', duplicate: true }
      }

      const message = getApiErrorMessage(requestError, 'Unable to add this movie to your wishlist.')
      setError(message)
      return { success: false, message }
    } finally {
      setPendingMovieId(null)
    }
  }

  async function removeFromWishlist(movieId) {
    const normalizedMovieId = normalizeId(movieId)
    if (pendingMovieId === normalizedMovieId) return { success: false, message: 'Request already in progress.' }

    setPendingMovieId(normalizedMovieId)
    setError('')

    try {
      await wishlistApi.removeFromWishlist(normalizedMovieId, anonymousUserId)
      setWishlist((currentWishlist) =>
        currentWishlist.filter((item) => String(item.movieId ?? item.id) !== normalizedMovieId)
      )
      return { success: true }
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to remove this movie from your wishlist.')
      setError(message)
      return { success: false, message }
    } finally {
      setPendingMovieId(null)
    }
  }

  const value = useMemo(
    () => ({
      anonymousUserId,
      wishlist,
      isLoading,
      pendingMovieId,
      error,
      addToWishlist,
      removeFromWishlist,
      isInWishlist: (movieId) =>
        wishlist.some((item) => normalizeId(item.movieId ?? item.id) === normalizeId(movieId)),
    }),
    [anonymousUserId, error, isLoading, pendingMovieId, wishlist]
  )

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }

  return context
}

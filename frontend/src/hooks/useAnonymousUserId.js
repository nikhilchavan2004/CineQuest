import { useMemo } from 'react'

const STORAGE_KEY = 'movie-discovery-anonymous-user-id'

function createAnonymousUserId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useAnonymousUserId() {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return 'browser-only'
    }

    const existingId = window.localStorage.getItem(STORAGE_KEY)

    if (existingId) {
      return existingId
    }

    const nextId = createAnonymousUserId()
    window.localStorage.setItem(STORAGE_KEY, nextId)
    return nextId
  }, [])
}

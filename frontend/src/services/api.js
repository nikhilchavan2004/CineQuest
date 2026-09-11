import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const wishlistApi = {
  getWishlist: (anonymousUserId) =>
    api.get('/wishlist', {
      params: { anonymousUserId },
    }),
  addToWishlist: (payload) => api.post('/wishlist', payload),
  removeFromWishlist: (movieId, anonymousUserId) =>
    api.delete(`/wishlist/${movieId}`, {
      params: { anonymousUserId },
    }),
}

export const movieApi = {
  getTrending: (page = 1) => api.get('/movies/trending', { params: { page } }),
  getPopular: (page = 1) => api.get('/movies/popular', { params: { page } }),
  getTopRated: (page = 1) => api.get('/movies/top-rated', { params: { page } }),
  getUpcoming: (page = 1) => api.get('/movies/upcoming', { params: { page } }),
  searchMovies: (query, page = 1, sort = 'popularity', signal) =>
    api.get('/movies/search', {
      params: { q: query, page, sort },
      signal,
    }),
  getMovieById: (movieId, signal) => api.get(`/movies/${movieId}`, { signal }),
}

export function getApiErrorMessage(error, fallback = 'Unable to load movie data.') {
  if (error?.code === 'ERR_CANCELED') return null
  const status = error?.response?.status

  if (status === 404) return 'The requested movie could not be found.'
  if (status === 400) return 'Please check the request and try again.'
  if (status === 409) return 'This movie is already in your wishlist.'
  return fallback
}

export default api

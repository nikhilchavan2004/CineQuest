const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const TMDB_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 5 * 60 * 1000;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: TMDB_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

const readOnlyCache = new Map();

function getTmdbParams(overrides = {}) {
  const params = { ...overrides };

  if (process.env.TMDB_API_KEY) {
    params.api_key = process.env.TMDB_API_KEY;
  }

  return params;
}

function buildPosterUrl(path, width = 'w500') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${width}${path}`;
}

function buildBackdropUrl(path, width = 'w780') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${width}${path}`;
}

function normalizeMovie(rawMovie) {
  if (!rawMovie || typeof rawMovie !== 'object') {
    return null;
  }

  const genreNames = Array.isArray(rawMovie.genres)
    ? rawMovie.genres.map((genre) => genre?.name || genre?.id).filter(Boolean)
    : [];

  const genreIds = Array.isArray(rawMovie.genre_ids) ? rawMovie.genre_ids : [];

  return {
    id: rawMovie.id ?? null,
    title: rawMovie.title || rawMovie.name || 'Untitled',
    overview: rawMovie.overview || 'No overview available.',
    posterUrl: buildPosterUrl(rawMovie.poster_path),
    backdropUrl: buildBackdropUrl(rawMovie.backdrop_path),
    releaseDate: rawMovie.release_date || rawMovie.first_air_date || null,
    rating: typeof rawMovie.vote_average === 'number' ? rawMovie.vote_average : null,
    voteCount: typeof rawMovie.vote_count === 'number' ? rawMovie.vote_count : 0,
    popularity: typeof rawMovie.popularity === 'number' ? rawMovie.popularity : null,
    genres: genreNames.length > 0 ? genreNames : genreIds,
    language: rawMovie.original_language || null,
    runtime: typeof rawMovie.runtime === 'number' ? rawMovie.runtime : null,
  };
}

function normalizeMovies(results = []) {
  return results.map(normalizeMovie).filter(Boolean);
}

function sortMovies(results = [], sort = 'popularity') {
  const allowedSorts = new Set(['popularity', 'rating', 'releaseDate', 'title']);
  const nextSort = allowedSorts.has(sort) ? sort : 'popularity';
  const sortedResults = [...results];

  if (nextSort === 'title') {
    return sortedResults.sort((left, right) => (left.title || '').localeCompare(right.title || ''));
  }

  if (nextSort === 'releaseDate') {
    return sortedResults.sort((left, right) => {
      const leftDate = left.releaseDate || '0000-00-00';
      const rightDate = right.releaseDate || '0000-00-00';
      return rightDate.localeCompare(leftDate);
    });
  }

  if (nextSort === 'rating') {
    return sortedResults.sort((left, right) => Number(right.rating ?? 0) - Number(left.rating ?? 0));
  }

  return sortedResults.sort((left, right) => Number(right.popularity ?? 0) - Number(left.popularity ?? 0));
}

async function fetchJson(url, params = {}) {
  if (!process.env.TMDB_API_KEY) {
    const error = new Error('TMDB API key is not configured');
    error.statusCode = 500;
    throw error;
  }

  try {
    const response = await tmdbClient.get(url, { params: getTmdbParams(params) });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.status_message || error.message;

    if (error.code === 'ECONNABORTED' || error.message === 'timeout of 8000ms exceeded') {
      const timeoutError = new Error('TMDB request timed out');
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    if (status >= 400 && status < 500) {
      const clientError = new Error(message || 'TMDB request failed');
      clientError.statusCode = status;
      throw clientError;
    }

    if (status >= 500) {
      const serverError = new Error(message || 'TMDB server error');
      serverError.statusCode = status;
      throw serverError;
    }

    const genericError = new Error(message || 'Unable to fetch movie data');
    genericError.statusCode = 502;
    throw genericError;
  }
}

async function cachedReadOnly(endpointName, page, supplier) {
  const key = `${endpointName}:${page}`;
  const existing = readOnlyCache.get(key);
  const now = Date.now();

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  try {
    const value = await supplier();
    readOnlyCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  } catch (error) {
    readOnlyCache.delete(key);
    throw error;
  }
}

async function getTrendingMovies(page = 1) {
  return cachedReadOnly('trending', page, async () => {
    const data = await fetchJson('/trending/movie/day', { page });

    return {
      results: normalizeMovies(data.results || []),
      page: Number(data.page || page),
      totalPages: Number(data.total_pages || 0),
      totalResults: Number(data.total_results || 0),
    };
  });
}

async function getPopularMovies(page = 1) {
  return cachedReadOnly('popular', page, async () => {
    const data = await fetchJson('/movie/popular', { page });

    return {
      results: normalizeMovies(data.results || []),
      page: Number(data.page || page),
      totalPages: Number(data.total_pages || 0),
      totalResults: Number(data.total_results || 0),
    };
  });
}

async function getTopRatedMovies(page = 1) {
  return cachedReadOnly('top-rated', page, async () => {
    const data = await fetchJson('/movie/top_rated', { page });

    return {
      results: normalizeMovies(data.results || []),
      page: Number(data.page || page),
      totalPages: Number(data.total_pages || 0),
      totalResults: Number(data.total_results || 0),
    };
  });
}

async function getUpcomingMovies(page = 1) {
  return cachedReadOnly('upcoming', page, async () => {
    const data = await fetchJson('/movie/upcoming', { page });

    return {
      results: normalizeMovies(data.results || []),
      page: Number(data.page || page),
      totalPages: Number(data.total_pages || 0),
      totalResults: Number(data.total_results || 0),
    };
  });
}

async function searchMovies(query, page = 1, sort = 'popularity') {
  if (!query || !query.trim()) {
    const error = new Error('Search query is required');
    error.statusCode = 400;
    throw error;
  }

  const sanitizedQuery = query.trim();
  const data = await fetchJson('/search/movie', {
    query: sanitizedQuery,
    page,
  });

  const results = normalizeMovies(data.results || []);

  return {
    results: sortMovies(results, sort),
    page: Number(data.page || page),
    totalPages: Number(data.total_pages || 0),
    totalResults: Number(data.total_results || 0),
  };
}

async function getMovieById(movieId) {
  const parsedId = Number(movieId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    const error = new Error('Invalid movie id');
    error.statusCode = 400;
    throw error;
  }

  const data = await fetchJson(`/movie/${parsedId}`);

  const movie = normalizeMovie(data);

  if (!movie) {
    const error = new Error('Movie not found');
    error.statusCode = 404;
    throw error;
  }

  return movie;
}

module.exports = {
  normalizeMovie,
  normalizeMovies,
  sortMovies,
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieById,
};

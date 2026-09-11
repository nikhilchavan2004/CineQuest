function isMissing(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function normalizeAnonymousUserId(value) {
  return String(value ?? '').trim();
}

function normalizeMovieId(value) {
  return String(value ?? '').trim();
}

function validateWishlistPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    const error = new Error('Request body must be a valid object');
    error.statusCode = 400;
    throw error;
  }

  const anonymousUserId = normalizeAnonymousUserId(payload.anonymousUserId);
  if (!anonymousUserId) {
    const error = new Error('anonymousUserId is required');
    error.statusCode = 400;
    throw error;
  }

  const movieId = normalizeMovieId(payload.movieId);
  if (!movieId) {
    const error = new Error('movieId is required');
    error.statusCode = 400;
    throw error;
  }

  const title = String(payload.title ?? '').trim();
  if (!title) {
    const error = new Error('title is required');
    error.statusCode = 400;
    throw error;
  }

  let rating = payload.rating;
  if (!isMissing(rating)) {
    rating = Number(rating);
    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      const error = new Error('rating must be a number between 0 and 10');
      error.statusCode = 400;
      throw error;
    }
  }

  const posterUrl = isMissing(payload.posterUrl) ? null : String(payload.posterUrl).trim();
  const releaseDate = isMissing(payload.releaseDate) ? null : String(payload.releaseDate).trim();

  return {
    anonymousUserId,
    movieId,
    title,
    posterUrl,
    releaseDate,
    rating: rating ?? null,
  };
}

module.exports = { validateWishlistPayload, normalizeAnonymousUserId, normalizeMovieId };

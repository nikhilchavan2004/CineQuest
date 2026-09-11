const {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieById,
} = require('../services/tmdbService');

async function getTrending(req, res, next) {
  try {
    const page = Number(req.query.page || 1);

    if (!Number.isInteger(page) || page < 1) {
      const error = new Error('Page must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    const data = await getTrendingMovies(page);
    res.status(200).json({
      success: true,
      data: data.results,
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getPopular(req, res, next) {
  try {
    const page = Number(req.query.page || 1);

    if (!Number.isInteger(page) || page < 1) {
      const error = new Error('Page must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    const data = await getPopularMovies(page);
    res.status(200).json({
      success: true,
      data: data.results,
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getTopRated(req, res, next) {
  try {
    const page = Number(req.query.page || 1);

    if (!Number.isInteger(page) || page < 1) {
      const error = new Error('Page must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    const data = await getTopRatedMovies(page);
    res.status(200).json({
      success: true,
      data: data.results,
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getUpcoming(req, res, next) {
  try {
    const page = Number(req.query.page || 1);

    if (!Number.isInteger(page) || page < 1) {
      const error = new Error('Page must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    const data = await getUpcomingMovies(page);
    res.status(200).json({
      success: true,
      data: data.results,
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function searchMoviesController(req, res, next) {
  try {
    const query = req.query.q;
    const page = Number(req.query.page || 1);
    const requestedSort = String(req.query.sort || 'popularity');
    const allowedSorts = new Set(['popularity', 'rating', 'releaseDate', 'title']);
    const sort = allowedSorts.has(requestedSort) ? requestedSort : 'popularity';

    if (!query || !String(query).trim()) {
      const error = new Error('Search query is required');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(page) || page < 1) {
      const error = new Error('Page must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    const data = await searchMovies(query, page, sort);
    res.status(200).json({
      success: true,
      data: data.results,
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getMovieByIdController(req, res, next) {
  try {
    const movieId = req.params.id;
    const movie = await getMovieById(movieId);

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTrending,
  getPopular,
  getTopRated,
  getUpcoming,
  searchMoviesController,
  getMovieByIdController,
};

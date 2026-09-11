const express = require('express');

const {
  getTrending,
  getPopular,
  getTopRated,
  getUpcoming,
  searchMoviesController,
  getMovieByIdController,
} = require('../controllers/movieController');

const router = express.Router();

router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/top-rated', getTopRated);
router.get('/upcoming', getUpcoming);
router.get('/search', searchMoviesController);
router.get('/:id', getMovieByIdController);

module.exports = router;

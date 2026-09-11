const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeMovie, sortMovies } = require('./tmdbService');

test('normalizeMovie converts TMDB movie data into app-friendly payload', () => {
  const rawMovie = {
    id: 27205,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
    vote_count: 2200,
    genre_ids: [28, 53, 878],
    original_language: 'en',
  };

  const normalized = normalizeMovie(rawMovie);

  assert.equal(normalized.id, 27205);
  assert.equal(normalized.title, 'Inception');
  assert.equal(normalized.overview, 'A thief who steals corporate secrets through dream-sharing technology.');
  assert.equal(normalized.posterUrl, 'https://image.tmdb.org/t/p/w500/poster.jpg');
  assert.equal(normalized.backdropUrl, 'https://image.tmdb.org/t/p/w780/backdrop.jpg');
  assert.equal(normalized.releaseDate, '2010-07-16');
  assert.equal(normalized.rating, 8.8);
  assert.equal(normalized.voteCount, 2200);
  assert.deepEqual(normalized.genres, [28, 53, 878]);
  assert.equal(normalized.language, 'en');
});

test('sortMovies applies supported search ordering options safely', () => {
  const movies = [
    { id: 1, title: 'Batman', releaseDate: '2005-06-17', rating: 6.8, popularity: 88 },
    { id: 2, title: 'Inception', releaseDate: '2010-07-16', rating: 8.8, popularity: 99 },
  ];

  const byRating = sortMovies(movies, 'rating');
  const byReleaseDate = sortMovies(movies, 'releaseDate');
  const byTitle = sortMovies(movies, 'title');
  const byPopularity = sortMovies(movies, 'popularity');

  assert.deepEqual(byRating.map((movie) => movie.id), [2, 1]);
  assert.deepEqual(byReleaseDate.map((movie) => movie.id), [2, 1]);
  assert.deepEqual(byTitle.map((movie) => movie.id), [1, 2]);
  assert.deepEqual(byPopularity.map((movie) => movie.id), [2, 1]);
});

const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeAnonymousUserId, normalizeMovieId, validateWishlistPayload } = require('./../utils/wishlistValidation');

test('validateWishlistPayload accepts a valid wishlist payload', () => {
  const payload = {
    anonymousUserId: 'anonymous-user-a',
    movieId: '27205',
    title: 'Inception',
    posterUrl: 'https://example.com/poster.jpg',
    releaseDate: '2010-07-16',
    rating: 8.8,
  };

  const result = validateWishlistPayload(payload);

  assert.equal(result.anonymousUserId, 'anonymous-user-a');
  assert.equal(result.movieId, '27205');
  assert.equal(result.title, 'Inception');
  assert.equal(result.posterUrl, 'https://example.com/poster.jpg');
  assert.equal(result.releaseDate, '2010-07-16');
  assert.equal(result.rating, 8.8);
});

test('normalizeAnonymousUserId trims and preserves a single canonical anonymous ID string', () => {
  assert.equal(normalizeAnonymousUserId('  demo-user-123  '), 'demo-user-123');
  assert.equal(normalizeAnonymousUserId(null), '');
});

test('normalizeMovieId trims and preserves a canonical movie ID string', () => {
  assert.equal(normalizeMovieId('  27205  '), '27205');
  assert.equal(normalizeMovieId(undefined), '');
});

test('validateWishlistPayload rejects a payload missing anonymousUserId', () => {
  assert.throws(() => validateWishlistPayload({ movieId: '27205', title: 'Inception' }), /anonymousUserId is required/);
});

test('validateWishlistPayload rejects a payload missing movieId', () => {
  assert.throws(() => validateWishlistPayload({ anonymousUserId: 'anonymous-user-a', title: 'Inception' }), /movieId is required/);
});

test('validateWishlistPayload rejects an invalid rating', () => {
  assert.throws(() => validateWishlistPayload({ anonymousUserId: 'anonymous-user-a', movieId: '27205', title: 'Inception', rating: 11 }), /rating must be a number between 0 and 10/);
});

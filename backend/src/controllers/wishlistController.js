const WishlistItem = require('../models/WishlistItem');
const { normalizeAnonymousUserId, normalizeMovieId, validateWishlistPayload } = require('../utils/wishlistValidation');

async function getWishlist(req, res, next) {
  try {
    const anonymousUserId = normalizeAnonymousUserId(req.query.anonymousUserId);

    if (!anonymousUserId) {
      const error = new Error('anonymousUserId is required');
      error.statusCode = 400;
      throw error;
    }

    const items = await WishlistItem.find({ anonymousUserId }).sort({ addedAt: -1, createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const normalizedPayload = validateWishlistPayload(req.body);

    const existingItem = await WishlistItem.findOne({
      anonymousUserId: normalizedPayload.anonymousUserId,
      movieId: normalizedPayload.movieId,
    });

    if (existingItem) {
      const error = new Error('Movie already exists in the wishlist for this anonymous user');
      error.statusCode = 409;
      throw error;
    }

    const item = await WishlistItem.create(normalizedPayload);

    res.status(201).json({
      success: true,
      message: 'Movie added to wishlist',
      data: item,
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Movie already exists in the wishlist for this anonymous user');
      duplicateError.statusCode = 409;
      return next(duplicateError);
    }

    if (error.statusCode === 409) {
      return next(error);
    }

    next(error);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const anonymousUserId = normalizeAnonymousUserId(req.query.anonymousUserId);
    const movieId = normalizeMovieId(req.params.movieId);

    if (!anonymousUserId) {
      const error = new Error('anonymousUserId is required');
      error.statusCode = 400;
      throw error;
    }

    if (!movieId) {
      const error = new Error('movieId is required');
      error.statusCode = 400;
      throw error;
    }

    const removedItem = await WishlistItem.findOneAndDelete({ anonymousUserId, movieId });

    if (!removedItem) {
      const error = new Error('Movie not found in wishlist for this anonymous user');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Movie removed from wishlist',
      data: removedItem,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

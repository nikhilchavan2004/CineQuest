const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    anonymousUserId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      set: (value) => String(value).trim(),
    },
    movieId: {
      type: String,
      required: true,
      trim: true,
      set: (value) => String(value).trim(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterUrl: {
      type: String,
      default: null,
    },
    releaseDate: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: null,
      min: 0,
      max: 10,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

wishlistItemSchema.index({ anonymousUserId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);

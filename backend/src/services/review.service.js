const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Keeps ratingAverage / ratingCount on the product in sync with its reviews.
exports.recalculateRating = async (productId) => {
  const id = new mongoose.Types.ObjectId(String(productId));
  const count = await Review.countDocuments({ product: id });
  let average = 0;
  if (count > 0) {
    const [agg] = await Review.aggregate([{ $match: { product: id } }, { $group: { _id: null, total: { $sum: '$rating' } } }]);
    average = agg && agg.total ? Math.round((agg.total / count) * 10) / 10 : 0;
  }
  await Product.updateOne({ _id: id }, { ratingAverage: average, ratingCount: count });
};

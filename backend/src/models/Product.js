const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: String, required: true, trim: true, maxlength: 60 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
      validate: {
        validator(v) {
          return v == null || v <= this.price;
        },
        message: 'Discount price cannot be higher than price',
      },
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    images: [{ url: { type: String, required: true }, alt: { type: String, default: '' }, _id: false }],
    // Computed automatically before saving (see pre-validate hook). Stored so we can filter/sort/index on them.
    finalPrice: { type: Number, default: 0, min: 0, index: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    isLowStock: { type: Boolean, default: false, index: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    specifications: [{ key: String, value: String, _id: false }],
    features: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ soldCount: -1 });

productSchema.pre('validate', function computePrices(next) {
  const hasDiscount = this.discountPrice != null && this.discountPrice < this.price;
  this.finalPrice = hasDiscount ? this.discountPrice : this.price;
  this.discountPercent = hasDiscount && this.price > 0 ? Math.round(((this.price - this.discountPrice) / this.price) * 100) : 0;
  this.isLowStock = this.stock > 0 && this.stock <= this.lowStockThreshold;
  next();
});

productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0;
});

productSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);

import mongoose from 'mongoose'

// Side Schema
const sideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  extraPrice: { type: Number, default: 0 },
  img: { type: String, default: '' }
}, { _id: true })

// Variant Schema
const variantSchema = new mongoose.Schema({
  variant: { type: String, required: true }, // e.g., "Small", "Medium", "Large"
  price: { type: Number, required: true },
  img: { type: String, default: '' }
}, { _id: true })

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  variants: [variantSchema],
  sides: [sideSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Indexes for efficient querying
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 }) // Compound index for filtering available items
menuItemSchema.index({ categoryId: 1 }) // For queries by category

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema)


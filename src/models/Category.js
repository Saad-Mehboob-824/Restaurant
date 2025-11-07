import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
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
  headerImage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Indexes for efficient querying
categorySchema.index({ restaurantId: 1, name: 1 }) // Compound index for unique category names per restaurant

// Update updatedAt before saving
categorySchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)


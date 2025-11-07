import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'employee', 'rider', 'waiter', 'kitchen'],
    required: true
  },
  branch: {
    type: String,
    default: '' // Empty string for Global users, branch name for specific branch users
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  __v: {
    type: Number,
    select: false
  }
})

// Compound unique index: email must be unique per restaurantId and branch
userSchema.index({ restaurantId: 1, email: 1, branch: 1 }, { unique: true })
// Index for querying by branch
userSchema.index({ restaurantId: 1, branch: 1 })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
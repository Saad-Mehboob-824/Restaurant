import mongoose from 'mongoose'

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' }
}, { _id: false })

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, default: '' }, // Denormalized name for reference
  variant: { type: String, default: '' }, // Selected variant name
  price: { type: Number, required: true }, // Price at time of order
  quantity: { type: Number, default: 1 },
  selectedSides: [{
    name: String, // Changed from sideName to name
    extraPrice: Number,
    img: String // Optional image
  }]
}, { _id: false })

// Order Schema (normalized collection)
const orderSchema = new mongoose.Schema({
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Restaurant',
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  customer: {
    type: customerSchema,
    required: true
  },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'preparing', 'prepared', 'delivering', 'delivered', 'declined'],
    default: 'pending',
    index: true
  },
  type: {
    type: String,
    enum: ['pickup', 'delivery', 'dinein'],
    default: 'delivery'
  },
  branch: { 
    type: String, 
    default: '', // Location key (e.g., 'islamabad', 'rawalpindi') for pickup orders
    trim: false, // Disable trim to ensure value is preserved
    required: false // Explicitly not required
  },
  instructions: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  // Ensure all fields are saved, even if they have default values
  minimize: false
})

// Indexes for efficient querying
// Primary query pattern: get orders by restaurant, ordered by date
orderSchema.index({ restaurantId: 1, createdAt: -1 })

// Status filtering: get orders by restaurant and status
orderSchema.index({ restaurantId: 1, status: 1 })

// Branch filtering: get orders by restaurant and branch/location
orderSchema.index({ restaurantId: 1, branch: 1 })

// Menu item lookups: find orders containing specific menu items
orderSchema.index({ restaurantId: 1, 'items.menuItemId': 1 })

// Global ordering for analytics
orderSchema.index({ createdAt: -1 })

// Delete existing model if it exists to force schema recompilation with branch field
if (mongoose.models.Order) {
  delete mongoose.models.Order
}
// Only delete from modelSchemas if it exists
if (mongoose.modelSchemas && mongoose.modelSchemas.Order) {
  delete mongoose.modelSchemas.Order
}

export const Order = mongoose.model('Order', orderSchema)

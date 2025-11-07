import mongoose from 'mongoose'

// Branch Schema
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },                  // e.g. "Downtown"
  address: { type: String, required: true },
  phone: { type: String },
  city: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  status: {
    type: String,
    enum: ["Open", "Temporarily Closed", "Closed"],
    default: "Open",
  },
  createdAt: { type: Date, default: Date.now },
}, { _id: false })

// Main Restaurant Schema
const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    description: { type: String },                          // "Brunch classics & seasonal plates."
    cuisine: { type: String },                              // "Modern American"
    owner: { type: String },                                // "Alex Rivera"
    contactEmail: { type: String },
    contactPhone: { type: String },
    isLive: { type: Boolean, default: false },              // toggle for visibility
    totalBranches: { type: Number, default: 0 },            // auto-updated
    branches: [branchSchema],
  },
  { timestamps: true }
)

// Note: Categories and MenuItems are now in separate collections (Category, MenuItem)
// Note: Users are now in separate collection (User)
// Note: Orders are in separate collection (Order)

// Auto-update totalBranches before saving
restaurantSchema.pre('save', function(next) {
  this.totalBranches = this.branches ? this.branches.length : 0
  next()
})

export const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema)


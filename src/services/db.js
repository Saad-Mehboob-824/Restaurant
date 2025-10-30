import mongoose from 'mongoose';

// 🧩 Database Connection
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Neither MONGODB_URI nor MONGO_URI is defined in environment variables');
}

// Validate MongoDB URI format
if (!MONGODB_URI.includes('mongodb+srv://') && !MONGODB_URI.includes('mongodb://')) {
  throw new Error('❌ Invalid MongoDB URI format. Must start with mongodb+srv:// or mongodb://');
}

// Create a cached connection
let cachedConnection = null;

export async function connectToDB() {
  try {
    // Use cached connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // Reuse existing connection
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    // Establish new connection with optimized settings
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: 'restaurant',
      bufferCommands: false,
      
      // Connection pool optimization
      maxPoolSize: 10,  // Maximum connections in pool
      minPoolSize: 2,   // Minimum connections to maintain
      
      // Timeout optimizations
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // Write/Read concerns
      retryWrites: true,
      retryReads: true,
      w: 'majority',
    });

    cachedConnection = conn;
    console.log('✅ Connected to MongoDB');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedConnection = null;
    throw error;
  }
}

// 🧾 Category Schema with Indexes
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }, // Add index for faster lookups
  image: String,
});

export const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema);

// 🍕 Menu Item Schema with Indexes
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  price: { type: Number, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true  // Index for faster category filtering
  },
  sides: [
    {
      name: { type: String, required: true },
      required: { type: Boolean, default: false },
      options: [
        {
          name: { type: String, required: true },
          extraPrice: { type: Number, default: 0 },
          image: String,
        },
      ],
    },
  ],
  isAvailable: { type: Boolean, default: true, index: true }, // Index for availability filtering
  createdAt: { type: Date, default: Date.now },
});

// Compound index for common query pattern
menuItemSchema.index({ category: 1, isAvailable: 1 });

export const MenuItem =
  mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

// 🛍️ Order Schema with Indexes
const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  items: [
    {
      menuItem: { 
        type: String,
        required: true
      },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
      selectedSides: [
        {
          sideName: String,
          optionName: String,
          extraPrice: Number,
        },
      ],
    },
  ],
  total: Number,
  status: { 
    type: String, 
    default: 'pending',
    index: true  // Index for status filtering
  },
  instructions: String,
  createdAt: { type: Date, default: Date.now, index: true }, // Index for sorting by date
});

export const Order =
  mongoose.models.Order || mongoose.model('Order', orderSchema);

//
// 🧾 OPTIMIZED CRUD Functions ───────────────────────────────────────────────
//

// 📋 Get all categories (using lean for better performance)
export async function getAllCategories() {
  await connectToDB();
  const categories = await Category.find().lean().exec();
  return categories;
}

// 🍽️ Get all menu items (optimized with select and lean)
export async function getAllMenuItems() {
  await connectToDB();
  const items = await MenuItem
    .find({ isAvailable: true })
    .populate('category', 'name image') // Only select needed fields
    .lean()
    .exec();
  return items;
}

// 🧾 Get all categories with their menu items (optimized with parallel queries)
export async function getMenu() {
  await connectToDB();
  
  // Fetch categories and all available items in parallel
  const [categories, allItems] = await Promise.all([
    Category.find().lean().exec(),
    MenuItem.find({ isAvailable: true }).lean().exec()
  ]);
  
  // Group items by category in memory (faster than multiple DB queries)
  const itemsByCategory = allItems.reduce((acc, item) => {
    const catId = item.category.toString();
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(item);
    return acc;
  }, {});
  
  // Build menu structure
  const menu = categories.map(cat => ({
    category: cat.name,
    image: cat.image,
    items: itemsByCategory[cat._id.toString()] || []
  }));
  
  return menu;
}

// 🍽️ Get items by category name (optimized with lean)
export async function getMenuByCategory(categoryName) {
  await connectToDB();
  
  const category = await Category.findOne({ name: categoryName }).lean().exec();
  if (!category) return [];
  
  return await MenuItem
    .find({ category: category._id, isAvailable: true })
    .lean()
    .exec();
}

// 🔍 Get single menu item (with select for specific fields)
export async function getMenuItem(id) {
  await connectToDB();
  return await MenuItem
    .findById(id)
    .populate('category', 'name image')
    .lean()
    .exec();
}

// 🛒 Create an order (streamlined)
export async function createOrder(orderData) {
  await connectToDB();
  
  const order = new Order(orderData);
  await order.save();
  
  return order.toObject(); // Return plain object
}
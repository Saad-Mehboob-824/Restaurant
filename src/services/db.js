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
  // Order type: pickup, delivery, or dinein
  type: {
    type: String,
    enum: ['pickup', 'delivery', 'dinein'],
    default: 'delivery',
    index: true
  },
  instructions: String,
  createdAt: { type: Date, default: Date.now, index: true }, // Index for sorting by date
});

// Note: legacy 'Order' model (plural 'orders' collection) is deprecated.
// We use `OrderNew` which writes to the singular 'order' collection to
// ensure the current schema (including `type`) is respected.

// New model that writes to explicit 'order' collection (singular) to avoid
// conflicts with the existing 'orders' collection compiled previously.
export const OrderNew =
  mongoose.models.OrderNew || mongoose.model('OrderNew', orderSchema, 'order');

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

// Admin: get all menu items including unavailable ones
export async function getAllMenuItemsAdmin() {
  await connectToDB();
  const items = await MenuItem
    .find({})
    .populate('category', 'name image')
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

// ➕ Create a menu item
export async function createMenuItem(data) {
  await connectToDB();

  const payload = {
    name: data.name,
    description: data.description || '',
    image: data.image || '',
    price: Number(data.price || 0),
    category: data.category,
    sides: Array.isArray(data.sides) ? data.sides : [],
    isAvailable: data.isAvailable === undefined ? true : Boolean(data.isAvailable),
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  };

  const item = new MenuItem(payload);
  await item.save();
  return await MenuItem.findById(item._id).populate('category', 'name image').lean().exec();
}

// ✏️ Update a menu item
export async function updateMenuItem(id, updates) {
  await connectToDB();
  const set = {};
  if (updates.name !== undefined) set.name = updates.name;
  if (updates.description !== undefined) set.description = updates.description;
  if (updates.image !== undefined) set.image = updates.image;
  if (updates.price !== undefined) set.price = Number(updates.price || 0);
  if (updates.category !== undefined) set.category = updates.category;
  if (updates.sides !== undefined) set.sides = Array.isArray(updates.sides) ? updates.sides : [];
  if (updates.isAvailable !== undefined) set.isAvailable = Boolean(updates.isAvailable);

  const item = await MenuItem.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
  if (!item) throw new Error('MenuItem not found');
  // populate category for consistency
  return await MenuItem.findById(item._id).populate('category', 'name image').lean().exec();
}

// ➕ Create a category
export async function createCategory(data) {
  await connectToDB();
  const payload = {
    name: data.name,
    description: data.description || '',
    headerImage: data.headerImage || '',
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  };
  const cat = new Category(payload);
  await cat.save();
  return cat.toObject();
}

// ✏️ Update a category
export async function updateCategory(id, updates) {
  await connectToDB();
  const set = {};
  if (updates.name !== undefined) set.name = updates.name;
  if (updates.image !== undefined) set.image = updates.image;
  if (updates.headerImage !== undefined) set.headerImage = updates.headerImage;
  if (updates.description !== undefined) set.description = updates.description;

  const cat = await Category.findByIdAndUpdate(id, { $set: set }, { new: true }).lean();
  if (!cat) throw new Error('Category not found');
  return cat;
}

// 🛒 Create an order (streamlined)
export async function createOrder(orderData) {
  await connectToDB();
  
  const order = new OrderNew(orderData);
  await order.save();

  // Ensure `type` persisted (handles cases where model was compiled without the field)
  if ((!order.type || order.type === undefined) && orderData.type) {
    order.type = orderData.type
    await order.save()
  }

  return order.toObject(); // Return plain object
}

// 📋 Get all orders with filtering options
export async function getAllOrders(filters = {}) {
  await connectToDB();
  
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
  if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
  
  return await OrderNew
    .find(query)
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

// 🔄 Update order status
export async function updateOrderStatus(orderId, newStatus) {
  await connectToDB();
  
  const validStatuses = ['pending', 'accepted', 'preparing', 'prepared', 'delivering', 'delivered', 'declined'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  const order = await OrderNew.findByIdAndUpdate(
    orderId,
    { 
      $set: { 
        status: newStatus,
        updatedAt: new Date()
      } 
    },
    { new: true }
  ).lean();
  
  if (!order) throw new Error('Order not found');
  return order;
}

// 🔍 Get order by ID
export async function getOrderById(orderId) {
  await connectToDB();
  
  const order = await OrderNew.findById(orderId).lean();
  if (!order) throw new Error('Order not found');
  return order;
}

// 📊 Get order statistics
export async function getOrderStats(timeframe = '24h') {
  await connectToDB();
  
  const query = {};
  if (timeframe === '24h') {
    query.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  } else if (timeframe === '7d') {
    query.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (timeframe === '30d') {
    query.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  
  const [orders, stats] = await Promise.all([
    OrderNew.find(query).lean(),
    OrderNew.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ])
  ]);
  
  return {
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, order) => sum + (order.total || 0), 0),
    byStatus: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
      return acc;
    }, {})
  };
}

// Delete a menu item (hard delete)
export async function deleteMenuItem(id) {
  await connectToDB();
  const res = await MenuItem.findByIdAndDelete(id).lean();
  if (!res) throw new Error('MenuItem not found');
  return res;
}

// Delete a category and remove associated menu items
export async function deleteCategory(id) {
  await connectToDB();
  const cat = await Category.findByIdAndDelete(id).lean();
  if (!cat) throw new Error('Category not found');
  // Remove menu items that referenced this category
  await MenuItem.deleteMany({ category: id });
  return cat;
}
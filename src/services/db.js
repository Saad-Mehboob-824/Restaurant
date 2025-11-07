import mongoose from 'mongoose'
import { Restaurant } from '../models/Restaurant'
import { Order } from '../models/Order'
import { Category } from '../models/Category'
import { MenuItem } from '../models/MenuItem'
import { User } from '../models/User'

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
      maxPoolSize: 10,
      minPoolSize: 2,
      
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

//
// 🧾 RESTAURANT CRUD Functions ───────────────────────────────────────────────
//

// Get restaurant by ID
export async function getRestaurant(restaurantId) {
  await connectToDB();
  const restaurant = await Restaurant.findById(restaurantId).lean();
  if (!restaurant) throw new Error('Restaurant not found');
  return restaurant;
}

// Create a new restaurant
export async function createRestaurant(data) {
  await connectToDB();
  const restaurant = await Restaurant.create(data);
  return restaurant.toObject();
}

// Update an existing restaurant
export async function updateRestaurant(restaurantId, data) {
  await connectToDB();
  
  console.log('updateRestaurant - Restaurant ID:', restaurantId)
  console.log('updateRestaurant - Update data keys:', Object.keys(data))
  
  // Filter out non-updatable fields
  const updateData = { ...data }
  delete updateData._id
  delete updateData.__v
  delete updateData.createdAt
  delete updateData.updatedAt
  
  // Ensure branches is an array
  if (updateData.branches !== undefined) {
    if (!Array.isArray(updateData.branches)) {
      updateData.branches = []
    }
    // Filter out any invalid branches
    updateData.branches = updateData.branches.filter(branch => {
      return branch && typeof branch === 'object' && branch.name && branch.address && branch.city
    })
    // Manually calculate totalBranches
    updateData.totalBranches = updateData.branches.length
    console.log('updateRestaurant - Branches count:', updateData.branches.length)
  }
  
  // Use findById, update, then save to ensure pre-save hooks run
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  console.log('updateRestaurant - Current restaurant:', {
    name: restaurant.name,
    branchesCount: restaurant.branches?.length || 0
  })
  
  // Update all fields
  Object.keys(updateData).forEach(key => {
    if (key !== '_id' && key !== '__v') {
      restaurant[key] = updateData[key]
    }
  })
  
  console.log('updateRestaurant - Updated restaurant before save:', {
    name: restaurant.name,
    branchesCount: restaurant.branches?.length || 0,
    totalBranches: restaurant.totalBranches
  })
  
  // Save to trigger pre-save hook
  await restaurant.save()
  
  const result = restaurant.toObject()
  console.log('updateRestaurant - Saved restaurant:', {
    _id: result._id,
    name: result.name,
    branchesCount: result.branches?.length || 0,
    totalBranches: result.totalBranches
  })
  
  return result;
}

//
// 📋 CATEGORY Functions ──────────────────────────────────────────────────────
//

// Get all categories for a restaurant
export async function getCategories(restaurantId) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  const categories = await Category.find({ restaurantId }).lean();
  
  // Format for backward compatibility
  return categories.map(cat => ({
    _id: cat._id,
    name: cat.name,
    description: cat.description,
    headerImage: cat.headerImage,
    image: cat.headerImage // Alias for backward compatibility
  }));
}

// Create a category in a restaurant
export async function createCategory(restaurantId, data) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Check if category already exists
  const existingCategory = await Category.findOne({ 
    restaurantId, 
    name: data.name 
  });
  if (existingCategory) throw new Error('Category already exists');
  
  // Create new category
  const category = await Category.create({
    restaurantId,
    name: data.name,
    description: data.description || '',
    headerImage: data.headerImage || ''
  });
  
  return {
    _id: category._id,
    name: category.name,
    description: category.description,
    headerImage: category.headerImage,
    image: category.headerImage
  };
}

// Update a category
export async function updateCategory(restaurantId, categoryIdOrName, updates) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Support both ObjectId and category name for backward compatibility
  let category;
  if (mongoose.Types.ObjectId.isValid(categoryIdOrName)) {
    category = await Category.findOne({ _id: categoryIdOrName, restaurantId });
  } else {
    category = await Category.findOne({ name: categoryIdOrName, restaurantId });
  }
  
  if (!category) throw new Error('Category not found');
  
  // Update fields
  if (updates.name !== undefined) category.name = updates.name;
  if (updates.description !== undefined) category.description = updates.description;
  if (updates.headerImage !== undefined) category.headerImage = updates.headerImage;
  
  await category.save();
  
  return {
    _id: category._id,
    name: category.name,
    description: category.description,
    headerImage: category.headerImage,
    image: category.headerImage
  };
}

// Delete a category (with cascade delete of menuItems)
export async function deleteCategory(restaurantId, categoryIdOrName) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Support both ObjectId and category name for backward compatibility
  let category;
  if (mongoose.Types.ObjectId.isValid(categoryIdOrName)) {
    category = await Category.findOne({ _id: categoryIdOrName, restaurantId });
  } else {
    category = await Category.findOne({ name: categoryIdOrName, restaurantId });
  }
  
  if (!category) throw new Error('Category not found');
  
  const categoryId = category._id;
  const categoryName = category.name;
  
  // Cascade delete: delete all menuItems in this category
  await MenuItem.deleteMany({ categoryId });
  
  // Delete the category
  await Category.deleteOne({ _id: categoryId });
  
  return {
    _id: categoryId,
    name: categoryName
  };
}

//
// 🍕 MENU ITEM Functions ────────────────────────────────────────────────────
//

// Get all menu items for a restaurant (with optional filters)
export async function getMenuItems(restaurantId, filters = {}) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Build query
  const query = { restaurantId };
  if (filters.isAvailable !== undefined) {
    query.isAvailable = filters.isAvailable;
  }
  
  // Get menu items with populated category
  const items = await MenuItem.find(query)
    .populate('categoryId', 'name headerImage')
    .lean();
  
  // Format for backward compatibility
  return items.map(item => ({
    _id: item._id,
    name: item.name,
    description: item.description || '',
    image: item.image || '',
    price: item.price || 0,
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    variants: item.variants || [],
    sides: item.sides || [],
    createdAt: item.createdAt || new Date(),
    category: item.categoryId ? {
      _id: item.categoryId._id,
      name: item.categoryId.name,
      image: item.categoryId.headerImage
    } : null,
    categoryName: item.categoryId ? item.categoryId.name : null,
    categoryId: item.categoryId ? item.categoryId._id : null
  }));
}

// Get all menu items (admin - includes unavailable)
export async function getAllMenuItemsAdmin(restaurantId) {
  return getMenuItems(restaurantId, {});
}

// Get all menu items (public - only available)
export async function getAllMenuItems(restaurantId) {
  return getMenuItems(restaurantId, { isAvailable: true });
}

// Get menu items by category name or ID
export async function getMenuByCategory(restaurantId, categoryIdOrName) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Find category by ID or name
  let category;
  if (mongoose.Types.ObjectId.isValid(categoryIdOrName)) {
    category = await Category.findOne({ _id: categoryIdOrName, restaurantId });
  } else {
    category = await Category.findOne({ name: categoryIdOrName, restaurantId });
  }
  
  if (!category) return [];
  
  // Get menu items for this category
  const items = await MenuItem.find({ 
    restaurantId, 
    categoryId: category._id 
  }).populate('categoryId', 'name headerImage').lean();
  
  return items.map(item => ({
    _id: item._id,
    name: item.name || '',
    description: item.description || '',
    image: item.image || '',
    price: item.price || 0,
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    variants: item.variants || [],
    sides: item.sides || [],
    createdAt: item.createdAt || new Date(),
    category: item.categoryId ? {
      _id: item.categoryId._id,
      name: item.categoryId.name,
      image: item.categoryId.headerImage
    } : null,
    categoryName: item.categoryId ? item.categoryId.name : null
  }));
}

// Get single menu item by ID
export async function getMenuItem(restaurantId, menuItemId) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  const item = await MenuItem.findOne({ 
    _id: menuItemId, 
    restaurantId 
  }).populate('categoryId', 'name headerImage').lean();
  
  if (!item) throw new Error('Menu item not found');
  
  return {
    ...item,
    category: item.categoryId ? {
      _id: item.categoryId._id,
      name: item.categoryId.name,
      image: item.categoryId.headerImage
    } : null,
    categoryName: item.categoryId ? item.categoryId.name : null
  };
}

// Create a menu item in a category
export async function createMenuItem(restaurantId, categoryIdOrName, data) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Find category by ID or name
  let category;
  if (mongoose.Types.ObjectId.isValid(categoryIdOrName)) {
    category = await Category.findOne({ _id: categoryIdOrName, restaurantId });
  } else {
    category = await Category.findOne({ name: categoryIdOrName, restaurantId });
  }
  
  if (!category) throw new Error('Category not found');
  
  // Create new menu item
  const menuItem = await MenuItem.create({
    restaurantId,
    categoryId: category._id,
    name: data.name,
    description: data.description || '',
    image: data.image || '',
    price: Number(data.price || 0),
    isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
    variants: Array.isArray(data.variants) ? data.variants : [],
    sides: Array.isArray(data.sides) ? data.sides : []
  });
  
  // Populate category for response
  await menuItem.populate('categoryId', 'name headerImage');
  
  return {
    ...menuItem.toObject(),
    category: {
      _id: category._id,
      name: category.name,
      image: category.headerImage
    },
    categoryName: category.name
  };
}

// Update a menu item
export async function updateMenuItem(restaurantId, menuItemId, updates) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Find menu item
  const menuItem = await MenuItem.findOne({ 
    _id: menuItemId, 
    restaurantId 
  });
  
  if (!menuItem) throw new Error('Menu item not found');
  
  // Update fields
  if (updates.name !== undefined) menuItem.name = updates.name;
  if (updates.description !== undefined) menuItem.description = updates.description;
  if (updates.image !== undefined) menuItem.image = updates.image;
  if (updates.price !== undefined) menuItem.price = Number(updates.price);
  if (updates.isAvailable !== undefined) menuItem.isAvailable = Boolean(updates.isAvailable);
  if (updates.variants !== undefined) menuItem.variants = Array.isArray(updates.variants) ? updates.variants : [];
  if (updates.sides !== undefined) menuItem.sides = Array.isArray(updates.sides) ? updates.sides : [];
  
  // Handle category change if needed
  if (updates.categoryId || updates.categoryName) {
    let newCategory;
    if (updates.categoryId) {
      newCategory = await Category.findOne({ _id: updates.categoryId, restaurantId });
    } else if (updates.categoryName) {
      newCategory = await Category.findOne({ name: updates.categoryName, restaurantId });
    }
    
    if (!newCategory) throw new Error('New category not found');
    menuItem.categoryId = newCategory._id;
  }
  
  await menuItem.save();
  
  // Populate category for response
  await menuItem.populate('categoryId', 'name headerImage');
  const category = menuItem.categoryId;
  
  return {
    ...menuItem.toObject(),
    category: {
      _id: category._id,
      name: category.name,
      image: category.headerImage
    },
    categoryName: category.name
  };
}

// Delete a menu item
export async function deleteMenuItem(restaurantId, menuItemId) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  const menuItem = await MenuItem.findOne({ 
    _id: menuItemId, 
    restaurantId 
  });
  
  if (!menuItem) throw new Error('Menu item not found');
  
  const itemObj = menuItem.toObject();
  await MenuItem.deleteOne({ _id: menuItemId });
  
  return itemObj;
}

// Get menu structure (categories with their items)
export async function getMenu(restaurantId) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Get all categories
  const categories = await Category.find({ restaurantId }).lean();
  
  // Get all available menu items grouped by category
  const menuItems = await MenuItem.find({ 
    restaurantId, 
    isAvailable: true 
  }).lean();
  
  // Group items by category
  const itemsByCategory = {};
  for (const item of menuItems) {
    if (!itemsByCategory[item.categoryId.toString()]) {
      itemsByCategory[item.categoryId.toString()] = [];
    }
    itemsByCategory[item.categoryId.toString()].push(item);
  }
  
  // Format for backward compatibility
  return categories.map(cat => ({
    category: cat.name,
    image: cat.headerImage,
    items: itemsByCategory[cat._id.toString()] || []
  }));
}

//
// 🛒 ORDER Functions ────────────────────────────────────────────────────────
//

// Create an order
export async function createOrder(restaurantId, orderData) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Create order in Order collection
  const orderType = orderData.type || orderData.orderType || 'delivery'
  const branchValue = orderType === 'pickup' ? (orderData.branch || '') : ''
  
  // Build customer object from orderData
  const customer = {
    name: orderData.name || orderData.customerName || orderData.customer?.name || '',
    phone: orderData.phone || orderData.customer?.phone || '',
    email: orderData.email || orderData.customer?.email || '',
    address: orderData.address || orderData.customer?.address || ''
  };
  
  // Build order items with denormalized name and updated selectedSides format
  // Fetch menu item names from MenuItem collection to ensure they're stored
  const menuItemIds = (orderData.items || [])
    .map(item => {
      const id = item.menuItemId || item._id;
      return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
    })
    .filter(id => id !== null);

  // Fetch menu items to get names
  const menuItemsMap = {};
  if (menuItemIds.length > 0) {
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      restaurantId
    }).select('_id name').lean();
    
    for (const menuItem of menuItems) {
      menuItemsMap[menuItem._id.toString()] = menuItem.name;
    }
  }

  const items = (orderData.items || []).map(item => {
    // Get menuItemId
    const menuItemId = mongoose.Types.ObjectId.isValid(item.menuItemId || item._id) 
      ? new mongoose.Types.ObjectId(item.menuItemId || item._id) 
      : (item.menuItemId || item._id);
    
    // Get menu item name from map or fallback to provided name
    const menuItemName = menuItemsMap[menuItemId.toString()] || item.name || 'Unknown Item';
    
    // Transform selectedSides to new format {name, extraPrice, img}
    const selectedSides = Array.isArray(item.selectedSides) ? item.selectedSides.map(side => ({
      name: side.name || side.sideName || '',
      extraPrice: side.extraPrice || 0,
      img: side.img || side.image || ''
    })) : [];
    
    return {
      menuItemId,
      name: menuItemName, // Ensure name is always populated
      variant: item.variant || '',
      price: Number(item.price || 0),
      quantity: item.quantity || 1,
      selectedSides
    };
  });
  
  // Create order using Mongoose model
  const order = await Order.create({
    restaurantId,
    userId: orderData.userId && mongoose.Types.ObjectId.isValid(orderData.userId) 
      ? new mongoose.Types.ObjectId(orderData.userId) 
      : null,
    customer,
    items,
    total: Number(orderData.total || orderData.totalAmount || 0),
    status: orderData.status || 'pending',
    type: orderType,
    branch: branchValue,
    instructions: orderData.instructions || ''
  });
  
  return order.toObject();
}

// Get all orders with filters
export async function getOrders(restaurantId, filters = {}) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Build MongoDB query
  const query = { restaurantId };
  
  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }
  
  // Query with sorting
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .lean();
  
  // Populate missing menu item names for backward compatibility
  const menuItemIdsToFetch = [];
  for (const order of orders) {
    for (const item of order.items || []) {
      if (item.menuItemId && (!item.name || item.name === '')) {
        menuItemIdsToFetch.push(item.menuItemId);
      }
    }
  }
  
  if (menuItemIdsToFetch.length > 0) {
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIdsToFetch },
      restaurantId
    }).select('_id name').lean();
    
    const menuItemsMap = {};
    for (const menuItem of menuItems) {
      menuItemsMap[menuItem._id.toString()] = menuItem.name;
    }
    
    // Update orders with menu item names
    for (const order of orders) {
      for (const item of order.items || []) {
        if (item.menuItemId && (!item.name || item.name === '')) {
          const menuItemIdStr = item.menuItemId.toString();
          if (menuItemsMap[menuItemIdStr]) {
            item.name = menuItemsMap[menuItemIdStr];
          } else {
            item.name = 'Unknown Item'; // Fallback if menu item not found
          }
        }
      }
    }
  }
  
  return orders;
}

// Alias for backward compatibility
export async function getAllOrders(restaurantId, filters = {}) {
  return getOrders(restaurantId, filters);
}

// Get order by ID
export async function getOrderById(restaurantId, orderId) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Find order in Order collection
  const order = await Order.findOne({ _id: orderId, restaurantId }).lean();
  if (!order) throw new Error('Order not found');
  
  return order;
}

// Update order status
export async function updateOrderStatus(restaurantId, orderId, newStatus) {
  await connectToDB();
  
  const validStatuses = ['pending', 'accepted', 'preparing', 'prepared', 'delivering', 'delivered', 'declined'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Update order in Order collection
  const order = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId },
    { status: newStatus },
    { new: true }
  ).lean();
  
  if (!order) throw new Error('Order not found');
  
  return order;
}

// Get order statistics
export async function getOrderStats(restaurantId, timeframe = '24h') {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Calculate start date based on timeframe
  const now = Date.now();
  let startDate = null;
  
  if (timeframe === '24h') {
    startDate = new Date(now - 24 * 60 * 60 * 1000);
  } else if (timeframe === '7d') {
    startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
  } else if (timeframe === '30d') {
    startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
  
  // Build query
  const query = { restaurantId };
  if (startDate) {
    query.createdAt = { $gte: startDate };
  }
  
  // Use aggregation pipeline for efficient stats calculation
  const stats = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);
  
  // Calculate totals
  const byStatus = {};
  let totalOrders = 0;
  let totalAmount = 0;
  
  for (const stat of stats) {
    byStatus[stat._id] = {
      count: stat.count,
      amount: stat.totalAmount
    };
    totalOrders += stat.count;
    totalAmount += stat.totalAmount;
  }
  
  return {
    totalOrders,
    totalAmount,
    byStatus
  };
}

//
// 👤 USER Functions ─────────────────────────────────────────────────────────
//

// Get all users for a restaurant (optionally filtered by branch)
export async function getUsers(restaurantId, branch = null) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Build query
  const query = { restaurantId };
  if (branch !== null) {
    query.branch = branch || ''; // Empty string for Global users
  }
  
  // Get users for this restaurant, optionally filtered by branch
  const users = await User.find(query).lean();
  
  return users;
}

// Create a user in a restaurant (with optional branch)
export async function createUser(restaurantId, userData) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Check if user already exists (unique email per restaurantId and branch)
  const existingUser = await User.findOne({ 
    email: userData.email,
    restaurantId,
    branch: userData.branch || '' // Empty string for Global users
  });
  
  if (existingUser) throw new Error('User already exists');
  
  // Create new user
  const user = await User.create({
    restaurantId,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    passwordHash: userData.passwordHash,
    role: userData.role,
    branch: userData.branch || '' // Empty string for Global users
  });
  
  return user.toObject();
}

// Find user by email (supports both branch-specific and Global users)
export async function findUserByEmail(restaurantId, email, branch = null) {
  await connectToDB();
  
  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant not found');
  
  // Try to find user for this restaurant and branch (if specified)
  let user = null;
  
  if (branch !== null) {
    // Try specific branch first
    user = await User.findOne({ 
      email, 
      restaurantId,
      branch: branch || '' // Empty string for Global users
    }).lean();
  }
  
  // If not found, try Global users (branch = '')
  if (!user) {
    user = await User.findOne({ 
      email,
      restaurantId,
      branch: '' // Global users have empty string branch
    }).lean();
  }
  
  // If still not found and no branch specified, try any branch for this restaurant
  if (!user && branch === null) {
    user = await User.findOne({ 
      email,
      restaurantId
    }).lean();
  }
  
  return user;
}

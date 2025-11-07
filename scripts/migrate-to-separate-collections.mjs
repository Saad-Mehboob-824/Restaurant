#!/usr/bin/env node

/**
 * Migration script to refactor nested MongoDB schema into separate collections
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all restaurants
 * 3. Extracts categories from restaurant.menu.categories → Creates Category documents
 * 4. Extracts menuItems from categories → Creates MenuItem documents with categoryId references
 * 5. Extracts users from restaurant.users → Creates User documents with restaurantId and branch field
 * 6. Updates Orders: migrates name/phone/email/address to customer object
 * 7. Updates existing users to include branch field (if missing)
 * 8. Backs up old data (renames collections)
 * 9. Verifies data integrity
 * 
 * Usage: node scripts/migrate-to-separate-collections.mjs
 * 
 * WARNING: This script modifies your database. Make sure to backup first!
 */

import mongoose from 'mongoose'
import { Restaurant } from '../src/models/Restaurant.js'
import { Category } from '../src/models/Category.js'
import { MenuItem } from '../src/models/MenuItem.js'
import { User } from '../src/models/User.js'
import { Order } from '../src/models/Order.js'

// Load environment variables
//const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI
const MONGODB_URI = 'mongodb+srv://i222577:eBKIMX3E7rm7OuGL@cluster0.qeuzo.mongodb.net/restaurants'

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI or MONGODB_URI is required in environment variables')
  console.error('   Please set MONGO_URI in your .env.local file')
  process.exit(1)
}

// Validate MongoDB URI format
if (!MONGODB_URI.includes('mongodb+srv://') && !MONGODB_URI.includes('mongodb://')) {
  console.error('❌ Invalid MongoDB URI format. Must start with mongodb+srv:// or mongodb://')
  process.exit(1)
}

async function migrateToSeparateCollections() {
  try {
    console.log('🔄 Starting schema migration...')
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`)
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: 'restaurant',
      bufferCommands: false
    })
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db

    // Backup existing collections
    console.log('\n📦 Backing up existing collections...')
    const collections = ['categories', 'menuitems', 'users']
    for (const collectionName of collections) {
      try {
        const existing = await db.collection(collectionName).countDocuments()
        if (existing > 0) {
          const backupName = `${collectionName}_backup_${Date.now()}`
          await db.collection(collectionName).aggregate([
            { $match: {} },
            { $out: backupName }
          ]).toArray()
          console.log(`   ✅ Backed up ${collectionName} → ${backupName} (${existing} documents)`)
        }
      } catch (e) {
        console.log(`   ⚠️  Collection ${collectionName} doesn't exist or error: ${e.message}`)
      }
    }

    // Find all restaurants with nested data
    console.log('\n📋 Finding restaurants with nested data...')
    const restaurants = await Restaurant.find({}).lean()
    console.log(`   Found ${restaurants.length} restaurant(s)`)

    let totalCategories = 0
    let totalMenuItems = 0
    let totalUsers = 0

    // Process each restaurant
    for (const restaurant of restaurants) {
      const restaurantId = restaurant._id
      console.log(`\n🏢 Processing restaurant: ${restaurant.name} (${restaurantId})`)

      // 1. Migrate Categories
      if (restaurant.menu && restaurant.menu.categories) {
        console.log(`   📂 Migrating ${restaurant.menu.categories.length} categories...`)
        
        for (const cat of restaurant.menu.categories) {
          // Check if category already exists
          const existing = await Category.findOne({ 
            restaurantId, 
            name: cat.name 
          })
          
          if (existing) {
            console.log(`      ⚠️  Category "${cat.name}" already exists, skipping`)
            continue
          }

          const category = await Category.create({
            restaurantId,
            name: cat.name,
            description: cat.description || '',
            headerImage: cat.headerImage || '',
            createdAt: new Date()
          })

          // 2. Migrate MenuItems for this category
          if (cat.menuItems && cat.menuItems.length > 0) {
            console.log(`      🍕 Migrating ${cat.menuItems.length} menu items...`)
            
            for (const item of cat.menuItems) {
              const menuItem = await MenuItem.create({
                restaurantId,
                categoryId: category._id,
                name: item.name,
                description: item.description || '',
                image: item.image || '',
                price: item.price || 0,
                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                variants: item.variants || [],
                sides: item.sides || [],
                createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
              })
              totalMenuItems++
            }
          }

          totalCategories++
        }
      }

      // 3. Migrate Users
      if (restaurant.users && restaurant.users.length > 0) {
        console.log(`   👤 Migrating ${restaurant.users.length} users...`)
        
        for (const user of restaurant.users) {
          // Check if user already exists (with branch check)
          const existing = await User.findOne({ 
            email: user.email,
            restaurantId,
            branch: user.branch || '' // Empty string for Global users
          })
          
          if (existing) {
            console.log(`      ⚠️  User "${user.email}" already exists, skipping`)
            continue
          }

          await User.create({
            restaurantId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            branch: user.branch || '', // Empty string for Global users, branch name for specific branch
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
          })
          totalUsers++
        }
      }
    }

    // 4. Migrate Orders: Update customer structure
    console.log('\n🛒 Updating orders with customer object...')
    const orders = await Order.find({}).lean()
    console.log(`   Found ${orders.length} order(s)`)

    let updatedOrders = 0
    for (const order of orders) {
      // Skip if already has customer object
      if (order.customer && typeof order.customer === 'object') {
        continue
      }

      // Build customer object from separate fields
      const customer = {
        name: order.name || '',
        phone: order.phone || '',
        email: order.email || '',
        address: order.address || ''
      }

      // Update order with customer object
      await Order.updateOne(
        { _id: order._id },
        {
          $set: { customer },
          $unset: { name: '', phone: '', email: '', address: '' }
        }
      )

      updatedOrders++
    }
    console.log(`   ✅ Updated ${updatedOrders} order(s)`)

    // 5. Update existing users without branch field (if any exist from previous migrations)
    console.log('\n👤 Updating existing users to include branch field...')
    const usersWithoutBranch = await User.updateMany(
      { branch: { $exists: false } },
      { $set: { branch: '' } } // Set empty string for Global users if branch is missing
    )
    if (usersWithoutBranch.modifiedCount > 0) {
      console.log(`   ✅ Updated ${usersWithoutBranch.modifiedCount} user(s) to include branch field`)
    }

    // 6. Verify data integrity
    console.log('\n✅ Verifying data integrity...')
    const categoryCount = await Category.countDocuments()
    const menuItemCount = await MenuItem.countDocuments()
    const userCount = await User.countDocuments() // restaurantId is now required, so no need to filter
    const orderCount = await Order.countDocuments()

    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Categories: ${totalCategories} migrated (total: ${categoryCount})`)
    console.log(`   ✅ MenuItems: ${totalMenuItems} migrated (total: ${menuItemCount})`)
    console.log(`   ✅ Users: ${totalUsers} migrated (total: ${userCount})`)
    console.log(`   ✅ Orders: ${updatedOrders} updated (total: ${orderCount})`)

    // Verify referential integrity
    console.log('\n🔍 Verifying referential integrity...')
    const menuItemsWithoutCategory = await MenuItem.countDocuments({ categoryId: { $exists: false } })
    const menuItemsWithInvalidCategory = await MenuItem.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $match: {
          category: { $size: 0 }
        }
      },
      {
        $count: 'count'
      }
    ])

    if (menuItemsWithoutCategory > 0) {
      console.log(`   ⚠️  Warning: ${menuItemsWithoutCategory} menu items without categoryId`)
    }

    const invalidCount = menuItemsWithInvalidCategory[0]?.count || 0
    if (invalidCount > 0) {
      console.log(`   ⚠️  Warning: ${invalidCount} menu items with invalid categoryId references`)
    }

    if (menuItemsWithoutCategory === 0 && invalidCount === 0) {
      console.log('   ✅ All menu items have valid category references')
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Test your application with the new schema')
    console.log('   2. Verify all API endpoints work correctly')
    console.log('   3. Once verified, you can optionally clean up old nested data from Restaurant documents')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

// Run migration
migrateToSeparateCollections()
  .then(() => {
    console.log('\n✨ Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error)
    process.exit(1)
  })


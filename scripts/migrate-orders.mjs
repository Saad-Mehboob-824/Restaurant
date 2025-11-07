#!/usr/bin/env node

/**
 * Migration script to move orders from Restaurant.orders[] array to Order collection
 * Usage: node scripts/migrate-orders.mjs
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all restaurants
 * 3. Migrates orders from restaurant.orders[] to Order collection
 * 4. Preserves all order data and timestamps
 * 5. Logs progress and statistics
 */

import mongoose from 'mongoose'
import { Restaurant } from '../src/models/Restaurant.js'
import { Order } from '../src/models/Order.js'

// Load environment variables from process.env
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

async function migrateOrders() {
  try {
    console.log('🔄 Starting orders migration...')
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`)
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: 'restaurant',
      bufferCommands: false
    })
    console.log('✅ Connected to MongoDB')

    // Find all restaurants
    const restaurants = await Restaurant.find({}).lean()
    console.log(`📦 Found ${restaurants.length} restaurant(s)`)

    let totalOrdersBefore = 0
    let totalOrdersMigrated = 0
    let totalOrdersSkipped = 0
    let totalRestaurantsProcessed = 0

    // Process each restaurant
    for (const restaurant of restaurants) {
      const restaurantId = restaurant._id
      const restaurantName = restaurant.name || 'Unnamed Restaurant'
      
      const orders = restaurant.orders || []
      totalOrdersBefore += orders.length

      console.log(`\n🏪 Processing restaurant: ${restaurantName} (${restaurantId})`)
      console.log(`   Found ${orders.length} order(s) in nested array`)

      if (orders.length === 0) {
        console.log(`   ⏭️  Skipping - no orders to migrate`)
        continue
      }

      // Check if orders already migrated (avoid duplicates)
      const existingOrdersCount = await Order.countDocuments({ restaurantId })
      if (existingOrdersCount > 0) {
        console.log(`   ⚠️  Warning: ${existingOrdersCount} order(s) already exist in Order collection`)
        console.log(`   ⏭️  Skipping to avoid duplicates (manually remove if re-migration needed)`)
        totalOrdersSkipped += orders.length
        continue
      }

      let migratedCount = 0
      let errorCount = 0

      // Migrate each order
      for (const order of orders) {
        try {
          // Create new Order document with restaurantId
          const newOrder = {
            restaurantId: restaurantId,
            userId: order.userId || null,
            name: order.name || '',
            phone: order.phone || '',
            email: order.email || '',
            address: order.address || '',
            items: (order.items || []).map(item => ({
              menuItemId: item.menuItemId || item._id || null,
              quantity: item.quantity || 1,
              variant: item.variant || '',
              price: Number(item.price || 0),
              selectedSides: Array.isArray(item.selectedSides) ? item.selectedSides : []
            })),
            total: Number(order.total || 0),
            status: order.status || 'pending',
            type: order.type || 'delivery',
            instructions: order.instructions || '',
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date()
          }

          // Only create if valid
          if (newOrder.items.length === 0) {
            console.log(`   ⚠️  Skipping order with no items`)
            errorCount++
            continue
          }

          await Order.create(newOrder)
          migratedCount++
        } catch (error) {
          console.error(`   ❌ Error migrating order: ${error.message}`)
          errorCount++
        }
      }

      console.log(`   ✅ Migrated: ${migratedCount} order(s)`)
      if (errorCount > 0) {
        console.log(`   ⚠️  Errors: ${errorCount} order(s)`)
      }

      totalOrdersMigrated += migratedCount
      totalRestaurantsProcessed++
    }

    // Verify migration
    const totalOrdersInNewCollection = await Order.countDocuments()
    
    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log('='.repeat(50))
    console.log(`Restaurants processed: ${totalRestaurantsProcessed}`)
    console.log(`Total orders in Restaurant.orders[]: ${totalOrdersBefore}`)
    console.log(`Orders migrated to Order collection: ${totalOrdersMigrated}`)
    console.log(`Orders skipped (already exist): ${totalOrdersSkipped}`)
    console.log(`Total orders in Order collection now: ${totalOrdersInNewCollection}`)
    console.log('='.repeat(50))

    if (totalOrdersMigrated === totalOrdersBefore - totalOrdersSkipped) {
      console.log('✅ Migration completed successfully!')
      console.log('\n💡 Next steps:')
      console.log('   1. Test order creation via API')
      console.log('   2. Test order queries and updates')
      console.log('   3. Verify dashboard displays correctly')
      console.log('   4. Once verified, you can remove orders[] from Restaurant schema')
    } else {
      console.log('⚠️  Migration completed with some discrepancies')
      console.log(`   Expected: ${totalOrdersBefore - totalOrdersSkipped}, Got: ${totalOrdersMigrated}`)
    }

    // Close connection
    await mongoose.connection.close()
    console.log('\n✅ Database connection closed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

// Run migration
migrateOrders()

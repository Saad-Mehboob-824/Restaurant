#!/usr/bin/env node

/**
 * Migration script to populate menu item names in existing orders
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all orders
 * 3. For each order, extracts menuItemIds from order items
 * 4. Fetches menu item names from MenuItem collection
 * 5. Updates order items with the correct names
 * 
 * Usage: node scripts/update-order-item-names.mjs
 * 
 * WARNING: This script modifies your database. Make sure to backup first!
 */

import mongoose from 'mongoose'
import { Order } from '../src/models/Order.js'
import { MenuItem } from '../src/models/MenuItem.js'
import { Restaurant } from '../src/models/Restaurant.js'

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

async function updateOrderItemNames() {
  try {
    console.log('🔄 Starting order item names update...')
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`)
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: 'restaurant',
      bufferCommands: false
    })
    console.log('✅ Connected to MongoDB')

    // Get all orders
    console.log('\n📋 Finding all orders...')
    const orders = await Order.find({}).lean()
    console.log(`   Found ${orders.length} order(s)`)

    let totalOrdersUpdated = 0
    let totalItemsUpdated = 0
    let totalItemsAlreadyNamed = 0
    let totalItemsNotFound = 0

    // Process orders by restaurantId to batch fetch menu items efficiently
    const ordersByRestaurant = {}
    for (const order of orders) {
      const restaurantId = order.restaurantId?.toString()
      if (!restaurantId) continue
      
      if (!ordersByRestaurant[restaurantId]) {
        ordersByRestaurant[restaurantId] = []
      }
      ordersByRestaurant[restaurantId].push(order)
    }

    console.log(`\n🏢 Processing ${Object.keys(ordersByRestaurant).length} restaurant(s)...`)

    // Process each restaurant's orders
    for (const [restaurantId, restaurantOrders] of Object.entries(ordersByRestaurant)) {
      console.log(`\n🏢 Processing restaurant: ${restaurantId}`)
      
      // Verify restaurant exists
      const restaurant = await Restaurant.findById(restaurantId)
      if (!restaurant) {
        console.log(`   ⚠️  Restaurant ${restaurantId} not found, skipping orders`)
        continue
      }

      // Collect all unique menuItemIds from all orders for this restaurant
      const menuItemIds = new Set()
      const orderItemsMap = new Map() // Map to track which orders need which menu items

      for (const order of restaurantOrders) {
        const orderId = order._id.toString()
        let needsUpdate = false

        for (const item of order.items || []) {
          if (!item.menuItemId) continue

          const menuItemIdStr = item.menuItemId.toString()
          
          // Check if item needs name update
          if (!item.name || item.name === '' || item.name === 'Unknown Item') {
            menuItemIds.add(menuItemIdStr)
            needsUpdate = true
            
            if (!orderItemsMap.has(orderId)) {
              orderItemsMap.set(orderId, [])
            }
            orderItemsMap.get(orderId).push({
              menuItemId: item.menuItemId,
              menuItemIdStr
            })
          } else {
            totalItemsAlreadyNamed++
          }
        }

        if (!needsUpdate) {
          // Order doesn't need updates
          continue
        }
      }

      if (menuItemIds.size === 0) {
        console.log(`   ✅ All items already have names, skipping`)
        continue
      }

      console.log(`   📦 Found ${menuItemIds.size} unique menu items to lookup`)
      console.log(`   📝 Found ${orderItemsMap.size} orders needing updates`)

      // Fetch all menu items for this restaurant in one query
      const menuItemIdArray = Array.from(menuItemIds).map(id => new mongoose.Types.ObjectId(id))
      const menuItems = await MenuItem.find({
        _id: { $in: menuItemIdArray },
        restaurantId: new mongoose.Types.ObjectId(restaurantId)
      }).select('_id name').lean()

      // Create a map of menuItemId -> name
      const menuItemsMap = {}
      const foundMenuItemIds = new Set()
      
      for (const menuItem of menuItems) {
        const idStr = menuItem._id.toString()
        menuItemsMap[idStr] = menuItem.name
        foundMenuItemIds.add(idStr)
      }

      // Check for menu items not found
      const notFoundIds = Array.from(menuItemIds).filter(id => !foundMenuItemIds.has(id))
      if (notFoundIds.length > 0) {
        console.log(`   ⚠️  Warning: ${notFoundIds.length} menu items not found in MenuItem collection`)
        totalItemsNotFound += notFoundIds.length
      }

      // Update each order
      for (const [orderId, itemsToUpdate] of orderItemsMap.entries()) {
        const order = restaurantOrders.find(o => o._id.toString() === orderId)
        if (!order) continue

        let needsUpdate = false
        const updateFields = {}
        let itemsUpdatedCount = 0

        // Build update operations for each item
        for (let itemIndex = 0; itemIndex < (order.items || []).length; itemIndex++) {
          const item = order.items[itemIndex]
          if (!item.menuItemId) continue

          const menuItemIdStr = item.menuItemId.toString()
          const menuItemName = menuItemsMap[menuItemIdStr]

          // Only update if name is missing or invalid
          if (!item.name || item.name === '' || item.name === 'Unknown Item') {
            if (menuItemName) {
              updateFields[`items.${itemIndex}.name`] = menuItemName
              itemsUpdatedCount++
              needsUpdate = true
            } else {
              // Menu item not found, set to 'Unknown Item' (only if it's actually missing)
              if (!item.name || item.name === '') {
                updateFields[`items.${itemIndex}.name`] = 'Unknown Item'
                needsUpdate = true
              }
            }
          }
        }

        // Apply update if needed
        if (needsUpdate && Object.keys(updateFields).length > 0) {
          await Order.updateOne(
            { _id: order._id },
            { $set: updateFields }
          )
          totalItemsUpdated += itemsUpdatedCount
          totalOrdersUpdated++
        }
      }

      console.log(`   ✅ Updated ${orderItemsMap.size} order(s) with ${menuItemIds.size} menu item names`)
    }

    // Summary
    console.log(`\n📊 Update Summary:`)
    console.log(`   ✅ Orders updated: ${totalOrdersUpdated}`)
    console.log(`   ✅ Items updated: ${totalItemsUpdated}`)
    console.log(`   ✅ Items already had names: ${totalItemsAlreadyNamed}`)
    if (totalItemsNotFound > 0) {
      console.log(`   ⚠️  Items not found: ${totalItemsNotFound}`)
    }

    console.log('\n✅ Update completed successfully!')

  } catch (error) {
    console.error('\n❌ Update failed:', error)
    throw error
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

// Run update
updateOrderItemNames()
  .then(() => {
    console.log('\n✨ Update script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Update script failed:', error)
    process.exit(1)
  })


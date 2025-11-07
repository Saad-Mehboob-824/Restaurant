#!/usr/bin/env node

/**
 * Migration script to convert Restaurant.locations Map to Restaurant.branches array
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all restaurants with locations Map
 * 3. Converts locations Map to branches array
 * 4. Migrates location data to branch schema format
 * 5. Backs up old data
 * 6. Verifies data integrity
 * 
 * Usage: node scripts/migrate-locations-to-branches.mjs
 * 
 * WARNING: This script modifies your database. Make sure to backup first!
 */

import mongoose from 'mongoose'
import { Restaurant } from '../src/models/Restaurant.js'

// Load environment variables
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://i222577:eBKIMX3E7rm7OuGL@cluster0.qeuzo.mongodb.net/restaurants'

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

async function migrateLocationsToBranches() {
  try {
    console.log('🔄 Starting locations to branches migration...')
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`)
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: 'restaurant',
      bufferCommands: false
    })
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db

    // Backup existing restaurants collection
    console.log('\n📦 Backing up restaurants collection...')
    try {
      const restaurantCount = await db.collection('restaurants').countDocuments()
      if (restaurantCount > 0) {
        const backupName = `restaurants_backup_locations_${Date.now()}`
        await db.collection('restaurants').aggregate([
          { $match: {} },
          { $out: backupName }
        ]).toArray()
        console.log(`   ✅ Backed up restaurants → ${backupName} (${restaurantCount} documents)`)
      }
    } catch (e) {
      console.log(`   ⚠️  Error backing up restaurants: ${e.message}`)
    }

    // Find all restaurants with locations Map
    console.log('\n📋 Finding restaurants with locations Map...')
    const restaurants = await Restaurant.find({}).lean()
    console.log(`   Found ${restaurants.length} restaurant(s)`)

    let migratedCount = 0
    let skippedCount = 0

    // Process each restaurant
    for (const restaurant of restaurants) {
      const restaurantId = restaurant._id
      console.log(`\n🏢 Processing restaurant: ${restaurant.name || 'Unnamed'} (${restaurantId})`)

      // Check if locations Map exists and has data
      const locations = restaurant.locations
      
      if (!locations || (locations instanceof Map && locations.size === 0) || (typeof locations === 'object' && Object.keys(locations).length === 0)) {
        console.log(`   ⏭️  No locations to migrate. Skipping...`)
        skippedCount++
        continue
      }

      // Convert locations Map to branches array
      const branches = []
      
      // Handle both Map and plain object formats
      if (locations instanceof Map) {
        locations.forEach((location, key) => {
          const branch = {
            name: key || location.name || 'Unnamed Branch',
            address: location.address || '',
            phone: location.phone || '',
            city: location.city || '',
            coordinates: {
              lat: Array.isArray(location.coordinates) ? location.coordinates[0] : (location.coordinates?.lat || null),
              lng: Array.isArray(location.coordinates) ? location.coordinates[1] : (location.coordinates?.lng || null)
            },
            status: 'Open', // Default status
            createdAt: new Date()
          }
          branches.push(branch)
        })
      } else if (typeof locations === 'object' && locations !== null) {
        Object.entries(locations).forEach(([key, location]) => {
          const branch = {
            name: key || location?.name || 'Unnamed Branch',
            address: location?.address || '',
            phone: location?.phone || '',
            city: location?.city || '',
            coordinates: {
              lat: Array.isArray(location?.coordinates) ? location.coordinates[0] : (location?.coordinates?.lat || null),
              lng: Array.isArray(location?.coordinates) ? location.coordinates[1] : (location?.coordinates?.lng || null)
            },
            status: 'Open', // Default status
            createdAt: new Date()
          }
          branches.push(branch)
        })
      }

      if (branches.length === 0) {
        console.log(`   ⏭️  No valid branches created. Skipping...`)
        skippedCount++
        continue
      }

      console.log(`   📍 Converting ${branches.length} location(s) to branches...`)
      
      // Update restaurant with branches array and new schema fields
      await Restaurant.findByIdAndUpdate(restaurantId, {
        $set: {
          branches: branches,
          totalBranches: branches.length,
          // Keep existing fields, add defaults for new fields if missing
          description: restaurant.description || '',
          cuisine: restaurant.cuisine || '',
          owner: restaurant.owner || '',
          contactEmail: restaurant.contactEmail || '',
          contactPhone: restaurant.contactPhone || '',
          isLive: restaurant.isLive !== undefined ? restaurant.isLive : false
        },
        // Remove locations field
        $unset: {
          locations: ''
        }
      })

      console.log(`   ✅ Migrated ${branches.length} location(s) to branches`)
      migratedCount++
    }

    console.log('\n✅ Migration completed!')
    console.log(`   📊 Summary:`)
    console.log(`      - Migrated: ${migratedCount} restaurant(s)`)
    console.log(`      - Skipped: ${skippedCount} restaurant(s)`)

    // Verify migration
    console.log('\n🔍 Verifying migration...')
    const verifyRestaurants = await Restaurant.find({}).lean()
    let totalBranches = 0
    for (const rest of verifyRestaurants) {
      if (Array.isArray(rest.branches)) {
        totalBranches += rest.branches.length
      }
    }
    console.log(`   ✅ Total branches across all restaurants: ${totalBranches}`)
    
    // Check for any restaurants still with locations field
    const withLocations = await Restaurant.find({ locations: { $exists: true } }).countDocuments()
    if (withLocations > 0) {
      console.log(`   ⚠️  Warning: ${withLocations} restaurant(s) still have locations field`)
    } else {
      console.log(`   ✅ All restaurants migrated (no locations field found)`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// Run migration
migrateLocationsToBranches()
  .then(() => {
    console.log('\n✅ Migration script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  })


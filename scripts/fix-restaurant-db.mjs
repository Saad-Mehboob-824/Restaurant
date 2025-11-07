#!/usr/bin/env node

/**
 * Script to fix/reset Restaurant collection
 * 
 * This script will:
 * 1. Connect to MongoDB
 * 2. Fix existing restaurant document structure to match new schema
 * 3. Or create a fresh restaurant document if needed
 * 4. Verify the structure is correct
 * 
 * Usage: node scripts/fix-restaurant-db.mjs
 * 
 * WARNING: This script modifies your database. Make sure to backup first!
 */

import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local')
if (existsSync(envPath)) {
  try {
    const envFile = readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        if (key && value) {
          process.env[key.trim()] = value
        }
      }
    })
    console.log('✅ Loaded environment variables from .env.local')
  } catch (e) {
    console.log('⚠️  Could not load .env.local file, using process.env')
  }
} else {
  console.log('⚠️  No .env.local file found, using process.env')
}

const MONGODB_URI = 'mongodb+srv://i222577:eBKIMX3E7rm7OuGL@cluster0.qeuzo.mongodb.net/restaurants'

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI or MONGODB_URI is required in environment variables')
  console.error('   Please set MONGO_URI in your .env.local file')
  process.exit(1)
}

// Branch Schema
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
    description: { type: String },
    cuisine: { type: String },
    owner: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    isLive: { type: Boolean, default: false },
    totalBranches: { type: Number, default: 0 },
    branches: [branchSchema],
  },
  { timestamps: true }
)

// Auto-update totalBranches before saving
restaurantSchema.pre('save', function(next) {
  this.totalBranches = this.branches ? this.branches.length : 0
  next()
})

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema)

async function fixRestaurantDB() {
  try {
    console.log('🔄 Starting restaurant database fix...')
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`)
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: 'restaurant',
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    })
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db

    // Backup existing restaurants collection
    console.log('📦 Backing up restaurants collection...')
    try {
      const restaurantCount = await Restaurant.countDocuments()
      if (restaurantCount > 0) {
        const backupName = `restaurants_backup_fix_${Date.now()}`
        const restaurants = await Restaurant.find({}).lean()
        if (restaurants.length > 0) {
          await db.collection(backupName).insertMany(restaurants)
          console.log(`   ✅ Backed up ${restaurants.length} restaurant(s) → ${backupName}\n`)
        }
      }
    } catch (e) {
      console.log(`   ⚠️  Error backing up: ${e.message}\n`)
    }

    // Get or find existing restaurant
    let restaurant = null
    
    // Try to find by ID from .env
    if (process.env.Restaurant) {
      try {
        restaurant = await Restaurant.findById(process.env.Restaurant)
        if (restaurant) {
          console.log(`📋 Found restaurant by ID from .env: ${restaurant._id}`)
        }
      } catch (e) {
        console.log(`   ⚠️  Restaurant ID from .env not found: ${e.message}`)
      }
    }

    // If not found, try to get first restaurant
    if (!restaurant) {
      restaurant = await Restaurant.findOne()
      if (restaurant) {
        console.log(`📋 Found existing restaurant: ${restaurant._id}`)
      }
    }

    if (restaurant) {
      console.log('\n🔧 Fixing existing restaurant document...')
      
      // Ensure all required fields exist
      if (!restaurant.name) {
        restaurant.name = process.env.DEFAULT_RESTAURANT_NAME || 'My Restaurant'
        console.log(`   ✅ Set name: ${restaurant.name}`)
      }
      
      // Ensure branches array exists
      if (!Array.isArray(restaurant.branches)) {
        restaurant.branches = []
        console.log('   ✅ Initialized branches array')
      }
      
      // Ensure totalBranches matches branches length
      restaurant.totalBranches = restaurant.branches.length
      console.log(`   ✅ Updated totalBranches: ${restaurant.totalBranches}`)
      
      // Clean up any invalid branches
      const validBranches = restaurant.branches.filter(branch => {
        if (!branch || typeof branch !== 'object') return false
        if (!branch.name || !branch.address || !branch.city) return false
        return true
      })
      
      if (validBranches.length !== restaurant.branches.length) {
        console.log(`   ✅ Cleaned invalid branches: ${restaurant.branches.length} → ${validBranches.length}`)
        restaurant.branches = validBranches
        restaurant.totalBranches = validBranches.length
      }
      
      // Ensure optional fields are set (not undefined)
      if (restaurant.description === undefined) restaurant.description = ''
      if (restaurant.cuisine === undefined) restaurant.cuisine = ''
      if (restaurant.owner === undefined) restaurant.owner = ''
      if (restaurant.contactEmail === undefined) restaurant.contactEmail = ''
      if (restaurant.contactPhone === undefined) restaurant.contactPhone = ''
      if (restaurant.logo === undefined) restaurant.logo = ''
      if (restaurant.isLive === undefined) restaurant.isLive = false
      
      // Save the fixed restaurant
      await restaurant.save()
      console.log('   ✅ Saved fixed restaurant document\n')
      
      // Verify the saved document
      const verified = await Restaurant.findById(restaurant._id).lean()
      console.log('📊 Verified Restaurant Structure:')
      console.log(`   - _id: ${verified._id}`)
      console.log(`   - name: ${verified.name}`)
      console.log(`   - description: ${verified.description || '(empty)'}`)
      console.log(`   - cuisine: ${verified.cuisine || '(empty)'}`)
      console.log(`   - owner: ${verified.owner || '(empty)'}`)
      console.log(`   - contactEmail: ${verified.contactEmail || '(empty)'}`)
      console.log(`   - contactPhone: ${verified.contactPhone || '(empty)'}`)
      console.log(`   - isLive: ${verified.isLive}`)
      console.log(`   - logo: ${verified.logo || '(empty)'}`)
      console.log(`   - totalBranches: ${verified.totalBranches}`)
      console.log(`   - branches: ${verified.branches.length} branch(es)`)
      if (verified.branches.length > 0) {
        verified.branches.forEach((branch, idx) => {
          console.log(`      [${idx}] ${branch.name} - ${branch.city}`)
        })
      }
      console.log('')
      
    } else {
      // Create new restaurant
      console.log('➕ No restaurant found. Creating new restaurant...')
      
      const newRestaurant = await Restaurant.create({
        name: process.env.DEFAULT_RESTAURANT_NAME || 'My Restaurant',
        description: '',
        cuisine: '',
        owner: '',
        contactEmail: '',
        contactPhone: '',
        isLive: false,
        logo: '',
        branches: [],
        totalBranches: 0
      })
      
      console.log(`   ✅ Created new restaurant with ID: ${newRestaurant._id}`)
      console.log(`   📝 Name: ${newRestaurant.name}\n`)
      
      // Update .env.local if needed (optional)
      console.log(`💡 Tip: Add this to your .env.local file:`)
      console.log(`   Restaurant=${newRestaurant._id}\n`)
    }

    console.log('✅ Restaurant database fix completed successfully!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error fixing restaurant database:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the script
fixRestaurantDB()


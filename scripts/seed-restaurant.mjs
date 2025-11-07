#!/usr/bin/env node

/**
 * Standalone seed script to populate the database with restaurant data
 * Usage: node scripts/seed-restaurant.mjs
 * Or: npm run seed
 * 
 * This script creates a restaurant with sample data including:
 * - Restaurant profile information (name, logo, description, cuisine, owner, contact info)
 * - Multiple branches/locations
 * - Uses free random images from Picsum Photos
 */

import mongoose from 'mongoose'
import { Restaurant } from '../src/models/Restaurant.js'

// Load environment variables from process.env (assumes they're already loaded)
const MONGODB_URI = 'mongodb+srv://i222577:eBKIMX3E7rm7OuGL@cluster0.qeuzo.mongodb.net/restaurants'

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI or MONGODB_URI is required in environment variables')
  console.error('   Please set MONGO_URI in your .env.local or .env file')
  process.exit(1)
}

// Helper function to get random logo URL from Picsum Photos
function getRandomLogo() {
  return `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 100)}`
}

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...')
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

    // Clear existing restaurants
    console.log('🗑️  Clearing existing restaurants...')
    await Restaurant.deleteMany({})
    console.log('✅ Cleared existing restaurants\n')

    // Sample branches data
    const branches = [
      {
        name: 'Islamabad Main',
        address: 'G-13/1, near PGC, Islamabad, Pakistan',
        phone: '+92-51-1234567',
        city: 'Islamabad',
        coordinates: {
          lat: 33.6844,
          lng: 73.0479
        },
        status: 'Open',
        createdAt: new Date()
      },
      {
        name: 'Rawalpindi Branch',
        address: 'Saddar, Rawalpindi, Pakistan',
        phone: '+92-51-9876543',
        city: 'Rawalpindi',
        coordinates: {
          lat: 33.5651,
          lng: 73.0169
        },
        status: 'Open',
        createdAt: new Date()
      },
      {
        name: 'Lahore Downtown',
        address: 'MM Alam Road, Lahore, Pakistan',
        phone: '+92-42-5551234',
        city: 'Lahore',
        coordinates: {
          lat: 31.5204,
          lng: 74.3587
        },
        status: 'Open',
        createdAt: new Date()
      }
    ]

    // Create restaurant with new schema
    console.log('🌱 Seeding restaurant data...')
    
    const restaurant = new Restaurant({
      name: 'Food Delight Restaurant',
      logo: getRandomLogo(),
      description: 'A delightful culinary experience serving authentic flavors with a modern twist. We bring you the best of local and international cuisine.',
      cuisine: 'Pak-Chinese Fusion',
      owner: 'Muhammad Saad',
      contactEmail: 'contact@fooddelight.com',
      contactPhone: '+92-300-1234567',
      isLive: true,
      branches: branches
    })

    await restaurant.save()

    console.log('✅ Restaurant created successfully!')
    console.log(`   Name: ${restaurant.name}`)
    console.log(`   ID: ${restaurant._id}`)
    console.log(`   Logo: ${restaurant.logo}`)
    console.log(`   Description: ${restaurant.description}`)
    console.log(`   Cuisine: ${restaurant.cuisine}`)
    console.log(`   Owner: ${restaurant.owner}`)
    console.log(`   Contact Email: ${restaurant.contactEmail}`)
    console.log(`   Contact Phone: ${restaurant.contactPhone}`)
    console.log(`   Is Live: ${restaurant.isLive}`)
    console.log(`   Total Branches: ${restaurant.totalBranches}`)
    console.log(`   Branches:`)
    restaurant.branches.forEach((branch, index) => {
      console.log(`     ${index + 1}. ${branch.name} - ${branch.city} (${branch.status})`)
    })
    console.log('\n🎉 Database seeding completed successfully!\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the seed function
seedDatabase()


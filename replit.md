# Restaurant Ordering System - Baltit Wok

## Overview
Full-stack Next.js restaurant ordering application with real-time order tracking via WebSocket. Features menu management, customer ordering with delivery/pickup, admin dashboard, and MongoDB database integration.

## Recent Changes
- **November 14, 2024**: Migrated from Vercel to Replit
  - Updated server configuration to bind to 0.0.0.0:5000 for Replit compatibility
  - Fixed WebSocket URL to use same host/port as main application
  - Added caching to prevent duplicate restaurant creation
  - Configured deployment settings for autoscale deployment
  - Environment variables (MONGO_URI, JWT_SECRET) added to Replit Secrets

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.4, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes, Custom Node.js server with WebSocket support
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT tokens with HTTP-only cookies
- **Real-time**: WebSocket for live order updates

### Key Components
- `server.js` - Custom server combining Next.js with WebSocket server on port 5000
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (Customer, Admin, Menu, Checkout)
- `src/models/` - Mongoose schemas (Restaurant, Category, MenuItem, Order, User)
- `src/services/db.js` - Database connection and CRUD operations
- `src/hooks/useWebSocket.js` - WebSocket client hook with reconnection logic

### Database Schema
- **Restaurant**: Main restaurant profile with branches
- **Category**: Menu categories linked to restaurant
- **MenuItem**: Menu items with variants and sides
- **Order**: Customer orders with items, status tracking
- **User**: Admin users for authentication

## Environment Variables
Required secrets (configured in Replit Secrets):
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

Optional:
- `DEFAULT_RESTAURANT_NAME` - Name for auto-created restaurant (default: "My Restaurant")
- `Restaurant` - Specific restaurant ID to use
- `WS_BROADCAST_URL` - WebSocket broadcast endpoint (default: http://127.0.0.1:5000/internal/ws/broadcast)

## Running the Application

### Development
```bash
npm run dev
```
Starts custom server with Next.js and WebSocket on port 5000

### Production Build
```bash
npm run build
npm run start
```

### Database Seeding
```bash
npm run seed
```
Seeds restaurant with sample menu data

## Deployment
Configured for Replit Autoscale deployment:
- Build command: `npm run build`
- Start command: `npm run start`
- Port: 5000 (automatically exposed)

## Features
- Customer-facing menu browsing and ordering
- Shopping cart with variant and side selection
- Delivery/Pickup order types with address/branch selection
- Real-time order status updates via WebSocket
- Admin dashboard with order management
- Menu management (categories and items)
- Restaurant profile and branch management
- JWT-based admin authentication

## User Preferences
None specified yet.

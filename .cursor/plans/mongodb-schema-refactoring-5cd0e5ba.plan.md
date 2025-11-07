<!-- 5cd0e5ba-2e37-4058-85f9-f0679e67accd f3898647-4cf7-47b9-af1c-389e48f1bf76 -->
# MongoDB Schema Refactoring Plan

## Overview

Refactor the current nested MongoDB schema (categories and menuItems nested within Restaurant.menu, users nested within Restaurant.users) into separate normalized collections. All collections will be multi-tenant with restaurantId references.

## New Schema Structure

### 1. Restaurants Collection

- `_id`: ObjectId
- `name`: String
- `locations`: Map of {name, address, coordinates}
- `createdAt`: Date
- `updatedAt`: Date
- Remove: `menu.categories`, `users` arrays

### 2. Categories Collection (NEW)

- `_id`: ObjectId
- `restaurantId`: ObjectId (ref: Restaurant, indexed)
- `name`: String
- `description`: String
- `headerImage`: String
- `createdAt`: Date
- `updatedAt`: Date

### 3. MenuItems Collection (NEW)

- `_id`: ObjectId
- `restaurantId`: ObjectId (ref: Restaurant, indexed)
- `categoryId`: ObjectId (ref: Category, indexed)
- `name`: String
- `description`: String
- `image`: String
- `price`: Number (base price)
- `isAvailable`: Boolean
- `variants[]`: Array of {variant, price, img}
- `sides[]`: Array of {name, extraPrice, img}
- `createdAt`: Date

### 4. Orders Collection (UPDATE)

- `_id`: ObjectId
- `restaurantId`: ObjectId (ref: Restaurant, indexed)
- `userId`: ObjectId (ref: User, optional)
- `customer`: Object {name, phone, email, address}
- `items[]`: Array of {menuItemId, name, variant, price, quantity, selectedSides[]}
- `total`: Number
- `status`: String (indexed)
- `type`: String (pickup/delivery/dinein)
- `instructions`: String
- `createdAt`: Date (indexed)
- Remove: `name`, `phone`, `email`, `address` as separate fields

### 5. Users Collection (UPDATE)

- `_id`: ObjectId
- `restaurantId`: ObjectId (ref: Restaurant, nullable for Global users, indexed)
- `firstName`: String
- `lastName`: String
- `email`: String (indexed, unique per restaurantId)
- `passwordHash`: String
- `role`: String (enum)
- `createdAt`: Date

## Implementation Steps

### Phase 1: Create New Models

1. **Create `src/models/Category.js`**

- Schema with restaurantId reference
- Indexes: restaurantId, restaurantId+name (compound)

2. **Create `src/models/MenuItem.js`**

- Schema with restaurantId and categoryId references
- Indexes: restaurantId, categoryId, restaurantId+isAvailable (compound)

3. **Update `src/models/Restaurant.js`**

- Remove nested `menu.categories` and `users` arrays
- Keep only: name, locations, createdAt, updatedAt

4. **Update `src/models/Order.js`**

- Replace separate name/phone/email/address with `customer` object
- Update orderItemSchema: selectedSides format (per clarification)
- Add item `name` field for denormalized reference

5. **Update `src/models/User.js`**

- Add `restaurantId` field (ObjectId, nullable, indexed)
- Remove unique constraint on email (make it unique per restaurantId)
- Support "Global" users with restaurantId = null

### Phase 2: Update Database Service Functions (`src/services/db.js`)

**Restaurant functions:** No changes needed (already separate)

**Category functions:**

- `getCategories()`: Query Category.find({restaurantId})
- `createCategory()`: Create new Category document
- `updateCategory()`: Update Category.findByIdAndUpdate()
- `deleteCategory()`: Delete Category and cascade delete menuItems

**Menu Item functions:**

- `getMenuItems()`: Query MenuItem.find({restaurantId}).populate('categoryId')
- `getAllMenuItems()`: Same with isAvailable filter
- `getAllMenuItemsAdmin()`: Without filter
- `createMenuItem()`: Create MenuItem with restaurantId and categoryId
- `updateMenuItem()`: Update MenuItem.findByIdAndUpdate()
- `deleteMenuItem()`: Delete MenuItem
- `getMenuByCategory()`: Query by categoryId

**Order functions:**

- `createOrder()`: Update to use `customer` object structure
- `getOrders()`: No schema changes, but queries remain same
- Update order items structure to match new schema

**User functions:**

- `getUsers()`: Query User.find({restaurantId}) or User.find({restaurantId: null}) for Global
- `createUser()`: Create User with restaurantId (nullable)
- `findUserByEmail()`: Query User.findOne({email, restaurantId}) or {email, $or: [{restaurantId: null}, {restaurantId}]}
- `findUserById()`: Update if exists

### Phase 3: Update API Routes

**`src/app/api/categories/route.js`**

- GET: Use Category model
- POST: Use Category model
- PUT: Use Category model  
- DELETE: Add cascade delete for menuItems

**`src/app/api/menu-items/route.js`**

- GET: Use MenuItem model with populate
- POST: Include categoryId validation
- PUT: Update menuItem
- DELETE: Delete menuItem

**`src/app/api/menu-items/by-category/route.js`**

- GET: Query by categoryId instead of category name

**`src/app/api/menu/route.js`**

- GET: Aggregation to group menuItems by categoryId, populate categories

**`src/app/api/orders/route.js`**

- POST: Update to use `customer` object structure
- GET/PUT: Handle customer object

**`src/app/api/auth/login/route.js`**

- Update findUserByEmail to query User collection with restaurantId
- Support Global users (restaurantId = null)

**`src/app/api/auth/verify/route.js`**

- Update if it queries users

### Phase 4: Migration Script

**Create `scripts/migrate-to-separate-collections.mjs`**

1. Connect to database
2. Find all restaurants
3. For each restaurant:

- Extract categories → Create Category documents
- Extract menuItems → Create MenuItem documents with categoryId references
- Extract users → Create User documents with restaurantId

4. Backup old data (rename collection or export)
5. Update Orders: migrate name/phone/email/address to customer object
6. Verify data integrity
7. Log migration results

### Phase 5: Update Frontend Integration

**Review frontend code that accesses nested structures:**

- Components accessing `restaurant.menu.categories` → Update to use categories API
- Components accessing nested menuItems → Update to use menuItems API
- Ensure restaurantId is passed from .env (via getRestaurantId utility)

**Files to review:**

- `src/components/MenuManagement/` - Menu management components
- `src/components/Customer/menu.jsx` - Customer menu display
- `src/hooks/useRestaurant.js` - Restaurant hook
- All components using menu data

### Phase 6: Update Utilities

**`src/utils/getRestaurantId.js`**

- Ensure it properly returns restaurantId from .env
- Update any references to nested structures

### Phase 7: Indexes & Performance

**Ensure all indexes are created:**

- Categories: restaurantId, restaurantId+name
- MenuItems: restaurantId, categoryId, restaurantId+isAvailable
- Orders: restaurantId, restaurantId+status, restaurantId+createdAt
- Users: restaurantId, email, restaurantId+email (compound unique)
- Restaurants: (existing indexes)

### Phase 8: Testing & Validation

1. Test menu fetch with categories + menuItems
2. Test order creation with new customer structure
3. Test user authentication (branch-specific and Global)
4. Test category/menuitem CRUD operations
5. Verify restaurantId is included in all queries
6. Test cascade deletes (category → menuItems)

## Files to Create

- `src/models/Category.js`
- `src/models/MenuItem.js`
- `scripts/migrate-to-separate-collections.mjs`

## Files to Modify

- `src/models/Restaurant.js` - Remove nested structures
- `src/models/Order.js` - Update customer structure
- `src/models/User.js` - Add restaurantId
- `src/services/db.js` - Complete rewrite of category/menuitem/user functions
- `src/app/api/categories/route.js`
- `src/app/api/menu-items/route.js`
- `src/app/api/menu-items/by-category/route.js`
- `src/app/api/menu/route.js`
- `src/app/api/orders/route.js`
- `src/app/api/auth/login/route.js`
- `src/utils/getRestaurantId.js` (if needed)

## Migration Considerations

- Run migration script before deploying new code
- Keep old Restaurant collection structure as backup
- Test migration on staging first
- Consider data validation before migration
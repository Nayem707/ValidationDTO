# Product Module Implementation Guide

This document describes the complete **Product Module** implementation following modern Node.js/Express/Prisma architecture patterns.

## 🏗️ Module Architecture

The Product module follows a layered architecture pattern:

```
src/modules/product/
├── product.dto.js         # Data Transfer Objects & Validation
├── product.repository.js  # Database Operations
├── product.service.js     # Business Logic
├── product.controller.js  # HTTP Request/Response Handling
└── product.routes.js      # Route Definitions
```

## 📊 Database Schema

### Product Model
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  category    String
  stock       Int      @default(0)
  isActive    Boolean  @default(true)
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  @@map("products")
}
```

## 📋 API Endpoints

### Public Endpoints (No Authentication Required)
| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/products` | Get all products with pagination | `page`, `limit`, `category`, `minPrice`, `maxPrice`, `search`, `isActive`, `sortBy`, `sortOrder` |
| GET | `/api/products/search` | Search products | `q` (required), pagination params |
| GET | `/api/products/category/:category` | Get products by category | `limit`, `includeInactive` |
| GET | `/api/products/:id` | Get product by ID | - |

### Protected Endpoints (Authentication Required)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/products/user/my-products` | Get current user's products | - |
| GET | `/api/products/user/stats` | Get user's product statistics | - |
| POST | `/api/products` | Create new product | `{name, description?, price, category, stock?, isActive?}` |
| PATCH | `/api/products/:id` | Update product | `{name?, description?, price?, category?, stock?, isActive?}` |
| DELETE | `/api/products/:id` | Soft delete product | - |
| PATCH | `/api/products/:id/stock` | Update product stock | `{quantity, operation: "add"|"subtract"}` |
| PATCH | `/api/products/:id/restore` | Restore deleted product | - |

## 🔧 Implementation Details

### 1. DTO Layer (`product.dto.js`)

**Features:**
- **CreateProductDTO**: Validates product creation data
- **UpdateProductDTO**: Validates product update data with optional fields
- **QueryProductsDTO**: Validates query parameters for filtering and pagination

**Key Validations:**
- Name: 2-100 characters
- Price: Positive number, $0.01 - $999,999.99
- Category: 2-50 characters
- Stock: Non-negative integer
- Search and filtering parameters

### 2. Repository Layer (`product.repository.js`)

**Features:**
- **CRUD Operations**: Create, read, update, delete
- **Advanced Queries**: Search, filter, pagination, sorting
- **Relationships**: Includes user data in responses
- **Soft Delete**: Maintains data integrity
- **Stock Management**: Add/subtract inventory
- **Ownership Verification**: Check if user owns product

**Key Methods:**
```javascript
// Basic CRUD
findMany(filters)
findById(id, includeDeleted)
create(productData, userId)
update(id, updateData)
softDelete(id)

// Advanced operations
findByUserId(userId, options)
updateStock(id, quantity, operation)
findByCategory(category, options)
isOwner(productId, userId)
```

### 3. Service Layer (`product.service.js`)

**Features:**
- **Business Logic**: Price validation, ownership checks
- **Error Handling**: Meaningful error messages
- **Security**: User can only modify their own products
- **Statistics**: Product analytics for users
- **Data Integrity**: Prevents invalid operations

**Key Business Rules:**
- Users can only update/delete their own products
- Price must be greater than zero
- Stock cannot go negative
- Soft delete preserves data relationships

### 4. Controller Layer (`product.controller.js`)

**Features:**
- **Request Validation**: Uses DTOs for input validation
- **Error Handling**: Proper HTTP status codes and error responses
- **Pagination Support**: Standardized pagination responses
- **Authentication Context**: Uses JWT user data from middleware

**Response Format:**
```javascript
// Success Response
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Paginated Response
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5. Routes Layer (`product.routes.js`)

**Features:**
- **Public Routes**: Product browsing without authentication
- **Protected Routes**: CRUD operations require authentication
- **RESTful Design**: Standard HTTP methods and status codes
- **Middleware Integration**: Auth middleware applied selectively

## 🔐 Security Features

### Authentication & Authorization
- **JWT Authentication**: Required for write operations
- **Ownership Validation**: Users can only modify their own products
- **Input Validation**: All inputs validated using Zod schemas
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

### Data Security
- **Soft Delete**: Maintains referential integrity
- **Input Sanitization**: Automatic through validation schemas
- **Environment Variables**: Sensitive data in environment variables

## 🧪 Usage Examples

### Creating a Product
```bash
# PowerShell
$headers = @{ 
  "Authorization" = "Bearer your-jwt-token"
  "Content-Type" = "application/json"
}
$body = @{
  name = "Wireless Headphones"
  description = "High-quality wireless headphones with noise cancellation"
  price = 199.99
  category = "Electronics"
  stock = 50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method POST -Headers $headers -Body $body
```

### Searching Products
```bash
# Search for Electronics under $300
Invoke-RestMethod -Uri "http://localhost:3000/api/products/search?q=electronics&maxPrice=300&limit=5" -Method GET
```

### Updating Stock
```bash
$headers = @{ 
  "Authorization" = "Bearer your-jwt-token"
  "Content-Type" = "application/json"
}
$body = @{
  quantity = 10
  operation = "add"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/products/{productId}/stock" -Method PATCH -Headers $headers -Body $body
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL database
- Environment variables configured

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   JWT_SECRET="your-secret-key"
   JWT_EXPIRES_IN="7d"
   ```

3. Run database migrations:
   ```bash
   npm run db:migrate
   ```

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 📈 Performance Considerations

### Database Optimization
- **Indexes**: Email uniqueness, category filtering
- **Relations**: Efficient joins with user data
- **Pagination**: Offset-based pagination for large datasets
- **Soft Delete**: Filter out deleted records in queries

### Caching Strategies (Optional Enhancement)
- Redis for frequent searches
- In-memory caching for categories
- Database connection pooling

## 🔄 Extension Points

### Additional Features
- **File Uploads**: Product images
- **Reviews**: Product rating system
- **Inventory Tracking**: Low stock alerts
- **Bulk Operations**: Import/export products
- **Analytics**: Sales tracking, popular products

### Integration Options
- **Payment Gateway**: Stripe, PayPal integration
- **Image Storage**: AWS S3, Cloudinary
- **Search Engine**: Elasticsearch for advanced search
- **Notifications**: Stock alerts, price changes

## 📚 Dependencies Used

### Core Dependencies
- **@prisma/client**: Database ORM
- **express**: Web framework
- **zod**: Schema validation
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing

### Security Dependencies
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **morgan**: HTTP request logging

## 🏆 Best Practices Implemented

✅ **Separation of Concerns**: Clear layer separation  
✅ **Input Validation**: Comprehensive validation with Zod  
✅ **Error Handling**: Consistent error responses  
✅ **Security**: Authentication, authorization, input sanitization  
✅ **Documentation**: Extensive code documentation  
✅ **RESTful API**: Standard HTTP methods and status codes  
✅ **Database Best Practices**: Proper indexing, relationships  
✅ **Environment Configuration**: Configurable via environment variables  

This Product module serves as a template for implementing other modules in your application. The same patterns can be applied to create User, Order, Category, or any other modules you need.
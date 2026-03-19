# Node.js + Express + Prisma User Management API

A well-structured Node.js REST API built with Express, Prisma ORM, and Zod validation that follows the DTO (Data Transfer Object) pattern and implements proper layered architecture.

## 🏗️ Project Structure

```
ValidationDTO/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── migrations/            # Database migration files
├── src/
│   ├── controllers/
│   │   └── user.controller.js # HTTP request/response handling
│   ├── services/
│   │   └── user.service.js    # Business logic layer
│   ├── dto/
│   │   └── user.dto.js        # Data Transfer Objects & validation
│   ├── routes/
│   │   └── user.routes.js     # API route definitions
│   └── prisma/
│       └── prisma.js          # Prisma client configuration
├── app.js                     # Main application entry point
├── package.json               # Dependencies and scripts
└── .env                       # Environment variables
```

```

    src/
├── app.js
├── server.js
├───modules
│   ├───auth
│   │       auth.controller.js
│   │       auth.dto.js
│   │       auth.repository.js
│   │       auth.routes.js
│   │       auth.service.js
│   │       auth.test.http
│   │
│   ├───product
│   │       product.controller.js
│   │       product.dto.js
│   │       product.repository.js
│   │       product.routes.js
│   │       product.service.js
│   │       product.test.http
│   │
│   └───user
│           user.controller.js
│           user.dto.js
│           user.repository.js
│           user.routes.js
│           user.service.js
│           user.test.http
├── routes/
│   ├── index.js    // Root router
├── controllers/
│   ├── index.js    // (if needed)
├── services/
│   ├── index.js    // (if needed)
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
├── validators/
│   ├── auth.validator.js
├── utils/
│   ├── apiResponse.js
│   ├── jwt.js
└── config/
│   ├── index.js
│   ├── database.js
```

## 🚀 Features

- **Clean Architecture**: Separated layers (Controller → Service → Database)
- **DTO Pattern**: Input validation using Data Transfer Objects
- **Zod Validation**: Schema-based request validation
- **Prisma ORM**: Type-safe database operations
- **Error Handling**: Global error handling middleware
- **SQLite Database**: Lightweight database for development
- **REST API**: Standard HTTP methods and status codes

## 📋 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/health` | Health check | - |
| GET | `/api/users` | Get all users | - |
| GET | `/api/users/:id` | Get user by ID | - |
| POST | `/api/users` | Create new user | `{name, email}` |
| PATCH | `/api/users/:id` | Update user | `{name?, email?}` |
| DELETE | `/api/users/:id` | Delete user (soft delete) | - |

## 🗃️ Database Schema

### User Model
- `id`: String (CUID, Primary Key)
- `name`: String (Required)
- `email`: String (Required, Unique)
- `role`: String (Default: 'user')
- `isDeleted`: Boolean (Default: false)
- `createdAt`: DateTime (Auto-generated)
- `updatedAt`: DateTime (Auto-updated)

## 📦 Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 🧪 API Testing Examples

### Create a User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST -Body '{"name": "John Doe", "email": "john@example.com"}' -ContentType "application/json"

# Curl (Git Bash/Linux)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Get All Users
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET

# Curl
curl http://localhost:3000/api/users
```

### Update a User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/users/{user-id}" -Method PATCH -Body '{"name": "John Smith"}' -ContentType "application/json"

# Curl
curl -X PATCH http://localhost:3000/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{"name": "John Smith"}'
```

### Delete a User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/users/{user-id}" -Method DELETE

# Curl
curl -X DELETE http://localhost:3000/api/users/{user-id}
```

## 🏛️ Architecture Patterns

### 1. DTO Pattern
- **CreateUserDTO**: Validates name and email for new users
- **UpdateUserDTO**: Validates optional name and email for updates
- Prevents sensitive fields (role, isDeleted) from being modified by clients

### 2. Service Layer
- Contains business logic
- Handles database operations
- Manages data validation and constraints
- Provides error handling

### 3. Controller Layer
- Handles HTTP requests/responses
- Validates DTOs using Zod schemas
- Calls service layer methods
- Returns standardized JSON responses

### 4. Error Handling
- Global error handler middleware
- Standardized error responses
- Environment-specific error details
- Graceful shutdown handling

## 📝 Validation Rules

### CreateUserDTO
- `name`: Required, minimum 2 characters
- `email`: Required, valid email format

### UpdateUserDTO
- `name`: Optional, minimum 2 characters if provided
- `email`: Optional, valid email format if provided
- At least one field must be provided

## 🔒 Security Features

- Input validation using Zod schemas
- SQL injection protection via Prisma ORM
- Unique email constraint
- Soft delete functionality
- Request size limits

## 🛠️ Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with hot reload
npm run db:migrate # Run database migrations
npm run db:generate # Generate Prisma client
npm run db:studio  # Open Prisma Studio (database GUI)
```

## 🔧 Environment Variables

Copy `.env` and configure:

```env
DATABASE_URL="file:./dev.db"
```

## 🏗️ Technologies Used

- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **Prisma 5** - ORM and database toolkit
- **Zod** - Schema validation library
- **SQLite** - Database engine
- **Nodemon** - Development hot reload

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* result data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🎯 Best Practices Implemented

- **Separation of Concerns**: Clear separation between layers
- **Single Responsibility**: Each class/function has one job
- **Input Validation**: All inputs validated before processing
- **Error Handling**: Comprehensive error handling at all levels
- **Logging**: Query and error logging for debugging
- **Type Safety**: Zod schemas ensure type safety
- **Clean Code**: Readable and maintainable code structure

## 🚀 Getting Started

1. Clone or download the project
2. Run `npm install` to install dependencies
3. Run `npm run db:migrate` to set up the database
4. Run `npm run dev` to start the development server
5. Test the API at `http://localhost:3000/api/users`

The server will start at `http://localhost:3000` with verbose logging enabled for development.
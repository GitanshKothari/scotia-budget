# FinTracker - Project Structure Documentation

This document provides a comprehensive overview of the project structure and explains the functionality of each file and directory in the FinTracker application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Root Directory](#root-directory)
4. [Frontend Directory](#frontend-directory)
5. [BFF Directory](#bff-directory)
6. [Core Directory](#core-directory)
7. [Data Flow](#data-flow)

---

## Project Overview

FinTracker is a full-stack budgeting web application that allows users to track transactions, manage budgets, set savings goals, and analyze spending patterns through an intuitive dashboard.

---

## Architecture

The application follows a three-tier architecture:

1. **Frontend** - React + TypeScript + Tailwind CSS (Port 5173)
2. **BFF (Backend for Frontend)** - Node.js + Express + TypeScript (Port 3001)
3. **Core Backend** - Spring Boot + Java 17 + PostgreSQL (Port 8080)

---

## Root Directory

### Configuration Files

- **`README.md`** - Main project documentation with setup instructions, architecture overview, and feature list
- **`plan.md`** - Project planning and development notes
- **`local_db.sql`** - SQL script for local database setup (if applicable)
- **`start-all.ps1`** - PowerShell script to start all three services simultaneously
  - Opens separate PowerShell windows for Core, BFF, and Frontend
  - Includes delays to ensure services start in the correct order

---

## Frontend Directory

The frontend is a React application built with TypeScript, Vite, and Tailwind CSS.

### Root Configuration Files

- **`package.json`** - Defines dependencies and scripts:
  - Dependencies: React, React Router, Axios, Recharts, React Icons
  - Dev dependencies: Vite, TypeScript, Tailwind CSS, PostCSS
  - Scripts: `dev` (development server), `build` (production build), `preview` (preview build)

- **`vite.config.ts`** - Vite configuration:
  - React plugin setup
  - Development server on port 5173
  - Proxy configuration: `/api` requests forwarded to `http://localhost:3001` (BFF)

- **`tsconfig.json`** - TypeScript compiler configuration
- **`tsconfig.node.json`** - TypeScript config for Node.js tooling
- **`tailwind.config.js`** - Tailwind CSS configuration:
  - Custom primary color (Blue: `#ec111a`)
  - Dark mode support via class strategy
  - Inter font family

- **`postcss.config.js`** - PostCSS configuration for Tailwind CSS processing
- **`index.html`** - HTML entry point for the React application

### Source Directory (`src/`)

#### Entry Points

- **`main.tsx`** - Application entry point:
  - Renders the root App component
  - Wraps app in React.StrictMode
  - Imports global CSS styles

- **`App.tsx`** - Main application component:
  - Sets up React Router with route definitions
  - Wraps application in ThemeProvider and AuthProvider
  - Defines protected and public routes
  - Routes:
    - `/login` - Login page (redirects to dashboard if authenticated)
    - `/register` - Registration page (redirects to dashboard if authenticated)
    - `/dashboard` - Dashboard page (protected)
    - `/transactions` - Transactions page (protected)
    - `/budgets` - Budgets page (protected)
    - `/settings` - Settings page (protected)
    - `/` - Redirects to `/dashboard`

- **`index.css`** - Global CSS styles and Tailwind CSS imports

#### Context (`src/context/`)

- **`AuthContext.tsx`** - Authentication context provider:
  - Manages user authentication state (user, token, isAuthenticated)
  - Provides `login()`, `register()`, and `logout()` functions
  - Persists authentication state in localStorage
  - Auto-restores authentication on page reload
  - Exports `useAuth()` hook for consuming authentication state

- **`ThemeContext.tsx`** - Theme management context:
  - Manages light/dark theme state
  - Persists theme preference in localStorage
  - Applies/removes `dark` class on document root
  - Provides `theme`, `toggleTheme()`, and `setTheme()` functions
  - Exports `useTheme()` hook

#### Components (`src/components/`)

- **`ProtectedRoute.tsx`** - Route protection component:
  - Wraps protected routes
  - Redirects to `/login` if user is not authenticated
  - Renders children if user is authenticated

- **`Modal.tsx`** - Reusable modal/dialog component for displaying content in overlays

- **`SettingsDialog.tsx`** - Settings dialog component:
  - Allows users to update profile information
  - Theme preference selection
  - User profile management UI

- **`Icons.tsx`** - Custom icon components or icon utilities

#### Layouts (`src/layouts/`)

- **`MainLayout.tsx`** - Main application layout:
  - Provides consistent navigation sidebar
  - Header with user info and theme toggle
  - Page title display
  - Responsive layout structure
  - Navigation links: Dashboard, Transactions, Budgets, Settings

#### Pages (`src/pages/`)

- **`LoginPage.tsx`** - User login page:
  - Email and password input form
  - Calls `login()` from AuthContext
  - Redirects to dashboard on successful login
  - Error handling and display

- **`RegisterPage.tsx`** - User registration page:
  - Name, email, and password input form
  - Calls `register()` from AuthContext
  - Auto-login after successful registration
  - Error handling and display

- **`DashboardPage.tsx`** - Main dashboard page:
  - Displays spending summary and statistics
  - Charts and visualizations (using Recharts):
    - Pie chart for spending by category
    - Area chart for daily spending trends
    - Bar chart for budget vs actual spending
  - Recent transactions list
  - Month selector for filtering data
  - Fetches data from `/api/dashboard` endpoint

- **`TransactionsPage.tsx`** - Transaction management page:
  - Lists all user transactions
  - Add, edit, delete transaction functionality
  - Filtering and sorting options
  - Category assignment
  - Fetches data from `/api/transactions` endpoint

- **`BudgetsPage.tsx`** - Budget management page:
  - Lists all user budgets by category
  - Create, update, delete budget functionality
  - Budget limit setting
  - Progress tracking
  - Fetches data from `/api/budgets` endpoint

- **`SettingsPage.tsx`** - User settings page:
  - Profile information display and editing
  - Theme preference selection
  - Account management options

#### Library (`src/lib/`)

- **`apiClient.ts`** - Axios HTTP client configuration:
  - Base URL configuration
  - Request interceptor: Adds JWT token from localStorage to Authorization header
  - Response interceptor: Handles 401 errors by clearing auth and redirecting to login
  - Centralized error handling
  - Used throughout the application for API calls

#### Types (`src/types/`)

- **`index.ts`** - TypeScript type definitions:
  - `User` - User entity interface
  - `AuthResponse` - Authentication API response structure
  - `ApiResponse<T>` - Generic API response wrapper
  - `Transaction` - Transaction entity interface
  - `Budget` - Budget entity interface

#### Data (`src/data.ts`)

- Static data or mock data for development/testing purposes

---

## BFF Directory

The BFF (Backend for Frontend) is a Node.js/Express middleware layer that sits between the frontend and core backend.

### Root Configuration Files

- **`package.json`** - BFF dependencies and scripts:
  - Dependencies: Express, Axios, JWT, CORS, Morgan, dotenv
  - Dev dependencies: TypeScript, tsx (for running TypeScript directly)
  - Scripts: `dev` (development with hot reload), `build` (compile TypeScript), `start` (run compiled code)

- **`tsconfig.json`** - TypeScript configuration:
  - Target: ES2020
  - Module: CommonJS
  - Output directory: `dist/`
  - Strict type checking enabled

### Source Directory (`src/`)

#### Entry Point

- **`index.ts`** - Express application entry point:
  - Initializes Express app
  - Configures CORS, Morgan (logging), JSON body parser
  - Sets up route handlers:
    - `/api` - Health check routes
    - `/api/auth` - Authentication routes
    - `/api/categories` - Category management routes
    - `/api/budgets` - Budget management routes
    - `/api/transactions` - Transaction management routes
  - `/api/dashboard` - Dashboard data routes
  - `/api/report` - Report generation routes
  - `/api/users` - User management routes
  - Starts server on port 3001 (or PORT from environment)

#### Services (`src/services/`)

- **`coreService.ts`** - Service for communicating with Core backend:
  - Creates Axios instance pointing to Core backend (default: `http://localhost:8080`)
  - `callCore()` method: Makes HTTP requests to Core backend
  - Automatically adds `X-User-Id` header when userId is provided
  - Error handling and response transformation
  - Centralized Core API communication

#### Middleware (`src/middleware/`)

- **`authMiddleware.ts`** - JWT authentication middleware:
  - Extracts JWT token from `Authorization: Bearer <token>` header
  - Verifies token using JWT_SECRET from environment
  - Decodes token to extract user ID and email
  - Attaches user info to `req.user` for downstream handlers
  - Returns 401 if token is missing, invalid, or expired
  - Used to protect routes that require authentication

#### Routes (`src/routes/`)

- **`healthRoutes.ts`** - Health check endpoints for monitoring service status

- **`authRoutes.ts`** - Authentication routes:
  - `POST /api/auth/register` - User registration (proxies to Core)
  - `POST /api/auth/login` - User login:
    - Calls Core `/core/auth/verify` to validate credentials
    - Generates JWT token if credentials are valid
    - Returns token and user data
  - `GET /api/auth/me` - Get current user (protected, requires auth middleware)

- **`categoriesRoutes.ts`** - Category management routes:
  - CRUD operations for transaction categories
  - Proxies requests to Core backend

- **`budgetsRoutes.ts`** - Budget management routes:
  - CRUD operations for budgets
  - Proxies requests to Core backend with user context

- **`transactionsRoutes.ts`** - Transaction management routes:
  - CRUD operations for transactions
  - Proxies requests to Core backend with user context

- **`dashboardRoutes.ts`** - Dashboard data routes:
  - Aggregates data for dashboard display
  - Proxies requests to Core backend

- **`userRoutes.ts`** - User management routes:
  - User profile updates
  - Theme preference updates
  - Proxies requests to Core backend

#### Types (`src/types/`)

- **`index.ts`** - TypeScript type definitions:
  - `AuthUser` - Authenticated user interface
  - `AuthRequest` - Express Request extended with user property
  - `JWTPayload` - JWT token payload structure

---

## Core Directory

The Core backend is a Spring Boot application that handles business logic and database operations.

### Root Configuration Files

- **`pom.xml`** - Maven project configuration:
  - Spring Boot 3.2.0 parent
  - Java 17
  - Dependencies:
    - Spring Boot Web (REST API)
    - Spring Data JPA (database access)
    - PostgreSQL driver
    - Lombok (code generation)
    - Spring Validation
    - Spring Security Crypto (password hashing)
  - Spring Boot Maven plugin for building and running

### Source Directory (`src/main/java/com/scotia/core/`)

#### Entry Point

- **`CoreApplication.java`** - Spring Boot application entry point:
  - `@SpringBootApplication` annotation
  - Main method that starts the Spring Boot application
  - Runs on port 8080 (configured in `application.properties`)

#### Configuration (`config/`)

- **`WebConfig.java`** - Web MVC configuration:
  - Registers `UserHeaderInterceptor` for all requests
  - Configures Spring MVC interceptors

- **`UserHeaderInterceptor.java`** - Request interceptor:
  - Extracts `X-User-Id` header from incoming requests
  - Stores user ID in request context for use in controllers/services
  - Enables user context propagation from BFF to Core

- **`GlobalExceptionHandler.java`** - Global exception handler:
  - Catches and handles exceptions across the application
  - Returns standardized error responses
  - Handles validation errors, not found errors, etc.

#### Controllers (`controller/`)

- **`AuthController.java`** - Authentication endpoints:
  - `POST /core/auth/register` - User registration:
    - Validates email uniqueness
    - Hashes password using BCrypt
    - Creates new user with default theme preference
    - Returns user response
  - `POST /core/auth/verify` - Credential verification:
    - Validates email and password
    - Returns user if credentials are valid
    - Returns 401 if invalid

- **`UserController.java`** - User management endpoints:
  - `GET /core/users/{id}` - Get user by ID
  - `PUT /core/users/{id}` - Update user profile
  - Handles theme preference updates

- **`TransactionController.java`** - Transaction management endpoints:
  - CRUD operations for transactions
  - Filters transactions by user (from X-User-Id header)
  - Date range filtering
  - Category filtering

- **`BudgetController.java`** - Budget management endpoints:
  - CRUD operations for budgets
  - Filters budgets by user
  - Monthly budget tracking

- **`CategoryController.java`** - Category management endpoints:
  - CRUD operations for categories
  - Category type management (INCOME, EXPENSE)

- **`DashboardController.java`** - Dashboard data aggregation:
  - `GET /core/dashboard` - Aggregates dashboard data:
    - Total spending for selected month
    - Spending by category
    - Daily spending trends
    - Budget summaries
    - Budget vs actual comparisons

- **`HealthController.java`** - Health check endpoint:
  - `GET /core/health` - Returns service health status

#### Entities (`entity/`)

- **`User.java`** - User entity:
  - Fields: id (UUID), email, passwordHash, name, themePreference, createdAt, updatedAt
  - JPA annotations for database mapping
  - Enum: `ThemePreference` (LIGHT, DARK, SYSTEM)
  - Auto-manages timestamps with `@PrePersist` and `@PreUpdate`

- **`Transaction.java`** - Transaction entity:
  - Fields: id, userId, date, categoryId, type, amount, description, merchantName
  - Relationships with User and Category entities
  - JPA annotations for database mapping

- **`Budget.java`** - Budget entity:
  - Fields: id, userId, categoryId, limit, month, year
  - Relationships with User and Category entities
  - Monthly budget tracking

- **`Category.java`** - Category entity:
  - Fields: id, name, type (INCOME/EXPENSE), color, icon
  - Enum: `CategoryType`
  - JPA annotations for database mapping

#### Repositories (`repository/`)

- **`UserRepository.java`** - User data access:
  - Extends JpaRepository
  - Custom queries: `findByEmail()`, `existsByEmail()`
  - Spring Data JPA repository interface

- **`TransactionRepository.java`** - Transaction data access:
  - Extends JpaRepository
  - Custom queries for filtering by user, date range, category
  - Aggregation queries for dashboard data

- **`BudgetRepository.java`** - Budget data access:
  - Extends JpaRepository
  - Custom queries for filtering by user, month, year
  - Budget summary queries

- **`CategoryRepository.java`** - Category data access:
  - Extends JpaRepository
  - Custom queries for filtering by type

#### DTOs (`dto/`)

Data Transfer Objects for API request/response:

- **`ApiResponse.java`** - Generic API response wrapper:
  - Fields: success (boolean), data (generic), message (String)
  - Static factory methods: `success()`, `error()`

- **`RegisterRequest.java`** - User registration request:
  - Fields: name, email, password
  - Validation annotations

- **`VerifyRequest.java`** - Credential verification request:
  - Fields: email, password

- **`UserResponse.java`** - User response DTO:
  - Fields: id, email, name, themePreference
  - Static method: `fromEntity()` to convert User entity

- **`TransactionRequest.java`** - Transaction creation/update request
- **`TransactionResponse.java`** - Transaction response DTO
- **`UpdateTransactionRequest.java`** - Transaction update request

- **`BudgetRequest.java`** - Budget creation request
- **`BudgetResponse.java`** - Budget response DTO
- **`UpdateBudgetRequest.java`** - Budget update request

- **`CategoryResponse.java`** - Category response DTO

- **`DashboardSummaryResponse.java`** - Dashboard data aggregation response:
  - Nested classes: `BudgetSummary`, `SpendingByCategory`, `DailySpending`
  - Aggregated spending statistics

- **`UpdateUserRequest.java`** - User update request

#### Services (`service/`)

Service layer for business logic (currently empty, business logic in controllers)

#### Seed (`seed/`)

- **`DataSeeder.java`** - Database seeding:
  - Initializes default categories
  - Creates demo users (admin, demo user)
  - Populates sample data for development/testing

### Resources (`src/main/resources/`)

- **`application.properties`** - Spring Boot configuration:
  - Application name: `scotia-budget-core`
  - Server port: 8080
  - PostgreSQL database connection:
    - URL, username, password
    - Driver class
  - JPA/Hibernate configuration:
    - DDL auto: none (database schema managed separately)
    - Dialect: PostgreSQL
    - SQL logging settings
  - Jackson serialization settings

---

## Data Flow

### Request Flow

1. **User Action** → Frontend (React)
   - User interacts with UI component
   - Component calls `apiClient` method

2. **Frontend → BFF**
   - HTTP request to `/api/*` endpoint
   - JWT token automatically added to Authorization header (via axios interceptor)
   - Vite proxy forwards request to `http://localhost:3001`

3. **BFF Processing**
   - Express route handler receives request
   - `authMiddleware` verifies JWT token (for protected routes)
   - Extracts user ID from token
   - `coreService.callCore()` makes request to Core backend
   - Adds `X-User-Id` header to Core request

4. **BFF → Core**
   - HTTP request to `/core/*` endpoint
   - Request forwarded to `http://localhost:8080`

5. **Core Processing**
   - `UserHeaderInterceptor` extracts `X-User-Id` header
   - Controller receives request with user context
   - Service/Repository layer queries database
   - Returns response DTO

6. **Response Flow**
   - Core → BFF → Frontend
   - Response data transformed and returned
   - Frontend updates UI with new data

### Authentication Flow

1. **Registration**
   - Frontend: User submits registration form
   - BFF: `POST /api/auth/register` → Core `/core/auth/register`
   - Core: Creates user, hashes password, saves to database
   - BFF: Returns user data
   - Frontend: Auto-login (calls login endpoint)

2. **Login**
   - Frontend: User submits login form
   - BFF: `POST /api/auth/login` → Core `/core/auth/verify`
   - Core: Validates credentials, returns user
   - BFF: Generates JWT token, returns token + user
   - Frontend: Stores token in localStorage, updates AuthContext

3. **Authenticated Requests**
   - Frontend: Includes JWT in Authorization header
   - BFF: `authMiddleware` verifies token, extracts user ID
   - BFF: Adds `X-User-Id` header to Core request
   - Core: Uses user ID for data filtering

### Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts (id, email, password_hash, name, theme_preference, timestamps)
- **categories** - Transaction categories (id, name, type, color, icon)
- **transactions** - Financial transactions (id, user_id, date, category_id, type, amount, description, merchant_name)
- **budgets** - Monthly budgets (id, user_id, category_id, limit, month, year)

---

## Environment Variables

### BFF (.env)
- `PORT` - BFF server port (default: 3001)
- `CORE_URL` - Core backend URL (default: http://localhost:8080)
- `JWT_SECRET` - Secret key for JWT token signing

### Core (application.properties)
- Database connection details
- Server port
- JPA/Hibernate settings

---

## Development Workflow

1. **Start Core Backend**: `cd core && mvn spring-boot:run`
2. **Start BFF**: `cd bff && npm run dev`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Or use**: `./start-all.ps1` (Windows PowerShell script)

---

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts
- **BFF**: Node.js 20, Express, TypeScript, JWT, Axios
- **Core**: Spring Boot 3, Java 17, Spring Data JPA, PostgreSQL, Lombok
- **Database**: PostgreSQL (hosted on Supabase)

---

This documentation provides a comprehensive overview of the project structure. Each file serves a specific purpose in the three-tier architecture, enabling a scalable and maintainable budgeting application.


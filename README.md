# Scotia Budget

A modern, full-stack personal budgeting and expense tracking application built with React, Spring Boot, and PostgreSQL. Scotia Budget helps you take control of your finances by providing intuitive tools to track transactions, manage budgets, and visualize your spending patterns through comprehensive analytics and charts.

## Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe UI components
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Recharts** for interactive data visualizations
- **React Router** for client-side routing
- **Axios** for API communication

### Backend for Frontend (BFF)
- **Node.js 20** with Express.js
- **TypeScript** for type safety
- **JWT** for authentication and authorization
- Acts as a middleware layer between frontend and core services

### Core Backend
- **Spring Boot 3** with Java 17
- **Spring Data JPA** for database operations
- **PostgreSQL** for data persistence
- **Hibernate** with automatic schema updates
- **BCrypt** for password hashing
- **Jakarta Persistence** for entity management with foreign key constraints

## Architecture

This repository follows a microservices-inspired architecture with three independent services:

- **frontend/** - React SPA that communicates with the BFF layer
- **bff/** - Backend for Frontend (BFF) pattern - handles authentication, request routing, and API aggregation
- **core/** - Core business logic and data persistence layer

### Data Flow

1. **Frontend** → Makes HTTP requests to BFF endpoints under `/api`
2. **BFF** → Validates JWT tokens, forwards requests to Core service under `/core`
3. **Core** → Processes business logic, interacts with PostgreSQL database
4. **Response** → Flows back through the same layers to the frontend

This architecture provides:
- **Separation of Concerns**: Each layer has a distinct responsibility
- **Security**: Authentication handled at the BFF layer
- **Scalability**: Services can be scaled independently
- **Maintainability**: Clear boundaries between frontend, API gateway, and business logic

## Getting Started

### Prerequisites

- Node.js 20+
- Java 17+
- Maven
- PostgreSQL

### Setup

1. **Core Backend (Spring Boot)**
   ```bash
   cd core
   # Configure PostgreSQL in application.properties
   mvn spring-boot:run
   ```
   Runs on port 8080

2. **BFF (Node/Express)**
   ```bash
   cd bff
   npm install
   # Set JWT_SECRET in .env
   npm run dev
   ```
   Runs on port 3001

3. **Frontend (React)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Runs on port 5173

## Demo Credentials

- **Demo User**: demo@example.com / Demo123!

## Features

### 🔐 Authentication & User Management
- Secure user registration and login with JWT authentication
- User profile management (update name)
- Protected routes with automatic redirects

### 💰 Transaction Management
- Add, edit, and delete transactions
- Categorize transactions with default categories (Groceries, Transport, Bills, Shopping, Entertainment, Rent, Salary, Misc)
- Filter transactions by category and date range
- Search transactions by description or merchant name
- View all transactions in a sortable table with category icons

### 📊 Budget Management
- Create monthly budgets for expense categories
- Set custom spending limits per category
- Track actual spending vs. budgeted amounts
- Enable/disable budgets (active/inactive status)
- Visual comparison of budget vs. actual spending

### 📈 Dashboard & Analytics
- **Summary Cards**: Total spent, monthly budget, and safe-to-spend amount
- **Spending by Category**: Interactive donut chart showing spending distribution
- **Budget vs. Actual**: Bar chart comparing budgeted vs. actual spending per category
- **Daily Spending Trend**: Area chart showing daily spending patterns throughout the month
- **Recent Transactions**: Quick view of the 5 most recent transactions
- Month selector to view historical data
- Real-time calculations and visualizations

### 🎨 User Experience
- **Dark Mode**: Full dark mode support with theme persistence
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Category Icons**: Visual category icons for quick recognition
- **Color-Coded Categories**: Consistent color scheme across charts and UI

### ⚙️ Settings
- Update user profile information
- View default categories
- Theme preferences (light/dark mode)


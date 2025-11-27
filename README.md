# FinTracker

A full stack budgeting web application for tracking expenses, managing budgets, and analyzing spending patterns.

## Architecture

This repository contains three independent projects:

- **frontend/** - React + TypeScript + Tailwind CSS + Vite
- **bff/** - Node 20 + Express + TypeScript (Backend for Frontend)
- **core/** - Spring Boot 3 + Java 17 + PostgreSQL

## Data Flow

- React frontend calls BFF endpoints under `/api`
- BFF calls Spring Boot endpoints under `/core`
- Spring Boot uses PostgreSQL for persistent data

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

- **Admin**: admin@example.com / Admin123!
- **Demo User**: demo@example.com / Demo123!

## Features

- User authentication with JWT
- Account management (Chequing, Savings, Credit Card)
- Transaction tracking with categorization
- Budget management with monthly limits
- Savings goals tracking
- Dashboard with charts and spending analysis
- Dark mode support
- Notifications for budget thresholds and goal completion


# Setup and Running Guide

## Prerequisites

1. **PostgreSQL** - Install and ensure it's running
2. **Java 17+** - For Spring Boot core backend
3. **Maven** - For building the Spring Boot project
4. **Node.js 20+** - For BFF and frontend
5. **npm** - Comes with Node.js

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE scotia_budget;
```

2. Update database credentials in `core/src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/scotia_budget
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Running the Application

### Step 1: Start Core Backend (Spring Boot)

Open a terminal and navigate to the core directory:

```bash
cd core
mvn clean install
mvn spring-boot:run
```

The core backend will start on **http://localhost:8080**

The first run will:
- Create all database tables automatically
- Seed the database with:
  - Admin user: `admin@example.com` / `Admin123!`
  - Demo user: `demo@example.com` / `Demo123!`
  - Default categories
  - Sample accounts, budgets, transactions, and goals

### Step 2: Start BFF (Node/Express)

Open a **new terminal** and navigate to the bff directory:

```bash
cd bff
npm install
```

Create a `.env` file in the `bff` directory:
```env
PORT=3001
CORE_URL=http://localhost:8080
JWT_SECRET=your-secret-key-change-in-production
```

Then start the BFF:
```bash
npm run dev
```

The BFF will start on **http://localhost:3001**

### Step 3: Start Frontend (React)

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

## Testing the Application

1. Open your browser and go to **http://localhost:5173**

2. **Login with demo credentials:**
   - Email: `demo@example.com`
   - Password: `Demo123!`

3. **Or create a new account** using the Register page

4. **Admin access:**
   - Email: `admin@example.com`
   - Password: `Admin123!`

## What to Test

### Dashboard
- View account balances
- See spending by category (pie chart)
- View daily spending trends (line chart)
- Check budget progress bars
- View savings goals progress

### Accounts
- Add new accounts
- Edit account details
- Delete accounts
- View account balances

### Transactions
- Add new transactions (with auto-categorization if category is left empty)
- Filter transactions by account, category, date range, search
- Export transactions to CSV

### Budgets
- Create budgets for categories
- View current spending vs. budget limits
- See status indicators (UNDER/CLOSE/OVER)

### Goals
- Create savings goals
- Update goal progress
- View goal completion status

### Settings
- Update profile information
- Change preferred currency
- Manage custom categories

### Notifications
- Click the bell icon in the header
- View budget threshold warnings (when spending exceeds 80% of budget)
- View goal completion notifications

## Troubleshooting

### Core Backend Issues

**Port 8080 already in use:**
- Change port in `core/src/main/resources/application.properties`:
  ```properties
  server.port=8081
  ```
- Update `CORE_URL` in BFF `.env` file accordingly

**Database connection errors:**
- Ensure PostgreSQL is running
- Check database credentials in `application.properties`
- Verify database `scotia_budget` exists

### BFF Issues

**Port 3001 already in use:**
- Change `PORT` in `bff/.env` file

**Cannot connect to core:**
- Verify core backend is running on port 8080
- Check `CORE_URL` in `bff/.env` file

### Frontend Issues

**Port 5173 already in use:**
- Vite will automatically use the next available port
- Or change port in `frontend/vite.config.ts`

**API calls failing:**
- Verify BFF is running on port 3001
- Check browser console for errors
- Verify proxy configuration in `frontend/vite.config.ts`

## Development Commands

### Core Backend
```bash
cd core
mvn spring-boot:run          # Run application
mvn clean install            # Build and install
mvn test                     # Run tests
```

### BFF
```bash
cd bff
npm run dev                  # Run in development mode
npm run build                 # Build for production
npm start                     # Run production build
```

### Frontend
```bash
cd frontend
npm run dev                   # Run development server
npm run build                 # Build for production
npm run preview               # Preview production build
```

## Quick Start Script (Optional)

You can create a script to start all services at once. For Windows (PowerShell), create `start-all.ps1`:

```powershell
# Start Core
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd core; mvn spring-boot:run"

# Wait a bit for core to start
Start-Sleep -Seconds 10

# Start BFF
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd bff; npm run dev"

# Wait a bit for BFF to start
Start-Sleep -Seconds 5

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

For Linux/Mac, create `start-all.sh`:

```bash
#!/bin/bash
# Start Core
cd core && mvn spring-boot:run &
sleep 10

# Start BFF
cd ../bff && npm run dev &
sleep 5

# Start Frontend
cd ../frontend && npm run dev
```

## Verification

Once all services are running, you can verify:

1. **Core Health:** http://localhost:8080/core/health (should return "OK")
2. **BFF Health:** http://localhost:3001/api/health (should return success with "OK")
3. **Frontend:** http://localhost:5173 (should show login page)

## Notes

- The first time you run the core backend, it will automatically create the database schema and seed data
- If you need to reset the database, drop and recreate it, then restart the core backend
- JWT tokens expire after 2 hours - you'll need to login again
- All three services need to be running for the application to work properly


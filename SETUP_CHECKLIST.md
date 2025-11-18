# Setup Checklist - Step by Step Guide

## Current Status Check
✅ Node.js 22.11.0 - **INSTALLED**  
✅ npm 11.5.2 - **INSTALLED**  
❌ Java 17+ - **NEEDS INSTALLATION**  
❌ Maven - **NEEDS INSTALLATION**  
❌ PostgreSQL - **NEEDS INSTALLATION**

---

## STEP 1: Install Java 17 or Higher

### ⚠️ If Chocolatey Gives Permission Errors (RECOMMENDED: Skip to Manual Installation)

**Fix Chocolatey Lock Issue:**
1. Close all PowerShell/terminal windows
2. Open PowerShell as Administrator
3. Run these commands to clean up:
   ```powershell
   # Remove lock files
   Remove-Item "C:\ProgramData\chocolatey\lib\b15f6a0b4887f5441348471dad20e30534334204" -Force -ErrorAction SilentlyContinue
   Remove-Item "C:\ProgramData\chocolatey\lib-bad" -Recurse -Force -ErrorAction SilentlyContinue
   ```
4. Try installation again: `choco install temurin17 -y`

**OR** (Easier): Use Manual Installation below ⬇️

### Option A: Manual Installation (RECOMMENDED - Most Reliable)
1. **Download Java 17:**
   - Go to: https://adoptium.net/temurin/releases/
   - Select:
     - Version: **17 (LTS)**
     - Operating System: **Windows**
     - Architecture: **x64**
     - Package Type: **JDK**
   - Click "Latest Release" and download the `.msi` installer

2. **Install Java:**
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - **Important:** Check "Add to PATH" option if available
   - Complete the installation

3. **Verify Installation:**
   - Close and reopen PowerShell/terminal
   - Run: `java -version`
   - Should show: `openjdk version "17.x.x"` or similar

4. **If Java is not found:**
   - Find Java installation path (usually `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot\bin`)
   - Add to PATH:
     - Press `Win + X` → System → Advanced system settings
     - Click "Environment Variables"
     - Under "System variables", find "Path" and click "Edit"
     - Click "New" and add: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot\bin`
     - Click OK on all dialogs
     - Restart terminal

### Option B: Using Chocolatey (If Manual Doesn't Work)
1. Open PowerShell as Administrator
2. Run: `choco install temurin17 -y`
3. Verify: `java -version`

**After installation, close and reopen your terminal/PowerShell**

---

## STEP 2: Install Maven

### Option A: Using Chocolatey
1. Open PowerShell as Administrator
2. Run: `choco install maven`
3. Verify: `mvn -version`

### Option B: Manual Installation
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to a folder (e.g., `C:\Program Files\Apache\maven`)
3. Add `C:\Program Files\Apache\maven\bin` to your PATH environment variable
4. Verify: `mvn -version`

**After installation, close and reopen your terminal/PowerShell**

---

## STEP 3: Install PostgreSQL

### Option A: Using Chocolatey
1. Open PowerShell as Administrator
2. Run: `choco install postgresql`
3. Note the password you set during installation (default user is `postgres`)

### Option B: Manual Installation
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. **IMPORTANT:** Remember the password you set for the `postgres` user
4. Complete the installation
5. PostgreSQL should start automatically as a Windows service

### Verify PostgreSQL Installation
1. Open a new terminal
2. Try: `psql -U postgres` (you'll be prompted for password)
3. Or check if the service is running in Windows Services

---

## STEP 4: Create PostgreSQL Database

1. Open a terminal/PowerShell
2. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```
   (Enter your PostgreSQL password when prompted)

3. Create the database:
   ```sql
   CREATE DATABASE scotia_budget;
   ```

4. Exit PostgreSQL:
   ```sql
   \q
   ```

**Alternative:** If `psql` is not in your PATH, use pgAdmin (installed with PostgreSQL):
- Open pgAdmin
- Connect to your PostgreSQL server
- Right-click "Databases" → "Create" → "Database"
- Name it: `scotia_budget`

---

## STEP 5: Configure Database Connection

1. Open the file: `core/src/main/resources/application.properties`
2. Update the database credentials if needed:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/scotia_budget
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_POSTGRES_PASSWORD
   ```
   Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation.

---

## STEP 6: Create BFF Environment File

1. Navigate to the `bff` directory
2. Create a new file named `.env` (no extension)
3. Add the following content:
   ```env
   PORT=3001
   CORE_URL=http://localhost:8080
   JWT_SECRET=your-secret-key-change-in-production
   ```

**Note:** You can change `JWT_SECRET` to any random string for security.

---

## STEP 7: Install Dependencies

### Install BFF Dependencies
1. Open a terminal
2. Navigate to the bff directory:
   ```bash
   cd bff
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Install Frontend Dependencies
1. Open a **new terminal**
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## STEP 8: Start the Application

You'll need **3 separate terminals** running simultaneously:

### Terminal 1: Core Backend (Spring Boot)
```bash
cd core
mvn clean install
mvn spring-boot:run
```
Wait until you see: "Started CoreApplication" (this may take 1-2 minutes on first run)

**The core backend will:**
- Create all database tables automatically
- Seed the database with demo data
- Start on http://localhost:8080

### Terminal 2: BFF (Node/Express)
```bash
cd bff
npm run dev
```
Wait until you see the server is running on port 3001

### Terminal 3: Frontend (React)
```bash
cd frontend
npm run dev
```
Wait until you see the Vite dev server is running (usually on port 5173)

---

## STEP 9: Verify Everything is Working

1. **Check Core Backend:**
   - Open browser: http://localhost:8080/core/health
   - Should return: `"OK"`

2. **Check BFF:**
   - Open browser: http://localhost:3001/api/health
   - Should return a success response with "OK"

3. **Check Frontend:**
   - Open browser: http://localhost:5173
   - Should show the login page

---

## STEP 10: Test the Application

1. Go to http://localhost:5173
2. **Login with demo credentials:**
   - Email: `demo@example.com`
   - Password: `Demo123!`

3. **Or create a new account** using the Register page

4. **Admin access:**
   - Email: `admin@example.com`
   - Password: `Admin123!`

---

## Troubleshooting

### Java/Maven Issues
- Make sure Java is in your PATH: `echo $env:PATH`
- Restart terminal after installing Java/Maven
- Verify: `java -version` and `mvn -version`

### PostgreSQL Issues
- Check if PostgreSQL service is running: Windows Services → PostgreSQL
- Verify database exists: `psql -U postgres -l` (should list `scotia_budget`)
- Check connection: Update password in `application.properties`

### Port Already in Use
- **Port 8080 (Core):** Change in `core/src/main/resources/application.properties`: `server.port=8081`
- **Port 3001 (BFF):** Change in `bff/.env`: `PORT=3002`
- **Port 5173 (Frontend):** Vite will auto-use next available port

### Database Connection Errors
- Ensure PostgreSQL is running
- Verify database name is `scotia_budget`
- Check username/password in `application.properties`
- Make sure database was created successfully

---

## Quick Start Script (Optional)

Once everything is set up, you can use the PowerShell script to start all services:

1. Create `start-all.ps1` in the project root (already documented in SETUP.md)
2. Run: `.\start-all.ps1`

---

## Next Steps After Setup

Once everything is running:
- Explore the Dashboard
- Add accounts and transactions
- Create budgets and goals
- Test all features as documented in SETUP.md


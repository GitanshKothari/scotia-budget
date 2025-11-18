# Scotia Budget App Specification

This document is for an AI coding agent.

Goal  
Build a full stack budgeting web application inspired by Scotiabank online banking.

Main focus  
A polished main application  
Authentication can be simple but functional.

Stack  
Single git repository with three subprojects  

* frontend  React plus TypeScript plus Tailwind CSS  
* bff  Node plus Express plus TypeScript  
* core  Spring Boot plus Java plus PostgreSQL

Data flow  

* React frontend calls BFF endpoints under `/api`  
* BFF calls Spring Boot endpoints under `/core`  
* Spring Boot uses PostgreSQL for persistent data


## 1 Repository structure

Create a single git repository with this structure

* plan.md  
* frontend  
* bff  
* core  
* README.md  

Each subfolder is an independent project.

### 1 point 1 Frontend project

* Tech  
  * React with TypeScript  
  * Vite for bundling and dev server  
  * Tailwind CSS for styling  
  * React Router for routing  
  * Axios for HTTP requests  
  * Recharts for charts  

* Entry point  
  * `frontend/src/main.tsx`  

* Main app component  
  * `frontend/src/App.tsx`  

* Top level folders inside `frontend/src`  
  * `components`  
  * `pages`  
  * `layouts`  
  * `hooks`  
  * `types`  
  * `lib` for helpers  
  * `context`  

### 1 point 2 BFF project

* Tech  
  * Node 20  
  * TypeScript  
  * Express  
  * Axios for calling the core backend  
  * jsonwebtoken for JWT  
  * dotenv for configuration  
  * cors and morgan for CORS and logging  

* Entry point  
  * `bff/src/index.ts`  

* Folders  
  * `bff/src/routes`  
  * `bff/src/controllers`  
  * `bff/src/services`  
  * `bff/src/middleware`  
  * `bff/src/types`  
  * `bff/src/utils`  

### 1 point 3 Core project

* Tech  
  * Spring Boot 3  
  * Java 17  
  * Maven  
  * Spring Web  
  * Spring Data JPA  
  * PostgreSQL driver  
  * Lombok  

* Entry point  
  * `core/src/main/java/com/scotia/core/CoreApplication.java`  

* Packages under `com.scotia.core`  

  * `entity`  
  * `repository`  
  * `service`  
  * `controller`  
  * `dto`  
  * `config`  
  * `seed`  


## 2 Domain model

Use PostgreSQL as the single database. Spring Boot manages schema and persistence with JPA.

### 2 point 1 Entities and fields

Implement the following entities.

All identifiers use UUID type in the database and Java.

#### User

Fields  

* id  
* email unique  
* passwordHash  
* name  
* role enum values USER and ADMIN  
* preferredCurrency string default `"CAD"`  
* themePreference enum values LIGHT and DARK and SYSTEM  
* createdAt timestamp  
* updatedAt timestamp  

#### Account

Fields  

* id  
* userId foreign key to User  
* name string  
* type enum values CHEQUING and SAVINGS and CREDIT_CARD  
* currentBalance decimal  
* createdAt timestamp  
* updatedAt timestamp  

#### Category

Fields  

* id  
* userId nullable foreign key  
  * null means default category for all users  
  * non null means user specific custom category  
* name string  
* type enum values EXPENSE and INCOME  
* isDefault boolean  
* createdAt timestamp  
* updatedAt timestamp  

Seed default categories with userId null for  

* Groceries  
* Transport  
* Bills  
* Shopping  
* Entertainment  
* Rent  
* Salary  
* Misc  

#### Budget

Represents a monthly limit per category. Budget limits remain static until changed by the user.

Fields  

* id  
* userId  
* categoryId  
* monthlyLimit decimal  
* isActive boolean  
* createdAt timestamp  
* updatedAt timestamp  

#### Transaction

Fields  

* id  
* userId  
* accountId  
* categoryId  
* type enum values DEBIT and CREDIT  
* amount decimal  
* description string  
* merchantName string  
* date timestamp  
* createdAt timestamp  
* updatedAt timestamp  

When a transaction is created and categoryId is null, core applies categorization rules based on merchantName or description.

#### SavingsGoal

Fields  

* id  
* userId  
* name string  
* targetAmount decimal  
* currentAmount decimal  
* targetDate nullable date  
* status enum values ACTIVE and COMPLETED  
* createdAt timestamp  
* updatedAt timestamp  

#### CategorizationRule

Fields  

* id  
* userId nullable  
* keyword string  
* categoryId  
* createdAt timestamp  
* updatedAt timestamp  

Simple matching rule  

If new transaction has merchantName or description containing keyword substring case insensitive then set categoryId to this rule categoryId if no categoryId provided by request.

#### Notification

Fields  

* id  
* userId  
* type enum values BUDGET_THRESHOLD and GOAL_REACHED and GENERAL  
* title string  
* message string  
* createdAt timestamp  
* read boolean  
* dataJson text nullable for extra structured data  

Notification generation  

* When category monthly spending crosses 80 percent of its budget for first time that month generate BUDGET_THRESHOLD notification.  
* When a goal reaches or exceeds targetAmount and was ACTIVE mark it as COMPLETED and generate GOAL_REACHED notification.  


## 3 Backend APIs

There are two API layers.

* Core backend under `/core` managed by Spring Boot  
* BFF under `/api` managed by Node

Frontend calls only the BFF.

### 3 point 1 Core backend API specification

Base path for all endpoints in core is `/core`.

All endpoints accept and return JSON.

Core does not handle JWT. It trusts BFF and uses a custom header `X-User-Id` that BFF must send for user scoped operations.

If `X-User-Id` is missing for any user scoped endpoint, core returns HTTP 401 with JSON error.

All successful responses use structure  

```json
{
  "success": true,
  "data": ...
}
All error responses use

json
Copy code
{
  "success": false,
  "message": "Description of error",
  "code": "ERROR_CODE"
}
3 point 1 point 1 Auth endpoints
POST /core/auth/register

Request body

json
Copy code
{
  "email": "user@example.com",
  "password": "plain password",
  "name": "User Name"
}
Behavior

Validate email not already used.

Hash password using BCrypt.

Create a new User with role USER, default currency CAD, themePreference SYSTEM.

Return created user without passwordHash.

Response

json
Copy code
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "preferredCurrency": "CAD",
    "themePreference": "SYSTEM"
  }
}
POST /core/auth/verify

Used by BFF to validate credentials.

Request body

json
Copy code
{
  "email": "user@example.com",
  "password": "plain password"
}
Behavior

Lookup user by email.

Compare password with BCrypt hash.

If invalid return 401 with error.

If valid return user object without passwordHash.

Response

json
Copy code
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "preferredCurrency": "CAD",
    "themePreference": "SYSTEM"
  }
}
3 point 1 point 2 User endpoints
GET /core/users/{id}

Behavior

Return user by id without passwordHash.

PATCH /core/users/{id}

Request body fields are optional

json
Copy code
{
  "name": "New Name",
  "preferredCurrency": "USD",
  "themePreference": "DARK"
}
Behavior

Only update provided fields.

themePreference must be one of LIGHT and DARK and SYSTEM.

3 point 1 point 3 Accounts endpoints
All requests require X-User-Id header.

GET /core/accounts

Reads userId from header.

Returns all accounts for that user.

Response data is an array of accounts.

POST /core/accounts

Request body

json
Copy code
{
  "name": "Everyday Chequing",
  "type": "CHEQUING",
  "currentBalance": 1200.5
}
Behavior

Create account with given name, type, balance and userId from header.

PATCH /core/accounts/{id}

Body can update name, type, currentBalance.

DELETE /core/accounts/{id}

Deletes account if it belongs to user.

3 point 1 point 4 Categories endpoints
GET /core/categories

Reads userId from header.

Returns merged list of default categories and user custom categories.

POST /core/categories

Request body

json
Copy code
{
  "name": "Pets",
  "type": "EXPENSE"
}
Behavior

Create user specific category for that userId.

PATCH /core/categories/{id}

DELETE /core/categories/{id}

Safeguard

Do not allow deleting default categories with userId null.

3 point 1 point 5 Budgets endpoints
GET /core/budgets

Returns all budgets for userId from header.

POST /core/budgets

Request body

json
Copy code
{
  "categoryId": "uuid",
  "monthlyLimit": 400.0
}
Behavior

Create a budget associated with this user and category.

PATCH /core/budgets/{id}

Request body can update monthlyLimit and isActive.

DELETE /core/budgets/{id}

3 point 1 point 6 Transactions endpoints
GET /core/transactions

Query parameters all optional

accountId

categoryId

startDate ISO date string

endDate ISO date string

minAmount

maxAmount

search free text

Behavior

Filter transactions belonging to userId from header using given filters.

search should match description or merchantName case insensitive.

POST /core/transactions

Request body

json
Copy code
{
  "accountId": "uuid",
  "categoryId": null,
  "type": "DEBIT",
  "amount": 45.5,
  "description": "Friday dinner",
  "merchantName": "Uber Eats",
  "date": "2025-11-10T18:30:00Z"
}
Behavior

Validate account belongs to user.

If categoryId is null, apply categorization rules using merchantName or description.

Save transaction.

Update account currentBalance accordingly

For DEBIT, subtract amount.

For CREDIT, add amount.

After saving, recompute monthly totals and generate notifications if thresholds reached.

PATCH /core/transactions/{id}

Allow editing categoryId, description, merchantName, date.

When categoryId changes, adjust related spending calculations on next dashboard query.

DELETE /core/transactions/{id}

Delete transaction and adjust account balance reverse of how it was applied.

3 point 1 point 7 Goals endpoints
GET /core/goals

POST /core/goals

Body

json
Copy code
{
  "name": "New laptop",
  "targetAmount": 2000,
  "currentAmount": 500,
  "targetDate": "2026-01-01"
}
PATCH /core/goals/{id}

Allow updates to name, targetAmount, currentAmount, targetDate.

When currentAmount reaches or exceeds targetAmount and status is ACTIVE

Update status to COMPLETED

Create GOAL_REACHED notification

DELETE /core/goals/{id}

3 point 1 point 8 Categorization rules endpoints
GET /core/rules

POST /core/rules

Body

json
Copy code
{
  "keyword": "Uber",
  "categoryId": "uuid"
}
DELETE /core/rules/{id}

3 point 1 point 9 Notifications endpoints
GET /core/notifications

Query param unreadOnly default false.

POST /core/notifications/markRead

Body

json
Copy code
{
  "ids": ["id1", "id2"]
}
3 point 1 point 10 Dashboard summary endpoint
GET /core/dashboard/summary

Query param month required format YYYYMM.

Behavior

Compute for userId from header

accounts list with id name type and currentBalance

spending by category for given month

monthly spending per day

budgets with limit and spent amount

safe to spend

Safe to spend

For all budgets with type EXPENSE

Sum budget limits

Sum spending in those categories for that month

Safe to spend equals totalBudget minus totalSpent but not below zero

Response data

json
Copy code
{
  "accounts": [
    { "id": "uuid", "name": "Everyday Chequing", "type": "CHEQUING", "currentBalance": 1234.56 }
  ],
  "spendingByCategory": [
    { "categoryId": "uuid", "categoryName": "Groceries", "amount": 320.5, "budgetLimit": 400.0 }
  ],
  "dailySpending": [
    { "date": "2025-11-01", "amount": 45.5 }
  ],
  "budgets": [
    { "categoryId": "uuid", "categoryName": "Groceries", "monthlyLimit": 400.0, "spent": 320.5 }
  ],
  "safeToSpend": 250.0,
  "goals": [
    { "id": "uuid", "name": "New laptop", "targetAmount": 2000, "currentAmount": 900, "progressPercent": 45.0, "status": "ACTIVE" }
  ]
}
3 point 2 BFF API specification
Base path /api.

BFF handles

JWT for client

Input validation for basic fields

Mapping to core API

Response shaping

CSV export generation

JWT details

Algorithm HS256

Secret from env JWT_SECRET

Payload fields

sub user id

email

role

exp expiration set to two hours

Token storage strategy

BFF returns token in JSON and frontend stores it in localStorage.

All BFF responses for success use

json
Copy code
{
  "success": true,
  "data": ...
}
Error responses

json
Copy code
{
  "success": false,
  "message": "Error message"
}
3 point 2 point 1 Auth endpoints
POST /api/auth/register

Forwards to POST /core/auth/register with same body.

Returns user object from core.

POST /api/auth/login

Body

json
Copy code
{
  "email": "user@example.com",
  "password": "plain password"
}
Behavior

Send same body to POST /core/auth/verify.

On success core returns user object.

BFF signs JWT with user id email and role.

Response

json
Copy code
{
  "success": true,
  "data": {
    "token": "jwt string",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "USER",
      "preferredCurrency": "CAD",
      "themePreference": "SYSTEM"
    }
  }
}
GET /api/auth/me

Extracts JWT from Authorization header.

Returns current user payload from token plus a fresh fetch to core GET /core/users/{id}.

3 point 2 point 2 Auth middleware
Implement authMiddleware

Reads Authorization header format Bearer token.

Verifies token.

On success attaches req.user object with id email and role.

On failure returns 401.

For all protected routes

Validate JWT

When calling core endpoints forward user id via X-User-Id header.

3 point 2 point 3 Accounts categories budgets transactions goals notifications
For each resource create corresponding BFF routes under /api that

Use authMiddleware.

Call matching core endpoint.

Pass query params and bodies.

Forward responses unchanged inside success true data.

For example

GET /api/accounts

Calls GET /core/accounts with X-User-Id header.

POST /api/transactions

Basic validation

amount must be positive

type must be DEBIT or CREDIT

Calls POST /core/transactions.

3 point 2 point 4 CSV export endpoints
GET /api/transactions/exportCsv

Query params

month format YYYYMM optional

If present filter to that month.

Behavior

Call GET /core/transactions with appropriate date filters.

Generate CSV with header

date,accountName,categoryName,type,amount,description,merchantName

Account and category names must be resolved by calling

GET /core/accounts

GET /core/categories

Return CSV as text/csv content type.

GET /api/report/monthlyCsv

Uses GET /core/dashboard/summary for given month.

Generate a CSV with per category totals and budget.

Columns

categoryName,spent,monthlyLimit,remaining,status

Status is one of

UNDER for spent less than 80 percent of limit

CLOSE for spent between 80 percent and less than 100 percent

OVER for spent at least 100 percent of limit

3 point 2 point 5 Dashboard endpoint
GET /api/dashboard

Query param month with fallback to current month.

Calls GET /core/dashboard/summary.

Returns data as is.

4 Frontend specification
Frontend uses React plus TypeScript plus Tailwind.

4 point 1 Global layout
Create a main layout component layouts/MainLayout.tsx.

Structure

Left vertical sidebar for navigation

Top header for user info and notifications and theme toggle

Main content area scrollable

Sidebar contents

Logo area at top with simple text logo such as Scotia Budget

Navigation links

Dashboard

Accounts

Transactions

Budgets

Goals

Settings

Admin only if user role is ADMIN

Header contents

Page title passed from each page

Theme toggle switch

Notifications bell icon with badge for unread notifications count

User avatar showing initials and dropdown with

Profile link to settings page

Logout

Color scheme

Use colors inspired by Scotiabank

Primary red #ec111a or similar

Accent light red for buttons hover states

Light background mode

Background near white

Card background white

Text dark gray

Dark mode

Background deep gray

Card background near black

Red used as accents

Use Tailwind configuration to define custom color palette

primary for red

bg for backgrounds

Typography

Use system sans or Inter and apply consistently.

4 point 2 Routing
Use React Router.

Define routes

/login

/register

/dashboard

/accounts

/transactions

/budgets

/goals

/settings

/admin

Implement a ProtectedRoute wrapper that

Reads auth context

Redirects to /login if user not authenticated.

All main routes except login and register are inside MainLayout.

4 point 3 Auth context
Create context/AuthContext.tsx.

Responsibilities

Hold user object and token string.

On login set state and store token and user in localStorage.

On app load read from localStorage and verify token shape.

Provide login and logout functions used by pages.

4 point 4 Theme context
Create context/ThemeContext.tsx.

Responsibilities

Store theme state 'light' or 'dark'.

Read and persist theme in localStorage.

Apply theme class on root element for Tailwind theming.

4 point 5 HTTP client
Create lib/apiClient.ts.

Configure Axios instance

Base URL empty since Vite dev server uses proxy to BFF /api.

Automatically attach JWT from auth context in Authorization header when available.

Handle responses with success flag and error messages.

4 point 6 Pages
4 point 6 point 1 Login page
File pages/LoginPage.tsx.

UI

Centered card with email and password fields.

Submit button using primary red.

Behavior

On submit call POST /api/auth/login.

On success store token and user in AuthContext and redirect to /dashboard.

4 point 6 point 2 Register page
File pages/RegisterPage.tsx.

Same style as login.

Inputs

name

email

password

confirm password

On submit

Call POST /api/auth/register.

Then auto login by calling login endpoint or redirect to login.

4 point 6 point 3 Dashboard page
File pages/DashboardPage.tsx.

UI sections

Month selector at top right

simple select for current month and previous two months

Row of account cards showing name type and balance

Pie chart for spending by category using Recharts

Line chart for daily spending using Recharts

Budget overview list with progress bars per category

Savings goals list with progress per goal

Data source

Call GET /api/dashboard?month=YYYYMM.

For progress bars

For each budget

compute spentPercent equals spent divided by monthlyLimit times one hundred

set bar color based on UNDER CLOSE OVER status logic in BFF or computed directly.

4 point 6 point 4 Accounts page
File pages/AccountsPage.tsx.

Layout

Table of existing accounts

columns name type currentBalance

Button to add new account

opens modal form

Form fields

name

type select

initial balance

Calls

GET /api/accounts on load.

POST /api/accounts to create.

PATCH /api/accounts/{id} for editing.

DELETE /api/accounts/{id} for delete.

4 point 6 point 5 Transactions page
File pages/TransactionsPage.tsx.

Layout

Filter bar at top

account select

category select

date range pickers start and end

min and max amount inputs

search input for description and merchantName

Button to add transaction

Export CSV button

Table columns

date

account name

category name

description

merchantName

type

amount with red for debits and green for credits

Behavior

Load accounts and categories for filters.

On filter change reload transactions calling BFF.

Add transaction form uses modal with fields from transaction spec.

Calls

GET /api/transactions with filters.

POST /api/transactions.

PATCH /api/transactions/{id} for edit if implemented.

DELETE /api/transactions/{id} optionally.

GET /api/transactions/exportCsv when export button clicked.

Trigger browser download.

4 point 6 point 6 Budgets page
File pages/BudgetsPage.tsx.

Layout

Table of budgets with columns

category name

monthlyLimit

spent for current month

remaining

status

Button to add or edit budgets

Behavior

Use GET /api/budgets to fetch budgets.

Use GET /api/dashboard?month=current or a dedicated endpoint to get current monthly spending per category.

Add budget modal with category select and limit.

4 point 6 point 7 Goals page
File pages/GoalsPage.tsx.

Layout

Card list of goals with progress bars.

Fields shown

name

targetAmount

currentAmount

progressPercent

targetDate

Interactions

Add goal button

Edit currentAmount to simulate contributions.

Calls

GET /api/goals

POST /api/goals

PATCH /api/goals/{id}

4 point 6 point 8 Settings page
File pages/SettingsPage.tsx.

Sections

Profile

name

preferredCurrency

Theme preference

radio buttons or select for theme preference

Category management

list of default categories read only

list of custom categories with add and delete

Calls

GET /api/auth/me for initial user data.

PATCH /api/me for updates.

GET /api/categories and POST /api/categories and DELETE /api/categories/{id}.

4 point 6 point 9 Admin page
File pages/AdminPage.tsx.

Only visible for role ADMIN.

Layout

Table of users

name

email

createdAt

role

Optional

For each user show summary counts of accounts and transactions and budgets and goals by calling appropriate admin endpoint in BFF.

5 Data seeding
Implement a Spring Boot data seeder class under com.scotia.core.seed.

On application startup

Create an ADMIN user with known credentials

email admin@example.com

password Admin123!

Create one USER demo user

email demo@example.com

password Demo123!

Create for demo user

two accounts

default categories if not present

several budgets

multiple transactions across multiple dates in current and previous month

one or two active goals

These seed data make the dashboard look interesting for demonstration.

6 Implementation order
The AI should implement in this sequence

Create three projects with basic health endpoints

Spring Boot /core/health returning plain text

BFF /api/health calling /core/health

React app displaying result of /api/health

Implement domain entities and repositories in core

Implement auth register and verify in core

Implement BFF auth endpoints with JWT

Implement React auth context and login and register pages

Implement accounts and transactions endpoints in core and BFF

Implement dashboard summary in core and BFF

Implement frontend layout and dashboard page using summary endpoint

Implement remaining pages

accounts

transactions with filters and CSV export

budgets

goals

settings

Add notifications logic in core and display in frontend header

Apply Tailwind styling and Scotiabank inspired colors and dark mode

Ensure seed data exist and verify full flow using demo user credentials

7 Constraints for the AI agent
Follow this specification exactly.

Name routes and files as described.

Use TypeScript in frontend and BFF.

Use Tailwind CSS and Recharts.

Keep authentication simple as defined and focus strongly on correct and polished behavior for the main dashboard and budgeting features.
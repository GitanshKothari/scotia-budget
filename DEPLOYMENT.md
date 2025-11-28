# Deployment Guide & Troubleshooting

## Environment Variables

### Frontend (Vercel/Static Hosting)

**Required:**
- `VITE_API_URL` - The URL of your BFF service (e.g., `https://your-bff-service.herokuapp.com` or `https://your-bff-service.railway.app`)

**Note:** Vite requires the `VITE_` prefix for environment variables to be exposed to the client-side code.

**How to set in Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `VITE_API_URL` with your BFF URL

---

### BFF (Node.js/Express)

**Required:**
- `PORT` - Port number (defaults to 3001 if not set)
- `CORE_URL` - URL of your Core service (e.g., `https://your-core-service.herokuapp.com` or `https://your-core-service.railway.app`)
- `JWT_SECRET` - Secret key for JWT token signing (MUST be set in production, use a strong random string)

**Example:**
```bash
PORT=3001
CORE_URL=https://your-core-service.railway.app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**How to check if BFF is working:**
- Health endpoint: `GET https://your-bff-url/api/health` ⚠️ **Note: Use `/api/health`, NOT `/core/health`**
- Should return: `{ success: true, data: "Core service is healthy" }`
- If you get `{ success: false, message: "..." }`, the BFF is running but can't reach the Core service

---

### Core (Spring Boot/Java)

**Required:**
- `PORT` - Port number (defaults to 8080 if not set)
- `DATABASE_URL` - Full PostgreSQL connection string (e.g., `jdbc:postgresql://host:port/database?sslmode=require`)
- `DATABASE_USERNAME` - PostgreSQL username
- `DATABASE_PASSWORD` - PostgreSQL password

**Example:**
```bash
PORT=8080
DATABASE_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
```

**Note:** Some platforms (like Heroku) provide `DATABASE_URL` as a single variable. Spring Boot can use it directly if it's in the format: `jdbc:postgresql://...`

**How to check if Core is working:**
- Health endpoint: `GET https://your-core-url/core/health`
- Should return: `"Core service is healthy"`

---

## Debugging Deployment Issues

### Step 1: Check Service Health Endpoints

Test each service independently:

1. **Core Service:**
   ```bash
   curl https://your-core-url/core/health
   ```
   Expected: `"Core service is healthy"`

2. **BFF Service:**
   ```bash
   curl https://your-bff-url/api/health
   ```
   Expected: `{ "success": true, "data": "Core service is healthy" }`

3. **Frontend:**
   - Open browser console (F12)
   - Check Network tab for API calls
   - Look for CORS errors or 404/500 errors

### Step 2: Check Logs

**For each service, check deployment logs:**

- **Vercel (Frontend):** Dashboard → Project → Deployments → Click deployment → View Function Logs
- **Railway/Heroku (BFF):** View logs in dashboard or use CLI:
  ```bash
  # Railway
  railway logs
  
  # Heroku
  heroku logs --tail --app your-app-name
  ```

**What to look for:**
- Connection errors (can't reach database or other services)
- Missing environment variables
- Port binding issues
- Database connection failures

### Step 3: Verify Environment Variables

**Common Issues:**
1. **Missing `VITE_API_URL` in Frontend:**
   - Symptom: Frontend makes requests to `http://localhost:3001` (wrong URL)
   - Fix: Set `VITE_API_URL` in Vercel environment variables
   - **Important:** Rebuild after adding environment variables

2. **Missing `CORE_URL` in BFF:**
   - Symptom: BFF health check fails, all API calls return 500
   - Fix: Set `CORE_URL` to your Core service URL

3. **Missing `JWT_SECRET` in BFF:**
   - Symptom: Authentication fails, tokens not working
   - Fix: Set a strong `JWT_SECRET` (use a random string generator)

4. **Wrong Database Credentials in Core:**
   - Symptom: Core service crashes on startup, database connection errors
   - Fix: Verify `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

### Step 4: Check CORS Configuration

**If you see CORS errors in browser console:**

The BFF has `app.use(cors())` which should allow all origins. If you need to restrict it:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  credentials: true
}));
```

### Step 5: Verify Service URLs

**Common mistakes:**
- Using `http://` instead of `https://` in production
- Using `localhost` URLs in environment variables
- Missing trailing slashes or incorrect paths

**Correct format:**
- Frontend → BFF: `https://your-bff-service.railway.app` (no trailing slash)
- BFF → Core: `https://your-core-service.railway.app` (no trailing slash)

---

## Quick Debugging Checklist

- [ ] Core service health endpoint responds
- [ ] BFF service health endpoint responds
- [ ] Frontend can load (check browser console)
- [ ] All environment variables are set correctly
- [ ] No CORS errors in browser console
- [ ] Database connection is working (check Core logs)
- [ ] JWT_SECRET is set in BFF
- [ ] VITE_API_URL is set in Frontend (and rebuild was triggered)
- [ ] All services are using HTTPS URLs (not localhost)

---

## Platform-Specific Notes

### Vercel (Frontend)
- Environment variables must be set in project settings
- **Important:** After adding `VITE_API_URL`, trigger a new deployment
- Build logs show if environment variables are missing

### Railway
- Environment variables can be set in service settings
- Check "Variables" tab for each service
- Logs are available in the "Deployments" tab

### Heroku
- Use `heroku config:set KEY=value --app app-name`
- View logs: `heroku logs --tail --app app-name`
- Check config vars: `heroku config --app app-name`

---

## Common Error Messages & Solutions

### "Cannot GET /core/health" on BFF
- **Cause:** You're trying to access a Core endpoint directly on the BFF
- **Fix:** Use `/api/health` instead of `/core/health` on the BFF
- **Explanation:** BFF routes are under `/api/*`, Core routes are under `/core/*` (on the Core service)

### "Request failed with status code 429"
- **Cause:** Rate limiting or Core service is not responding properly
- **Fix:** 
  1. Check if Core service is running and accessible
  2. Verify `CORE_URL` environment variable in BFF is correct
  3. Check Core service logs for errors
  4. On Render free tier, services may spin down after inactivity

### "Failed to connect to core service"
- **Cause:** BFF can't reach Core service
- **Fix:** Check `CORE_URL` environment variable in BFF

### "Network Error" or CORS errors
- **Cause:** Frontend can't reach BFF or CORS misconfiguration
- **Fix:** Check `VITE_API_URL` and BFF CORS settings

### "Database connection failed"
- **Cause:** Wrong database credentials or network issue
- **Fix:** Verify `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` in Core service

### "JWT verification failed"
- **Cause:** Missing or wrong `JWT_SECRET`
- **Fix:** Set `JWT_SECRET` in BFF (must be the same if you have multiple BFF instances)

### Frontend shows "localhost:3001" in network requests
- **Cause:** `VITE_API_URL` not set or not rebuilt
- **Fix:** Set `VITE_API_URL` and trigger a new deployment

---

## Testing the Full Stack

1. **Test Core:**
   ```bash
   curl https://your-core-url/core/health
   ```

2. **Test BFF:**
   ```bash
   curl https://your-bff-url/api/health
   ```

3. **Test Frontend:**
   - Open in browser
   - Open DevTools → Network tab
   - Try to login or make any API call
   - Check if requests go to correct BFF URL
   - Check response status codes

---

## Need More Help?

If services are still crashing:
1. Share the logs from each service
2. Share the environment variables (without sensitive values)
3. Share the error messages from browser console
4. Check if all services are actually deployed and running


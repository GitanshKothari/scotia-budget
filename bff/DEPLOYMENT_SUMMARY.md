# BFF Deployment Summary

## Quick Start

To deploy the BFF layer to Render, you need to:

### 1. Files Created
- ✅ `Dockerfile` - Multi-stage Docker build for Node.js/TypeScript
- ✅ `.dockerignore` - Excludes unnecessary files from Docker build
- ✅ `RENDER_DEPLOYMENT.md` - Complete deployment guide

### 2. Key Changes Needed

#### Environment Variables (Set in Render Dashboard)
```
CORE_URL=https://scotia-budget.onrender.com
JWT_SECRET=<generate-a-long-random-secret>
PORT=3001
```

**Important**: 
- Replace `https://scotia-budget.onrender.com` with your actual core backend URL
- Generate a secure JWT_SECRET using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 3. Deployment Steps

1. **Create Web Service on Render**
   - Environment: Docker
   - Root Directory: `bff`
   - Dockerfile Path: `Dockerfile`

2. **Set Environment Variables** (see above)

3. **Deploy**

4. **Verify**
   - Health check: `https://your-bff-service.onrender.com/api/health`
   - Test connection to core backend

### 4. What Changed in Code

**No code changes needed!** The BFF already uses environment variables:
- `CORE_URL` in `src/services/coreService.ts`
- `CORE_URL` in `src/index.ts`
- `CORE_URL` in `src/routes/healthRoutes.ts`
- `PORT` in `src/index.ts`
- `JWT_SECRET` in `src/middleware/authMiddleware.ts`

All these will automatically use the values you set in Render's environment variables.

### 5. After Deployment

Once the BFF is deployed, you'll need to:
1. Update frontend to point to the deployed BFF URL
2. Update CORS settings if needed (currently allows all origins)
3. Test all API endpoints

## Next Steps

See `RENDER_DEPLOYMENT.md` for detailed instructions.


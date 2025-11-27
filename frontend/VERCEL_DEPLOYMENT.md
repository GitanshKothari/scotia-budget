# Deploying Frontend to Vercel

This guide explains how to deploy the FinTracker frontend to Vercel.

## Prerequisites

1. A Vercel account
2. Your code pushed to GitHub/GitLab/Bitbucket
3. Your backend services deployed (BFF and Core)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Select the repository containing your project

### 2. Configure Project Settings

In the project configuration:

- **Framework Preset**: Vite (should auto-detect)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (default, or leave empty to use vercel.json)
- **Output Directory**: `dist` (default, or leave empty to use vercel.json)
- **Install Command**: `npm install` (default)

### 3. Environment Variables

Add the following environment variables in Vercel dashboard:

```
VITE_API_URL=https://your-bff-service.onrender.com
```

Or if your BFF is on a different platform:
```
VITE_API_URL=https://your-bff-domain.com
```

**Note**: The frontend uses relative paths (`/api`) by default. If your BFF is on a different domain, you'll need to update the `apiClient.ts` to use the environment variable.

### 4. Update API Client (if needed)

If your BFF is on a different domain, update `frontend/src/lib/apiClient.ts`:

```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 5. Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Run the build command
   - Deploy to a production URL

### 6. Verify Deployment

- Check the deployment logs for any errors
- Visit the provided URL
- Test the application functionality

## Troubleshooting

### Permission Denied Error

If you see `Permission denied` errors for `tsc`:
- ✅ Fixed: The build script now uses `vite build` directly
- Vite's build process includes TypeScript checking via esbuild, so you'll still catch type errors
- Type checking is separated into `npm run type-check` for local development
- This avoids permission issues with the `tsc` binary on Vercel's build system

### Build Fails

- Check that `Root Directory` is set to `frontend`
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### API Calls Fail

- Verify `VITE_API_URL` environment variable is set correctly
- Check CORS settings on your BFF
- Ensure BFF is accessible from Vercel's servers

### Routing Issues (404 on refresh)

- ✅ Fixed: `vercel.json` includes rewrites to handle client-side routing
- All routes will redirect to `index.html` for React Router

## Custom Domain

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Configure DNS as instructed

## Auto-Deploy

Vercel automatically deploys on:
- Push to the connected branch (usually `main` or `master`)
- Pull requests (creates preview deployments)
- Manual deploy from dashboard

## Preview Deployments

Every pull request gets a preview deployment URL, allowing you to test changes before merging.

## Environment Variables per Environment

You can set different environment variables for:
- Production
- Preview (pull requests)
- Development

Go to Settings → Environment Variables to configure.


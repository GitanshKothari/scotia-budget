# Deploying BFF (Backend for Frontend) to Render

This guide explains how to deploy the Node.js BFF layer to Render.

## Prerequisites

1. A Render account
2. Core backend already deployed (e.g., `https://scotia-budget.onrender.com`)
3. Git repository with your code

## Deployment Steps

### 1. Create a Web Service on Render

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: `scotia-budget-bff` (or your preferred name)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `bff`
   - **Dockerfile Path**: `Dockerfile` (should auto-detect)

### 2. Configure Environment Variables

In the Render dashboard, add these environment variables:

#### Required Variables:
```
CORE_URL=https://scotia-budget.onrender.com
JWT_SECRET=your-secret-jwt-key-here-make-it-long-and-random
PORT=3001
```

**Important Notes:**
- `CORE_URL` should point to your deployed core backend (without trailing slash)
- `JWT_SECRET` should be a long, random string. Generate one using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `PORT` is optional - Render will set this automatically, but you can override if needed

#### Optional Variables:
```
NODE_ENV=production
```

### 3. Deploy

1. Click "Create Web Service"
2. Render will:
   - Build the Docker image
   - Compile TypeScript to JavaScript
   - Start the container
   - Health check will run on `/api/health`

### 4. Verify Deployment

Once deployed, check:
- Service logs for any errors
- Health endpoint: `https://your-bff-service.onrender.com/api/health`
- Should return a health status response

### 5. Test Connection to Core Backend

After deployment, verify the BFF can communicate with the core backend:
- Check BFF logs for successful connections
- Test an API endpoint that requires core backend communication
- Verify CORS is properly configured if accessing from frontend

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CORE_URL` | Yes | URL of deployed core backend | `https://scotia-budget.onrender.com` |
| `JWT_SECRET` | Yes | Secret key for JWT token signing | `your-long-random-secret-key` |
| `PORT` | No | Port for BFF server (Render sets automatically) | `3001` |
| `NODE_ENV` | No | Node environment | `production` |

## Troubleshooting

### Build Fails
- Check Dockerfile is in the `bff/` directory
- Verify Node.js 20 compatibility
- Check build logs for TypeScript compilation errors
- Ensure `package.json` has correct build scripts

### Application Won't Start
- Verify `CORE_URL` is set correctly (no trailing slash)
- Check `JWT_SECRET` is set
- Review application logs in Render dashboard
- Ensure core backend is accessible from Render's network

### Health Check Fails
- Verify port is exposed correctly
- Check if application started successfully
- Review application logs
- Ensure `/api/health` route exists and returns 200

### Cannot Connect to Core Backend
- Verify `CORE_URL` environment variable is correct
- Check core backend is running and accessible
- Test core backend health endpoint directly: `https://scotia-budget.onrender.com/core/health`
- Review BFF logs for connection errors
- Ensure core backend CORS allows requests from BFF domain

### JWT Authentication Issues
- Verify `JWT_SECRET` matches between environments (if sharing tokens)
- Check JWT token generation and verification logic
- Review authentication middleware logs

## Custom Domain (Optional)

1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Configure DNS as instructed

## Auto-Deploy

Render automatically deploys on:
- Push to the connected branch
- Manual deploy from dashboard

## Monitoring

- View logs in real-time from Render dashboard
- Set up alerts for service downtime
- Monitor resource usage
- Check health endpoint regularly

## Next Steps

After deploying the BFF:
1. Update frontend configuration to point to the deployed BFF URL
2. Test all API endpoints
3. Verify authentication flow works end-to-end
4. Update CORS settings if needed

## Example Service URLs

After deployment, your services should be accessible at:
- **Core Backend**: `https://scotia-budget.onrender.com`
- **BFF**: `https://scotia-budget-bff.onrender.com` (or your custom name)
- **Frontend**: (deploy separately, e.g., on Vercel)

## Security Notes

- Never commit `.env` files or `JWT_SECRET` to git
- Use strong, random `JWT_SECRET` values
- Keep environment variables secure in Render dashboard
- Regularly rotate secrets in production


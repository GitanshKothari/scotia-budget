# Deploying Core Backend to Render

This guide explains how to deploy the Core Spring Boot backend to Render.

## Prerequisites

1. A Render account
2. A PostgreSQL database (can be created on Render or use external database)
3. Git repository with your code

## Deployment Steps

### 1. Create a PostgreSQL Database on Render (if needed)

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure your database:
   - Name: `fintracker-db` (or your preferred name)
   - Database: `postgres`
   - User: `postgres`
   - Note the connection details

### 2. Create a Web Service on Render

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: `fintracker-core` (or your preferred name)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `core`
   - **Dockerfile Path**: `Dockerfile` (should auto-detect)

### 3. Configure Environment Variables

In the Render dashboard, add these environment variables:

#### Required Database Variables:
```
DATABASE_URL=jdbc:postgresql://your-db-host:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password
```

**Note**: If using Render's PostgreSQL, you can find the connection string in the database dashboard. Render provides it in the format:
```
postgresql://user:password@host:port/database
```

You'll need to convert it to JDBC format:
```
jdbc:postgresql://host:port/database?sslmode=require&user=user&password=password
```

Or set individual variables:
```
DATABASE_URL=jdbc:postgresql://host:port/database?sslmode=require
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
```

#### Optional Variables:
```
PORT=8080  # Render will set this automatically, but you can override
LOG_LEVEL_SQL=INFO  # Set to INFO or WARN for production
LOG_LEVEL_BINDER=INFO
LOG_LEVEL_JPA=INFO
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will:
   - Build the Docker image
   - Start the container
   - Health check will run on `/core/health`

### 5. Verify Deployment

Once deployed, check:
- Service logs for any errors
- Health endpoint: `https://your-service.onrender.com/core/health`
- Should return "OK"

## Database Connection String Format

If Render provides a connection string like:
```
postgresql://user:password@host:5432/database
```

Convert to JDBC format:
```
jdbc:postgresql://host:5432/database?sslmode=require
```

And set:
- `DATABASE_USERNAME=user`
- `DATABASE_PASSWORD=password`

## Troubleshooting

### Build Fails
- Check Dockerfile is in the `core/` directory
- Verify Java 17 compatibility
- Check build logs for Maven errors

### Application Won't Start
- Verify database connection variables are set correctly
- Check application logs in Render dashboard
- Ensure database is accessible from Render's network

### Health Check Fails
- Verify port 8080 is exposed
- Check if application started successfully
- Review application logs

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


# Vercel Deployment Guide

This guide walks you through deploying the Student Training Portal (frontend + backend) to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Vercel CLI** (optional): `npm install -g vercel`

---

## Part 1: Database Setup

Vercel serverless functions don't support Docker, so you need a hosted PostgreSQL database.

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **Create Database**
3. Select **Postgres**
4. Choose your region and create the database
5. Copy the `DATABASE_URL` (starts with `postgres://default:...`)

### Option B: Neon (Free Tier Available)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (starts with `postgresql://...`)

### Option C: Supabase (Free Tier Available)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)

---

## Part 2: Deploy Backend

### Step 1: Push Code to GitHub

```bash
# Navigate to your project root
cd /home/pred695/Code/QRBasedClassReminder

# Initialize git (if not already done)
git init
git add .
git commit -m "Prepare for Vercel deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Vercel

#### Using Vercel Dashboard (Easiest):

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend/auth-service`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

4. Add Environment Variables (click **Environment Variables**):
   ```
   NODE_ENV=production
   LOG_LEVEL=info
   DATABASE_URL=<your-database-url-from-step-1>
   JWT_ACCESS_SECRET=<generate-32-char-random-string>
   JWT_REFRESH_SECRET=<generate-32-char-random-string>
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   FRONTEND_URL=<will-update-after-frontend-deploy>
   COOKIE_DOMAIN=.vercel.app
   ADMIN_EMAIL=admin@yourcompany.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ADMIN_NAME=System Admin
   ```

   To generate secure secrets, use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Click **Deploy**

6. Once deployed, copy your backend URL (e.g., `https://your-backend.vercel.app`)

#### Using Vercel CLI:

```bash
cd backend/auth-service

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow the prompts to set up your project
```

### Step 3: Run Database Migrations

After backend is deployed:

1. Install Vercel CLI: `npm install -g vercel`
2. Link your project: `cd backend/auth-service && vercel link`
3. Run migration:
   ```bash
   # Pull environment variables
   vercel env pull .env.production

   # Run Prisma migration
   npx prisma migrate deploy --schema=./shared/prisma/schema.prisma

   # Generate Prisma client
   npx prisma generate --schema=./shared/prisma/schema.prisma
   ```

**Alternative**: Use Vercel dashboard's terminal or set up GitHub Actions for migrations.

---

## Part 3: Deploy Frontend

### Step 1: Deploy Frontend to Vercel

#### Using Vercel Dashboard:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same GitHub repository**
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   ```
   VITE_API_BASE_URL=<your-backend-url-from-step-2>
   ```
   Example: `VITE_API_BASE_URL=https://your-backend.vercel.app`

5. Click **Deploy**

6. Once deployed, copy your frontend URL (e.g., `https://your-frontend.vercel.app`)

#### Using Vercel CLI:

```bash
cd frontend

# Set environment variable
echo "VITE_API_BASE_URL=https://your-backend.vercel.app" > .env.production

# Deploy
vercel --prod
```

### Step 2: Update Backend Environment Variables

Now that you have the frontend URL, update the backend:

1. Go to your backend project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Update `FRONTEND_URL` to your frontend URL: `https://your-frontend.vercel.app`
4. Click **Save**
5. Go to **Deployments** → **Redeploy** (3-dot menu on latest deployment)

---

## Part 4: Verification

### Test Your Deployment

1. **Frontend**: Visit `https://your-frontend.vercel.app`
   - Student signup page should load
   - Try creating a signup

2. **Backend**: Visit `https://your-backend.vercel.app/health`
   - Should return health status

3. **Admin Dashboard**: Visit `https://your-frontend.vercel.app/admin`
   - Login with the admin credentials you set
   - Should see all signups

### Troubleshooting

#### Backend Issues:

- **500 errors**: Check Vercel logs (Dashboard → Project → Logs)
- **Database connection errors**: Verify `DATABASE_URL` is correct
- **CORS errors**: Ensure `FRONTEND_URL` is set correctly

#### Frontend Issues:

- **API connection errors**: Verify `VITE_API_BASE_URL` is correct
- **Blank page**: Check browser console for errors
- **404 on routes**: Ensure `vercel.json` rewrites are configured

#### Common Fixes:

```bash
# Check logs
vercel logs <deployment-url>

# Inspect environment variables
vercel env ls

# Redeploy
vercel --prod --force
```

---

## Part 5: Custom Domain (Optional)

### Add Custom Domain

1. Go to your project in Vercel
2. Go to **Settings** → **Domains**
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update DNS records as instructed
5. Update environment variables:
   - Backend: Update `FRONTEND_URL` to your custom domain
   - Frontend: Update `VITE_API_BASE_URL` to your backend custom domain

---

## Part 6: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically deploy both frontend and backend
```

---

## Environment Variables Summary

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `LOG_LEVEL` | Logging level | `info` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://...` |
| `JWT_ACCESS_SECRET` | JWT access token secret (32+ chars) | Generated |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (32+ chars) | Generated |
| `JWT_ACCESS_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |
| `FRONTEND_URL` | Frontend URL | `https://your-frontend.vercel.app` |
| `COOKIE_DOMAIN` | Cookie domain | `.vercel.app` |
| `ADMIN_EMAIL` | Default admin email | `admin@yourcompany.com` |
| `ADMIN_PASSWORD` | Default admin password | Strong password |
| `ADMIN_NAME` | Default admin name | `System Admin` |
| `GMAIL_ADDRESS` | Gmail for emails (optional) | Your Gmail |
| `GMAIL_PASSWORD` | Gmail app password (optional) | App password |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://your-backend.vercel.app` |

---

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT secrets (32+ characters)
- [ ] Verified `FRONTEND_URL` and `COOKIE_DOMAIN` are correct
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] Enabled Vercel's built-in DDoS protection
- [ ] Set up monitoring/alerting
- [ ] Review Vercel logs regularly

---

## Maintenance

### Database Migrations

When you make schema changes:

```bash
# Local
cd backend/auth-service
npx prisma migrate dev --schema=./shared/prisma/schema.prisma

# Production (after pushing to GitHub and Vercel deploys)
vercel env pull .env.production
npx prisma migrate deploy --schema=./shared/prisma/schema.prisma
```

### Seeding Production Data

```bash
# Connect to production
vercel env pull .env.production

# Run seed
npm run db:seed

# Or create a custom seed for production
```

### Monitoring

- **Vercel Analytics**: Enable in project settings
- **Logs**: View in Vercel dashboard
- **Database**: Monitor in your database provider's dashboard

---

## Cost Estimate

- **Vercel Hobby (Free)**:
  - Suitable for small projects
  - 100GB bandwidth/month
  - Serverless function execution limits

- **Vercel Pro ($20/month)**:
  - Production apps
  - 1TB bandwidth
  - Unlimited team members

- **Database**:
  - Vercel Postgres: $0.30/GB
  - Neon: Free tier available (3GB)
  - Supabase: Free tier available (500MB)

---

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [vercel.com/community](https://vercel.com/community)
- **Database Provider Support**: Check respective documentation

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend
cd backend/auth-service && vercel --prod

# Deploy frontend
cd frontend && vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Link local project to Vercel
vercel link
```

---

## Next Steps

1. Deploy database (Vercel Postgres, Neon, or Supabase)
2. Deploy backend to Vercel
3. Run database migrations
4. Deploy frontend to Vercel
5. Update cross-references (FRONTEND_URL, VITE_API_BASE_URL)
6. Test thoroughly
7. Set up custom domain (optional)
8. Enable monitoring

**Happy deploying! 🚀**

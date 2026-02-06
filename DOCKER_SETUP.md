# Docker Setup Guide

## Quick Start

### 1. Ensure Environment Variables are Set

The `.env` file in the project root should have:

```env
# Auth Service Configuration
AUTH_SERVICE_PORT=3006

# Frontend Configuration
FRONTEND_PORT=3007
FRONTEND_URL=http://localhost:3007
COOKIE_DOMAIN=localhost

# API Configuration (for frontend to connect to backend)
VITE_API_BASE_URL=http://localhost:3006
VITE_APP_URL=http://localhost:3007

# Database Configuration
DB_HOST=localhost
DB_PORT=5434
DB_NAME=reminder_app_db
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-jwt-access-key-change-in-production
```

### 2. Start All Services

```bash
# Start all services (frontend, backend, database)
docker-compose up

# Or run in detached mode
docker-compose up -d
```

This will start:
- **Frontend** on [http://localhost:3007](http://localhost:3007)
- **Backend API** on [http://localhost:3006](http://localhost:3006)
- **PostgreSQL Database** on `localhost:5434`

### 3. Access the Application

- **Student Portal:** [http://localhost:3007](http://localhost:3007)
- **Admin Dashboard:** [http://localhost:3007/admin](http://localhost:3007/admin)
- **QR Generator:** [http://localhost:3007](http://localhost:3007) (default page)
- **API Health Check:** [http://localhost:3006/health](http://localhost:3006/health)

## Docker Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start specific service only
docker-compose up frontend
docker-compose up auth-service
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### View Logs
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs frontend
docker-compose logs auth-service
docker-compose logs reminder-app-db

# Follow specific service logs
docker-compose logs -f frontend
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build frontend
docker-compose build auth-service

# Rebuild and restart
docker-compose up --build
```

### Execute Commands in Containers
```bash
# Access frontend container shell
docker-compose exec frontend sh

# Access backend container shell
docker-compose exec auth-service sh

# Access database container shell
docker-compose exec reminder-app-db psql -U postgres -d reminder_app_db

# Run npm commands in frontend
docker-compose exec frontend npm install
docker-compose exec frontend npm run build

# Run Prisma commands in backend
docker-compose exec auth-service npx prisma studio
docker-compose exec auth-service npx prisma migrate dev
```

### Check Service Status
```bash
# List running containers
docker-compose ps

# Check container health
docker-compose ps
```

## Development Workflow

### Hot Reload

Both frontend and backend support **hot module replacement (HMR)**:

- **Frontend:** Changes to React components are reflected instantly
- **Backend:** Changes to Node.js files trigger automatic restart via nodemon

### Making Changes

1. Edit files in `frontend/` or `backend/auth-service/`
2. Changes are automatically detected and rebuilt
3. No need to restart containers

### Database Changes

```bash
# Apply schema changes
docker-compose exec auth-service npx prisma db push --schema=./shared/prisma/schema.prisma

# Create migration
docker-compose exec auth-service npx prisma migrate dev --schema=./shared/prisma/schema.prisma

# Open Prisma Studio (database GUI)
docker-compose exec auth-service npx prisma studio --schema=./shared/prisma/schema.prisma
```

### Install New Dependencies

**Frontend:**
```bash
# Add to package.json locally
cd frontend
npm install <package-name>

# Rebuild container
docker-compose build frontend
docker-compose up frontend
```

**Backend:**
```bash
# Add to package.json locally
cd backend/auth-service
npm install <package-name>

# Rebuild container
docker-compose build auth-service
docker-compose up auth-service
```

## Troubleshooting

### Port Already in Use

If you see "port is already allocated" error:

```bash
# Check what's using the port
lsof -i :3006
lsof -i :3007
lsof -i :5434

# Kill the process or change the port in .env
```

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs <service-name>

# Remove all containers and volumes, start fresh
docker-compose down -v
docker-compose up --build
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# Restart database
docker-compose restart reminder-app-db

# Check database logs
docker-compose logs reminder-app-db
```

### Frontend Not Loading

```bash
# Check if frontend is running
docker-compose ps frontend

# Check frontend logs
docker-compose logs -f frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up frontend
```

### Backend API Not Responding

```bash
# Check backend logs
docker-compose logs -f auth-service

# Check health endpoint
curl http://localhost:3006/health

# Restart backend
docker-compose restart auth-service
```

### Node Modules Issues

```bash
# Remove node_modules volume and rebuild
docker-compose down
docker volume rm qrbasedclassreminder_frontend_node_modules
docker volume rm qrbasedclassreminder_auth_service_node_modules
docker-compose up --build
```

### CORS Errors

If you see CORS errors in browser console:

1. Verify `FRONTEND_URL` in `.env` is `http://localhost:3007`
2. Check backend CORS configuration allows this origin
3. Restart backend: `docker-compose restart auth-service`

## Production Deployment

### Using Production Dockerfile

```bash
# Build production image
docker build -f frontend/Dockerfile.prod -t frontend:prod ./frontend

# Run production container
docker run -p 80:80 frontend:prod
```

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

### Production docker-compose

Create `docker-compose.prod.yml`:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    image: frontend:prod
    container_name: student-portal-frontend-prod
    ports:
      - "80:80"
    restart: always
    networks:
      - reminder-app-network
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Network Architecture

```
┌─────────────────────────────────────────────────┐
│             reminder-app-network                 │
│                                                  │
│  ┌──────────────┐    ┌──────────────┐          │
│  │   Frontend   │───▶│ Auth Service │          │
│  │  Port 3007   │    │  Port 3006   │          │
│  └──────────────┘    └───────┬──────┘          │
│                              │                   │
│                              ▼                   │
│                      ┌──────────────┐           │
│                      │  PostgreSQL  │           │
│                      │  Port 5432   │           │
│                      └──────────────┘           │
│                                                  │
└─────────────────────────────────────────────────┘

External Access:
- Frontend: localhost:3007
- Backend:  localhost:3006
- Database: localhost:5434
```

## Volumes

### Named Volumes

- `db_data` - PostgreSQL database data
- `auth_service_node_modules` - Backend dependencies
- `frontend_node_modules` - Frontend dependencies

### Bind Mounts

- `./frontend` → `/app` (Frontend code with hot reload)
- `./backend/auth-service` → `/app` (Backend code with hot reload)

## Health Checks

All services have health checks:

- **Frontend:** `http://localhost:3007` returns 200
- **Backend:** `http://localhost:3006/health` returns 200
- **Database:** `pg_isready` command succeeds

Check health status:
```bash
docker-compose ps
```

## Performance Tips

1. **Use Docker Desktop's Resource Settings:**
   - Allocate at least 4GB RAM
   - Allocate at least 2 CPU cores

2. **Disable Unused Services:**
   ```bash
   # Start only frontend
   docker-compose up frontend
   ```

3. **Clear Build Cache:**
   ```bash
   docker builder prune
   docker-compose build --no-cache
   ```

## Backup & Restore

### Backup Database

```bash
# Create backup
docker-compose exec -T reminder-app-db pg_dump -U postgres reminder_app_db > backup.sql

# Or with timestamp
docker-compose exec -T reminder-app-db pg_dump -U postgres reminder_app_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T reminder-app-db psql -U postgres reminder_app_db < backup.sql
```

## Common Workflows

### Fresh Start

```bash
# Stop everything and remove volumes
docker-compose down -v

# Remove images
docker rmi frontend:dev auth-service:dev

# Rebuild and start
docker-compose up --build
```

### Update Dependencies

```bash
# Update package.json locally
cd frontend
npm install <new-package>

# Rebuild container
cd ..
docker-compose build frontend
docker-compose up frontend
```

### View Database

```bash
# Option 1: Prisma Studio
docker-compose exec auth-service npx prisma studio --schema=./shared/prisma/schema.prisma

# Option 2: psql
docker-compose exec reminder-app-db psql -U postgres -d reminder_app_db

# Option 3: Use a GUI tool like DBeaver
# Connect to: localhost:5434
# Database: reminder_app_db
# User: postgres
# Password: postgres123
```

## Next Steps

After Docker is running:

1. ✅ Access frontend at [http://localhost:3007](http://localhost:3007)
2. ✅ Test QR code generation
3. ✅ Test student signup flow
4. ✅ Access admin dashboard at [http://localhost:3007/admin](http://localhost:3007/admin)
5. ⚠️ **Add admin endpoints to backend** (see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md))

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Check service status: `docker-compose ps`
3. Restart services: `docker-compose restart <service-name>`
4. Fresh start: `docker-compose down -v && docker-compose up --build`

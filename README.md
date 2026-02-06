# QR-Based Class Reminder System

A comprehensive student training portal with QR code-based entry, admin dashboard, and automated reminder system.

## 🚀 Quick Start with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd QRBasedClassReminder

# Start all services (frontend, backend, database)
docker-compose up
```

**Access the application:**
- **Student Portal:** [http://localhost:3007](http://localhost:3007)
- **Admin Dashboard:** [http://localhost:3007/admin](http://localhost:3007/admin)
- **Backend API:** [http://localhost:3006](http://localhost:3006)

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker instructions.

## 📦 Project Structure

```
QRBasedClassReminder/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state management
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   ├── Dockerfile          # Development Docker image
│   ├── Dockerfile.prod     # Production Docker image
│   └── package.json
│
├── backend/
│   └── auth-service/        # Express + Prisma backend
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       ├── middleware/
│       ├── shared/
│       │   └── prisma/     # Database schema
│       ├── Dockerfile
│       └── package.json
│
├── docker-compose.yml       # Docker orchestration
├── .env                    # Environment configuration
└── Documentation files
```

## 🎯 Features

### Student Portal
- ✅ QR code entry with pre-selected training types
- ✅ Mobile-optimized signup flow
- ✅ Email or phone validation
- ✅ Confirmation before submission
- ✅ Success screen with details
- ✅ Opt-out preference management

### Admin Dashboard
- ✅ View all student signups
- ✅ Frontend pagination (10/25/50/100 per page)
- ✅ Advanced filtering (type, status, date range)
- ✅ Multi-column search
- ✅ CSV export (filtered and full)
- ✅ Sortable columns

### QR Generator
- ✅ Generate QR codes for all training types
- ✅ Customizable sizes
- ✅ Download as PNG
- ✅ Copy signup URLs

## 🛠 Tech Stack

### Frontend
- React 18.3 + Vite 5.4
- Zustand 4.5 (State Management)
- React Router 6.26
- Tailwind CSS 3.4
- qrcode.react 4.0
- Axios 1.7

### Backend
- Node.js + Express.js 5.1
- Prisma ORM 6.9
- PostgreSQL 15
- Zod Validation
- Winston Logging
- JWT Authentication

### Infrastructure
- Docker + Docker Compose
- Hot Module Replacement (HMR)
- Health Checks
- Volume Persistence

## 📋 Training Types

Students can enroll in ONE training at a time:

1. **TYPE_1** - Initial Firearms
2. **TYPE_2** - Firearms Requalification
3. **TYPE_3** - CPR/AED and/or First Aid
4. **TYPE_4** - Handcuffing and/or Pepper Spray
5. **TYPE_5** - CEW / Taser
6. **TYPE_6** - Baton

## 🐳 Docker Services

The application runs three services:

1. **frontend** - React application (Port 3007)
2. **auth-service** - Express backend (Port 3006)
3. **reminder-app-db** - PostgreSQL database (Port 5434)

### Common Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild services
docker-compose up --build

# Access database
docker-compose exec reminder-app-db psql -U postgres -d reminder_app_db

# Access frontend shell
docker-compose exec frontend sh

# Access backend shell
docker-compose exec auth-service sh
```

## 🔧 Environment Configuration

The `.env` file contains all configuration:

```env
# Ports
AUTH_SERVICE_PORT=3006
FRONTEND_PORT=3007

# URLs
FRONTEND_URL=http://localhost:3007
VITE_API_BASE_URL=http://localhost:3006
VITE_APP_URL=http://localhost:3007

# Database
DB_PORT=5434
DB_NAME=reminder_app_db
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT (change in production!)
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production
```

## 📚 Documentation

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Complete Docker guide
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Vercel deployment guide
- **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)** - Frontend setup and configuration
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Backend integration code
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Full implementation details
- **[frontend/README.md](frontend/README.md)** - Frontend-specific documentation

## 🚦 Getting Started

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up

# Access the application
open http://localhost:3007
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend/auth-service
npm install
npx prisma generate --schema=./shared/prisma/schema.prisma
npx prisma db push --schema=./shared/prisma/schema.prisma
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deployment to Vercel

Deploy both frontend and backend to Vercel with ease:

```bash
# 1. Set up a hosted PostgreSQL database (Vercel Postgres, Neon, or Supabase)

# 2. Deploy backend
cd backend/auth-service
vercel --prod

# 3. Deploy frontend
cd ../../frontend
vercel --prod
```

**Complete deployment guide:** See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed step-by-step instructions including:
- Database setup (Vercel Postgres, Neon, Supabase)
- Environment variable configuration
- Domain setup
- Continuous deployment
- Troubleshooting

## 🧪 Testing the Application

### 1. Test Student Signup Flow

1. Visit [http://localhost:3007/signup](http://localhost:3007/signup)
2. Select a training type
3. Enter email or phone
4. Confirm and submit
5. View success screen

### 2. Test QR Code Entry

1. Visit [http://localhost:3007](http://localhost:3007)
2. Select a training type
3. Download QR code
4. Scan with phone → opens directly to signup form

### 3. Test Admin Dashboard

1. Visit [http://localhost:3007/admin](http://localhost:3007/admin)
2. View all signups
3. Test search and filters
4. Export to CSV

## ⚠️ Important Notes

### Current State
- ✅ Frontend fully implemented
- ✅ Backend auth service running
- ⚠️ Admin endpoints need to be added (see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md))
- ⚠️ Admin authentication not yet implemented

### Next Steps
1. Add admin endpoints to backend (see integration guide)
2. Test complete flow end-to-end
3. Add authentication for admin routes
4. Set up email/SMS services for reminders

## 🔐 Security Considerations

### Development
- Default credentials are for development only
- JWT secrets must be changed in production
- Admin routes not yet protected

### Production Checklist
- [ ] Change all secrets in `.env`
- [ ] Enable HTTPS
- [ ] Add admin authentication
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Use environment-specific configs

## 🌐 API Endpoints

### Student (Public)
```
POST   /api/students/signup              # Create signup
GET    /api/students/signup/:signupId    # Get signup details
GET    /api/students/:studentId/signups  # Get student signups
PATCH  /api/students/:studentId/opt-out  # Update preferences
```

### Admin (To Be Implemented)
```
GET    /api/admin/signups                # Get all signups
PATCH  /api/admin/signups/:signupId      # Update signup
DELETE /api/admin/signups/:signupId      # Delete signup
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3006
lsof -i :3007

# Change port in .env or kill the process
```

### Database Connection Error
```bash
# Restart database
docker-compose restart reminder-app-db

# Check database logs
docker-compose logs reminder-app-db
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs -f frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up frontend
```

### CORS Error
- Verify `FRONTEND_URL` in `.env` is correct
- Restart backend: `docker-compose restart auth-service`

## 📊 Database Schema

```prisma
model Student {
  id            String   @id @default(uuid())
  email         String?  @unique
  phone         String?  @unique
  optedOutEmail Boolean  @default(false)
  optedOutSms   Boolean  @default(false)
  signups       Signup[]
}

model Signup {
  id                    String       @id @default(uuid())
  studentId             String
  classType             ClassType
  reminderScheduledDate DateTime
  reminderSentAt        DateTime?
  status                SignupStatus @default(PENDING)
  student               Student      @relation(...)
  deliveryLogs          DeliveryLog[]
}
```

See [backend/auth-service/shared/prisma/schema.prisma](backend/auth-service/shared/prisma/schema.prisma) for full schema.

## 🤝 Contributing

1. Make changes in `frontend/` or `backend/auth-service/`
2. Test with Docker: `docker-compose up`
3. Changes hot-reload automatically
4. Commit your changes

## 📝 License

MIT

## 🙏 Support

For questions or issues:
1. Check documentation in `/` root
2. Review logs: `docker-compose logs -f`
3. Check [DOCKER_SETUP.md](DOCKER_SETUP.md)
4. Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

---

**Built with:**
- React + Vite
- Express + Prisma
- PostgreSQL
- Docker
- Tailwind CSS
- Zustand

**Ready to deploy!** 🚀
For seeding:
- docker exec auth-service npm run db:seed
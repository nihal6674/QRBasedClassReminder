# Backend-Frontend Integration Guide

## Quick Integration Steps

### 1. Backend API Endpoints to Create

Add these routes to your backend auth-service:

```javascript
// backend/auth-service/routes/adminRoutes.js (or create signupRoutes.js)

const express = require('express');
const router = express.Router();
const signupController = require('../controllers/signupController');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');

// Admin endpoints - protected with authentication
router.get('/admin/signups', authenticateAdmin, signupController.getAllSignups);
router.patch('/admin/signups/:signupId', authenticateAdmin, signupController.updateSignup);
router.delete('/admin/signups/:signupId', authenticateAdmin, signupController.deleteSignup);

module.exports = router;
```

### 2. Create Signup Controller

```javascript
// backend/auth-service/controllers/signupController.js

const signupService = require('../services/signupService');
const { createSuccessResponse, createErrorResponse } = require('../lib/utils');
const { createLogger } = require('../shared/utils/logger');

const logger = createLogger('signup-controller');

/**
 * Get all signups (Admin only)
 * GET /api/admin/signups
 * IMPORTANT: Returns ALL signups - no pagination on backend
 */
const getAllSignups = async (req, res) => {
  try {
    logger.info('Fetching all signups for admin', { adminId: req.admin.id });

    const signups = await signupService.getAllSignups();

    return createSuccessResponse(
      res,
      { signups },
      'Signups retrieved successfully',
      200
    );
  } catch (error) {
    logger.error('Failed to fetch signups', { error: error.message });
    return createErrorResponse(res, error, 'getAllSignups');
  }
};

/**
 * Update signup
 * PATCH /api/admin/signups/:signupId
 */
const updateSignup = async (req, res) => {
  try {
    const { signupId } = req.params;
    const updateData = req.body;

    logger.info('Updating signup', { signupId, adminId: req.admin.id });

    const updated = await signupService.updateSignup(signupId, updateData);

    return createSuccessResponse(
      res,
      { signup: updated },
      'Signup updated successfully',
      200
    );
  } catch (error) {
    logger.error('Failed to update signup', { error: error.message });
    return createErrorResponse(res, error, 'updateSignup');
  }
};

/**
 * Delete signup
 * DELETE /api/admin/signups/:signupId
 */
const deleteSignup = async (req, res) => {
  try {
    const { signupId } = req.params;

    logger.info('Deleting signup', { signupId, adminId: req.admin.id });

    await signupService.deleteSignup(signupId);

    return createSuccessResponse(res, null, 'Signup deleted successfully', 200);
  } catch (error) {
    logger.error('Failed to delete signup', { error: error.message });
    return createErrorResponse(res, error, 'deleteSignup');
  }
};

module.exports = {
  getAllSignups,
  updateSignup,
  deleteSignup,
};
```

### 3. Create Signup Service

```javascript
// backend/auth-service/services/signupService.js

const signupRepository = require('../repositories/signupRepository');
const { NotFoundError, ValidationError } = require('../shared/utils/errors');

/**
 * Get all signups with student information
 * Returns ALL records - frontend handles pagination
 */
const getAllSignups = async () => {
  try {
    const signups = await signupRepository.findAll({
      include: {
        student: {
          select: {
            id: true,
            email: true,
            phone: true,
            optedOutEmail: true,
            optedOutSms: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return signups;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a signup
 */
const updateSignup = async (signupId, updateData) => {
  try {
    // Validate signup exists
    const existing = await signupRepository.findById(signupId);
    if (!existing) {
      throw new NotFoundError('Signup not found');
    }

    // Update
    const updated = await signupRepository.update(signupId, updateData);

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a signup
 */
const deleteSignup = async (signupId) => {
  try {
    // Validate signup exists
    const existing = await signupRepository.findById(signupId);
    if (!existing) {
      throw new NotFoundError('Signup not found');
    }

    // Delete
    await signupRepository.delete(signupId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllSignups,
  updateSignup,
  deleteSignup,
};
```

### 4. Create Signup Repository

```javascript
// backend/auth-service/repositories/signupRepository.js

const { getDB } = require('../config/database');
const { SIGNUP_FIELDS } = require('../lib/constants');

/**
 * Find all signups
 */
const findAll = async (options = {}) => {
  const db = await getDB();

  return await db.signup.findMany({
    select: options.include ? SIGNUP_FIELDS.withStudent : SIGNUP_FIELDS.public,
    orderBy: options.orderBy || { createdAt: 'desc' },
  });
};

/**
 * Find signup by ID
 */
const findById = async (signupId) => {
  const db = await getDB();

  return await db.signup.findUnique({
    where: { id: signupId },
    select: SIGNUP_FIELDS.withStudent,
  });
};

/**
 * Update signup
 */
const update = async (signupId, updateData) => {
  const db = await getDB();

  return await db.signup.update({
    where: { id: signupId },
    data: updateData,
    select: SIGNUP_FIELDS.withStudent,
  });
};

/**
 * Delete signup
 */
const deleteSignup = async (signupId) => {
  const db = await getDB();

  return await db.signup.delete({
    where: { id: signupId },
  });
};

module.exports = {
  findAll,
  findById,
  update,
  delete: deleteSignup,
};
```

### 5. Update Constants (Already exists, just verify)

```javascript
// backend/auth-service/lib/constants.js

const SIGNUP_FIELDS = {
  public: {
    id: true,
    studentId: true,
    classType: true,
    reminderScheduledDate: true,
    reminderSentAt: true,
    status: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
  },
  withStudent: {
    id: true,
    studentId: true,
    classType: true,
    reminderScheduledDate: true,
    reminderSentAt: true,
    status: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    student: {
      select: {
        id: true,
        email: true,
        phone: true,
        optedOutEmail: true,
        optedOutSms: true,
      },
    },
  },
};
```

### 6. Update Server.js

```javascript
// backend/auth-service/server.js

// Add signup routes
const signupRoutes = require('./routes/signupRoutes'); // or adminRoutes
app.use('/api', signupRoutes);
```

### 7. Enable CORS

```javascript
// backend/auth-service/server.js

const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Environment Variables

### Backend (.env)
```env
# Existing variables...
FRONTEND_URL=http://localhost:3000

# For production
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_URL=http://localhost:3000
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend/auth-service
npm run dev
```

Backend should be running on: http://localhost:5000

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend should be running on: http://localhost:3000

### 3. Test Student Signup Flow

1. Visit: http://localhost:3000/signup
2. Select a training type
3. Fill in email or phone
4. Confirm and submit
5. Verify in database:
```sql
SELECT * FROM signups ORDER BY created_at DESC LIMIT 1;
```

### 4. Test QR Code Entry

1. Visit: http://localhost:3000
2. Select a training type
3. Download QR code
4. Scan QR code with phone
5. Should open directly to signup form with type pre-selected

### 5. Test Admin Dashboard

1. Visit: http://localhost:3000/admin
2. Verify all signups are displayed
3. Test search functionality
4. Test filters
5. Test CSV export

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Signups retrieved successfully",
  "data": {
    "signups": [
      {
        "id": "uuid",
        "studentId": "uuid",
        "classType": "TYPE_1",
        "reminderScheduledDate": "2024-01-15T10:00:00Z",
        "reminderSentAt": null,
        "status": "PENDING",
        "notes": null,
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T10:00:00Z",
        "student": {
          "id": "uuid",
          "email": "student@example.com",
          "phone": "+1234567890",
          "optedOutEmail": false,
          "optedOutSms": false
        }
      }
    ]
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Signup not found",
    "code": "NOT_FOUND"
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## Common Issues & Solutions

### Issue 1: CORS Error
**Error:** "Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS"

**Solution:**
```javascript
// backend/auth-service/server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue 2: 404 on Admin Routes
**Error:** "Cannot GET /api/admin/signups"

**Solution:**
- Verify routes are registered in server.js
- Check route path matches frontend expectation
- Verify middleware is not blocking the route

### Issue 3: Empty Student Data
**Error:** Student object is null in signup response

**Solution:**
```javascript
// Use SIGNUP_FIELDS.withStudent in repository
select: SIGNUP_FIELDS.withStudent
```

### Issue 4: Frontend Can't Connect
**Error:** "Network Error" in frontend console

**Solution:**
- Verify backend is running: `curl http://localhost:5000/health`
- Check .env file has correct VITE_API_BASE_URL
- Restart frontend: `npm run dev`

## Database Setup

If you haven't run migrations yet:

```bash
cd backend/auth-service
npx prisma generate
npx prisma db push
```

## Production Deployment

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy Backend
- Set `FRONTEND_URL` environment variable
- Update CORS configuration
- Enable HTTPS

### 3. Deploy Frontend
- Set `VITE_API_BASE_URL` to production API URL
- Deploy to Vercel/Netlify
- Verify environment variables

### 4. Test Production
- Test QR code scanning
- Test signup flow
- Test admin dashboard
- Verify CORS is working

## Monitoring

### Backend Logs
```bash
tail -f backend/auth-service/logs/auth-service-combined.log
```

### Frontend Errors
Use browser console and Network tab to debug

### Production Monitoring
- Set up Sentry for error tracking
- Use Google Analytics for usage tracking
- Monitor API response times

## Next Steps

After integration is working:

1. **Add Authentication:**
   - Implement admin login page
   - Add JWT tokens to admin requests
   - Protect admin routes

2. **Set up Email Service:**
   - Configure SendGrid/Mailgun
   - Create email templates
   - Test email sending

3. **Set up SMS Service:**
   - Configure Twilio/AWS SNS
   - Create SMS templates
   - Test SMS sending

4. **Set up Scheduled Reminders:**
   - Create cron job or AWS Lambda
   - Query signups with upcoming dates
   - Send reminders via email/SMS

5. **Production Testing:**
   - Load testing
   - Security audit
   - Accessibility audit
   - Mobile device testing

## Support

For questions:
1. Check console logs (backend and frontend)
2. Verify API response format matches expected structure
3. Check network tab in browser DevTools
4. Review database records

## Quick Reference

### Backend Commands
```bash
npm run dev          # Start development server
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate Prisma client
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Database Commands
```bash
npx prisma db push       # Push schema changes
npx prisma migrate dev   # Create migration
npx prisma studio        # Open database GUI
```

This integration guide should help you connect the frontend to your existing backend quickly and efficiently!

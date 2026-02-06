# Frontend Setup Guide

## Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Production Assumptions

### 1. Backend API Endpoints

The frontend expects these backend endpoints to be available:

#### Student Endpoints (Public)
```
POST   /api/students/signup                    # Create new signup
GET    /api/students/signup/:signupId          # Get signup details
GET    /api/students/:studentId/signups        # Get student's signups
PATCH  /api/students/:studentId/opt-out        # Update opt-out preferences
```

#### Admin Endpoints (Protected)
```
GET    /api/admin/students                     # Get ALL students
GET    /api/admin/signups                      # Get ALL signups
PATCH  /api/admin/signups/:signupId            # Update signup
DELETE /api/admin/signups/:signupId            # Delete signup
```

**IMPORTANT:** Admin endpoints must return ALL data (no backend pagination). Frontend handles pagination entirely.

### 2. Expected API Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

Error format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### 3. Data Models

**Signup Object:**
```javascript
{
  id: "uuid",
  studentId: "uuid",
  classType: "TYPE_1" | "TYPE_2" | ... | "TYPE_6",
  reminderScheduledDate: "ISO 8601 date",
  reminderSentAt: "ISO 8601 date" | null,
  status: "PENDING" | "SENT" | "FAILED",
  notes: "string" | null,
  createdAt: "ISO 8601 date",
  updatedAt: "ISO 8601 date",
  student: {
    id: "uuid",
    email: "string" | null,
    phone: "string" | null,
    optedOutEmail: boolean,
    optedOutSms: boolean
  }
}
```

### 4. Environment Variables

Create `.env` file in frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_URL=http://localhost:3000
```

For production:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

### 5. CORS Configuration

Backend must allow CORS from frontend origin:

```javascript
// Example Express CORS config
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 6. Authentication (Future)

Currently, admin routes are NOT protected. To implement:

1. Add JWT authentication to backend
2. Create login page in frontend
3. Store tokens in httpOnly cookies
4. Add auth middleware to admin routes
5. Implement token refresh logic

### 7. Missing Backend Features

The following admin endpoints may need to be created:

```javascript
// backend/auth-service/controllers/adminSignupController.js

// Get all signups (for admin dashboard)
const getAllSignups = async (req, res) => {
  try {
    const signups = await signupRepository.findAll({
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    });

    return createSuccessResponse(res, { signups }, 'Signups retrieved successfully');
  } catch (error) {
    return createErrorResponse(res, error, 'getAllSignups');
  }
};

// Update signup status
const updateSignup = async (req, res) => {
  try {
    const { signupId } = req.params;
    const updateData = req.body;

    const updated = await signupRepository.update(signupId, updateData);
    return createSuccessResponse(res, { signup: updated }, 'Signup updated successfully');
  } catch (error) {
    return createErrorResponse(res, error, 'updateSignup');
  }
};

// Delete signup
const deleteSignup = async (req, res) => {
  try {
    const { signupId } = req.params;

    await signupRepository.delete(signupId);
    return createSuccessResponse(res, null, 'Signup deleted successfully');
  } catch (error) {
    return createErrorResponse(res, error, 'deleteSignup');
  }
};
```

## Component Architecture

### State Management Strategy

**Zustand Stores:**
1. **studentStore** - Manages signup flow
2. **adminStore** - Manages admin dashboard (pagination, filters, search)
3. **reminderStore** - Manages reminder scheduling/sending

**Why Zustand:**
- Lightweight (1KB)
- No boilerplate
- TypeScript-ready
- React 18 compatible
- Easy to test

### Routing Strategy

**React Router v6:**
- Declarative routing
- Nested routes support
- URL parameters for class types
- Search params for filters

## Key Design Decisions

### 1. Frontend Pagination
**Decision:** Fetch ALL data once, paginate in-memory

**Reasoning:**
- Faster UX (no network latency)
- Easier filtering/searching
- Simpler state management
- Works well for < 10,000 records

**Tradeoff:**
- Initial load time
- Memory usage

**When to change:**
If dataset grows beyond 10,000 signups, switch to backend pagination.

### 2. Form Validation
**Decision:** Client-side validation with server-side confirmation

**Implementation:**
- Zod schemas for validation (matches backend)
- Real-time error feedback
- Prevent duplicate submissions

### 3. Mobile-First Design
**Decision:** Design for mobile, enhance for desktop

**Implementation:**
- Touch-friendly buttons (min 44px)
- Stack layouts on mobile
- Optimized input types
- Prevent zoom on input focus

### 4. QR Code Strategy
**Decision:** Generate QR codes client-side

**Reasoning:**
- No server load
- Instant generation
- Works offline
- Easy to customize

## Performance Optimizations

1. **Code Splitting:** Routes are lazy-loaded
2. **Memoization:** Expensive computations memoized
3. **Virtual Scrolling:** (Future) For large tables
4. **Debounced Search:** 300ms debounce on search input
5. **Image Optimization:** QR codes generated as SVG

## Testing Strategy

### Unit Tests (Future)
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Test coverage priorities:
1. Form validation logic
2. Zustand stores
3. Data formatters
4. CSV export utility

### E2E Tests (Future)
```bash
npm install --save-dev playwright
```

Critical user flows:
1. Complete signup flow
2. QR code entry → form → confirmation → success
3. Admin filtering and export

## Deployment

### Build for Production
```bash
npm run build
```

Output: `dist/` directory

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables
Set these in your hosting platform:
- `VITE_API_BASE_URL`
- `VITE_APP_URL`

## Monitoring & Analytics

### Recommended Tools
1. **Sentry** - Error tracking
2. **Google Analytics** - Usage analytics
3. **Hotjar** - User behavior
4. **Lighthouse** - Performance monitoring

## Security Considerations

### Current State
- ✅ XSS prevention (React escaping)
- ✅ Input sanitization
- ✅ HTTPS ready
- ❌ Admin authentication (not implemented)
- ❌ CSRF protection (not implemented)

### Production Checklist
- [ ] Implement authentication
- [ ] Add CSRF tokens
- [ ] Enable CSP headers
- [ ] Secure cookies (httpOnly, secure, sameSite)
- [ ] Rate limiting on signup endpoints
- [ ] Input validation on all forms

## Accessibility (WCAG 2.1)

### Current Level: Partial AA

**Implemented:**
- ✅ Semantic HTML
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast (most elements)
- ✅ Alt text for icons

**To Improve:**
- [ ] ARIA labels for complex components
- [ ] Screen reader testing
- [ ] High contrast mode support
- [ ] Reduced motion support

## Browser Compatibility

Tested and supported:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+

## Questions & Support

For implementation questions:
1. Check the component comments
2. Review Zustand store logic
3. Check console for errors
4. Review API network requests

For backend integration:
1. Match the expected API format
2. Return ALL data for admin endpoints
3. Implement proper error responses
4. Enable CORS for frontend origin

# Student Training Portal - Frontend

A mobile-first React application for managing student training registrations with QR code-based entry and an admin dashboard.

## Features

### Student Portal
- ✅ QR code and deep link entry with pre-selected training types
- ✅ Mobile-optimized signup flow
- ✅ Email or phone validation (one required)
- ✅ Confirmation screen before submission
- ✅ Success screen with registration details
- ✅ Opt-out preference management

### Admin Dashboard
- ✅ View all student signups in a table
- ✅ Frontend-only pagination
- ✅ Multi-column search (email, phone, training type)
- ✅ Advanced filtering (class type, status, date range, reminder status)
- ✅ Sortable columns
- ✅ CSV export (filtered and full dataset)
- ✅ Responsive design

### QR Generator
- ✅ Generate QR codes for each training type
- ✅ Customizable QR code sizes
- ✅ Download QR codes as PNG
- ✅ Copy signup URLs to clipboard
- ✅ Preview all training types

## Tech Stack

- **React** 18.3.1
- **Vite** 5.4.5
- **React Router** 6.26.0
- **Zustand** 4.5.5 (State Management)
- **Tailwind CSS** 3.4.11 (Styling)
- **qrcode.react** 4.0.1 (QR Code Generation)
- **lucide-react** 0.447.0 (Icons)
- **axios** 1.7.7 (API Client)
- **date-fns** 4.1.0 (Date Formatting)

## Project Structure

```
src/
├── components/
│   ├── shared/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Alert.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── Select.jsx
│   │   └── Table.jsx
│   ├── student/         # Student-specific components
│   │   ├── ClassTypeSelector.jsx
│   │   ├── SignupForm.jsx
│   │   ├── ConfirmationScreen.jsx
│   │   └── SuccessScreen.jsx
│   └── admin/          # Admin-specific components
│       ├── SearchBar.jsx
│       ├── TableFilters.jsx
│       ├── Pagination.jsx
│       └── SignupsTable.jsx
├── pages/
│   ├── StudentSignup.jsx       # Main signup flow
│   ├── OptOutConfirmation.jsx  # Preference management
│   ├── AdminDashboard.jsx      # Admin panel
│   ├── QRGenerator.jsx         # QR code generator
│   ├── TemplateManager.jsx     # Message templates (placeholder)
│   └── NotFound.jsx            # 404 page
├── store/
│   ├── studentStore.js   # Student signup state
│   ├── adminStore.js     # Admin dashboard state
│   └── reminderStore.js  # Reminder management state
├── services/
│   ├── api.js            # Axios instance
│   ├── studentService.js # Student API calls
│   └── adminService.js   # Admin API calls
├── utils/
│   ├── constants.js      # App constants
│   ├── formatters.js     # Data formatting utilities
│   └── csvExport.js      # CSV export functionality
├── App.jsx               # Route configuration
├── main.jsx             # App entry point
└── index.css            # Global styles

```

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_APP_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Training Types

The system supports 6 training types (students can enroll in ONE at a time):

1. **TYPE_1** - Initial Firearms
2. **TYPE_2** - Firearms Requalification
3. **TYPE_3** - CPR/AED and/or First Aid
4. **TYPE_4** - Handcuffing and/or Pepper Spray
5. **TYPE_5** - CEW / Taser
6. **TYPE_6** - Baton

## Routes

### Student Routes
- `/signup` - Training type selection
- `/signup/:classType` - Direct signup with pre-selected type (QR entry)
- `/opt-out/:studentId` - Manage notification preferences

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/templates` - Message template manager (placeholder)
- `/admin/qr-generator` - QR code generator

### Default Route
- `/` - Redirects to QR Generator

## State Management (Zustand)

### StudentStore
- Manages signup form state
- Handles form validation
- Manages submission flow
- Tracks confirmation state

### AdminStore
- Fetches all signups from backend
- Implements frontend pagination
- Manages filters and search
- Handles sorting
- Tracks selection state

### ReminderStore
- Tracks reminder schedule state
- Manages sending status
- Handles retry logic

## Key Features Implementation

### 1. QR Code Entry
Students can access signup forms via:
- Scanning QR code → `/signup/TYPE_1`
- Direct URL → `/signup?type=TYPE_1`
- Manual selection → `/signup`

### 2. Form Validation
- Email OR Phone required (at least one)
- Email format validation
- Phone format validation
- Real-time error feedback

### 3. Confirmation Flow
1. Student fills form
2. Reviews information
3. Confirms and submits
4. Sees success screen

### 4. Admin Pagination
- **Frontend-only** pagination
- Fetches ALL data from backend once
- Filters, searches, and paginates in-memory
- Optimized for fast UX

### 5. CSV Export
- Export all signups
- Export filtered results
- Includes all relevant fields
- Properly formatted with headers

## Production Assumptions

### API Integration
The frontend assumes the backend API provides these endpoints:

**Student Endpoints:**
- `POST /api/students/signup` - Create signup
- `GET /api/students/signup/:signupId` - Get signup details
- `GET /api/students/:studentId/signups` - Get student signups
- `PATCH /api/students/:studentId/opt-out` - Update preferences

**Admin Endpoints:**
- `GET /api/admin/students` - Get all students (returns ALL data)
- `GET /api/admin/signups` - Get all signups (returns ALL data)
- `PATCH /api/admin/signups/:signupId` - Update signup
- `DELETE /api/admin/signups/:signupId` - Delete signup

### Data Structure
Expected API response format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "signup": {
      "id": "uuid",
      "studentId": "uuid",
      "classType": "TYPE_1",
      "reminderScheduledDate": "2024-01-15T10:00:00Z",
      "reminderSentAt": null,
      "status": "PENDING",
      "createdAt": "2024-01-01T10:00:00Z",
      "student": {
        "id": "uuid",
        "email": "student@example.com",
        "phone": "+1234567890",
        "optedOutEmail": false,
        "optedOutSms": false
      }
    }
  }
}
```

### Authentication
Currently, admin routes are NOT protected with authentication. In production:
- Add JWT authentication
- Implement login page
- Add auth middleware
- Secure admin routes

### Error Handling
- Network errors are caught and displayed
- Form validation errors are shown inline
- API errors are shown in alerts
- Loading states prevent duplicate submissions

## Mobile Optimization

- Touch-friendly tap targets (minimum 44px)
- Optimized input types (email, tel)
- Mobile-first responsive design
- Prevented accidental zoom on inputs
- Fast tap response with CSS optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Message template editor
- [ ] Bulk reminder sending
- [ ] Advanced analytics dashboard
- [ ] Email preview functionality
- [ ] SMS preview functionality
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Accessibility improvements (WCAG 2.1 AA)

## Troubleshooting

### QR Codes not generating
- Ensure `qrcode.react` is installed
- Check browser console for errors
- Verify the signup URL format

### CSV Export not working
- Check browser allows downloads
- Verify data is loaded before export
- Check console for errors

### API connection issues
- Verify `VITE_API_BASE_URL` in `.env`
- Check backend server is running
- Ensure CORS is configured on backend

### State not persisting
- Zustand stores reset on page refresh (by design)
- Use backend API for data persistence
- Implement local storage if needed

## Contributing

1. Follow existing code structure
2. Use TypeScript-ready JavaScript
3. Follow ESLint rules
4. Test on mobile devices
5. Ensure accessibility

## License

MIT

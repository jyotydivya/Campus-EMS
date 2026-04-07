# Campus Event Management System (Campus EMS)

A full-stack web application for managing campus events, registrations, and digital QR tickets.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, React Router v6, Axios    |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB (via Mongoose)              |
| Auth        | JWT + bcryptjs                      |
| QR Codes    | qrcode npm package                  |
| Push Notif. | Firebase Admin SDK (FCM)            |
| Email       | Nodemailer (Gmail)                  |
| Charts      | Recharts                            |
| Hosting     | Render (backend) + Vercel (frontend)|

---

## Modules (5+ Application-Specific)

1. **Event Discovery & Browsing** — Search, filter by category, view upcoming events
2. **Event Registration & QR Ticketing** — Register, get digital QR ticket via email
3. **QR Code Entry Validation** — Organizers scan QR codes to allow entry
4. **Admin Approval Workflow** — Admins approve/reject event submissions
5. **Push & Email Notifications** — Firebase FCM push + Nodemailer email confirmations
6. **Participation Reports & CSV Export** — Analytics dashboards with data export
7. **Role-Based Access Control** — Student / Organizer / Admin roles with JWT

---

## Project Structure

```
campus-ems/
├── backend/
│   ├── server.js              # Express entry point
│   ├── .env.example           # Environment variables template
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js    # Also contains Ticket model
│   │   └── Category.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── tickets.js
│   │   ├── notifications.js
│   │   ├── admin.js
│   │   └── categories.js
│   ├── middleware/
│   │   └── auth.js            # JWT protect + authorize middleware
│   └── utils/
│       ├── firebase.js        # Firebase Admin push notifications
│       └── mailer.js          # Nodemailer email utility
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js             # Routes & role-based navigation
        ├── index.js
        ├── index.css          # Global design system
        ├── context/
        │   └── AuthContext.js # Global auth state
        ├── utils/
        │   └── api.js         # Axios instance with JWT interceptor
        ├── components/
        │   ├── Sidebar.js     # Role-aware sidebar navigation
        │   └── EventCard.js   # Reusable event card
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── student/
            │   ├── Home.js           # Browse events
            │   ├── EventDetail.js    # Register for event
            │   ├── MyRegistrations.js
            │   └── MyTickets.js      # QR ticket viewer
            ├── organizer/
            │   ├── Dashboard.js      # Organizer overview
            │   ├── CreateEvent.js    # Create event form
            │   ├── ManageEvent.js    # Participants + notify
            │   └── ScanQR.js         # QR entry scanner
            └── admin/
                ├── Dashboard.js     # Stats + charts
                ├── Events.js        # Approve/reject events
                ├── Users.js         # User & role management
                ├── Categories.js    # Event categories
                └── Report.js        # Analytics + CSV export
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Gmail account (for email)
- Firebase project (for push notifications — optional)

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Create Admin Account
After starting the server, register an account normally, then update the role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne({ email: "admin@demo.com" }, { $set: { role: "admin" } })
```

Or use the admin panel to promote users once you have one admin account.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/events | List approved events |
| GET | /api/events/:id | Event details |
| POST | /api/events | Create event (organizer) |
| GET | /api/events/organizer/mine | My events (organizer) |
| GET | /api/events/:id/participants | Participant list (organizer) |

### Registrations & Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/registrations | Register for event |
| GET | /api/registrations/my | My registrations |
| DELETE | /api/registrations/:id | Cancel registration |
| GET | /api/tickets/my | My QR tickets |
| POST | /api/tickets/scan | Scan QR at entry (organizer) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/events | All events |
| PATCH | /api/admin/events/:id/approve | Approve event |
| PATCH | /api/admin/events/:id/reject | Reject event |
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/report | Participation report |
| GET | /api/admin/users | All users |
| PATCH | /api/admin/users/:id/role | Change user role |

---

## Deployment (Free Hosting)

### Backend → Render.com
1. Push code to GitHub
2. Go to render.com → New → Web Service
3. Connect GitHub repo, set root dir to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `.env.example`

### Frontend → Vercel
1. Go to vercel.com → New Project
2. Connect GitHub repo, set root dir to `frontend`
3. Add env variable: `REACT_APP_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com
2. Get connection string
3. Set `MONGO_URI` in Render environment variables

---

## UML Use Case Diagram

```
┌──────────────────────────────────────────────────────┐
│                  Campus EMS System                   │
│                                                      │
│  [Student]──────►(Browse Events)                     │
│       │──────────►(Register for Event)               │
│       │──────────►(View QR Ticket)                   │
│       │──────────►(Cancel Registration)              │
│       │──────────►(View Past Registrations)          │
│                                                      │
│  [Organizer]────►(Create Event)                      │
│       │──────────►(View Participant List)             │
│       │──────────►(Scan QR at Entry)                 │
│       │──────────►(Send Notifications)               │
│       │──────────►(Cancel Event)                     │
│                                                      │
│  [Admin]────────►(Approve / Reject Events)           │
│       │──────────►(Manage Categories)                │
│       │──────────►(Manage Users & Roles)             │
│       │──────────►(View Reports & Export CSV)        │
│       │──────────►(Monitor All Registrations)        │
│                                                      │
│  [System]───────►(Send Email Confirmation)           │
│       │──────────►(Send Push Notification)           │
│       │──────────►(Generate QR Code)                 │
└──────────────────────────────────────────────────────┘
```

---

## GitHub Upload

```bash
# Initialize git in root folder
git init
git add .
git commit -m "Initial commit: Campus EMS full-stack project"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/campus-ems.git
git branch -M main
git push -u origin main
```

---

## License
MIT — Academic project for Web Technology Digital Assignment.

# HouseHunt - Role-Based House Rent Management System (MERN Stack)

A premium, role-based MERN stack application featuring a glassmorphic dark-mode interface. The system supports three user roles: **Tenant**, **Landlord**, and **Admin** with dedicated secure dashboards, advanced property filtering, favorites wishlists, house visit bookings, notification alerts, ratings/reviews, and secure communications.

---

## 🚀 Server Details
*   **Frontend UI Client:** [http://localhost:3000/](http://localhost:3000/)
*   **Backend REST API:** [http://localhost:5000/](http://localhost:5000/)
*   **MongoDB URI:** `mongodb://localhost:27017/house-rent-db`

---

## 📁 Repository Structure
*   📁 **[backend/](file:///home/surendra-naik-mude/house-rent-management-system/backend)**: Core Node/Express server.
    *   📁 [models/](file:///home/surendra-naik-mude/house-rent-management-system/backend/models): MongoDB schemas for [User](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/User.js), [Property](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/Property.js), [Lease](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/Lease.js), [Invoice](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/Invoice.js), [Maintenance](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/Maintenance.js), [Booking](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/Booking.js), [Notification](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/Notification.js), and [Message](file:///home/surendra-naik-mude/house-rent-management-system/backend/models/Message.js).
    *   📁 [routes/](file:///home/surendra-naik-mude/house-rent-management-system/backend/routes): REST routers including [admin.js](file:///home/surendra-naik-mude/house-rent-management-system/backend/routes/admin.js), [booking.js](file:///home/surendra-naik-mude/house-rent-management-system/backend/routes/booking.js), and [notification.js](file:///home/surendra-naik-mude/house-rent-management-system/backend/routes/notification.js).
*   📁 **[frontend/](file:///home/surendra-naik-mude/house-rent-management-system/frontend)**: Vite React Single Page Application.
    *   📁 [components/](file:///home/surendra-naik-mude/house-rent-management-system/frontend/src/components): Dashboard view files for [Tenant](file:///home/surendra-naik-mude/house-rent-management-system/frontend/src/components/TenantDashboard.jsx), [Landlord](file:///home/surendra-naik-mude/house-rent-management-system/frontend/src/components/LandlordDashboard.jsx), and [Admin](file:///home/surendra-naik-mude/house-rent-management-system/frontend/src/components/AdminDashboard.jsx).

---

## ⚡ Key Role Workflows

### 1. Tenant
*   **Search Filters:** Search available properties using location, type, price ranges, configurations, and checklist amenities.
*   **Favorites List:** Save listings to a persistent wishlist.
*   **House Visit Bookings:** Schedule visit dates and time slots for properties.
*   **Inquiries & Reviews:** Chat with landlords directly or leave property ratings and reviews.
*   **Notifications:** Get notified about visit booking status changes and admin announcements.

### 2. Landlord (Property Owner)
*   **Property Listings:** CRUD property listings with type selections, checklist amenities, and descriptions.
*   **Verification Cycles:** New listings are labeled "Pending Verification" until approved by an Admin.
*   **Visit Approvals:** Review visit requests and mark them as *Approved* or *Rejected*.
*   **Leases & Billing:** Lease properties to tenants by email and issue monthly rent invoices.

### 3. Admin (Platform Manager)
*   **User Management:** View all tenants and landlords; suspend (block) or reinstate accounts.
*   **Approvals Panel:** Review all property listings and grant or revoke listings approval.
*   **Bookings Monitor:** Monitor all visits booked across the system.
*   **System Announcements:** Broadcast notifications/alerts globally to all users.
*   **Analytics Feed:** Review stats cards and registration logs.

---

## 💻 Running the Application

### Start API Server:
```bash
cd backend
node server.js
```

### Start Frontend client:
```bash
cd frontend
npm run dev -- --port 3000 --host
```

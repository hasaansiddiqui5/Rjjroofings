# RRJ Roofing & Construction, LLC — Full-Stack Web Platform & Booking Engine

A production-ready website, interactive multi-step roof inspection booking engine, before/after project showcase, and role-protected admin CRM & scheduling dashboard built for **RRJ Roofing & Construction, LLC** (`4466 Hardy St, Fort Worth, TX 76106`).

---

## 🏗️ Tech Stack & Architecture

- **Frontend & App Framework**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Styling & Aesthetics**: High-end Architectural Contractor Design System (Deep Navy `#0B1B2E`, Midnight Slate `#12263F`, Copper `#D9732B`, Off-White `#F7F5F2`)
- **Typography**: Google Fonts — *Bricolage Grotesque* (Headings), *Inter* (UI/Body), *JetBrains Mono* (Tabular figures)
- **Timezone**: Strict `America/Chicago` (Central Time) slot generation and scheduling logic
- **Database Schema**: Full PostgreSQL / Supabase / Neon compatible schema (`prisma/schema.prisma`)
- **Booking Engine**: 5-step wizard with slot engine, photo uploads, emergency storm priority triage, ICS calendar download, and self-service management portal (`#book?manage=...`)
- **Admin Dashboard**: 12 dedicated CRM and management modules with password authentication and role-based permissions (`ADMIN` / `STAFF`)

---

## 🔑 Default Admin & Staff Credentials

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | `admin@rrjroofing.com` | `FortWorthRoof2026!` |
| **Field Dispatch / Staff** | `dispatch@rrjroofing.com` | `StaffRoof2026!` |

Access the admin dashboard at `#admin` or click **"Staff / CRM Portal"** in the website footer or navigation.

---

## 🚀 Quickstart & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```
The app will run locally on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 📋 Key Modules & Features

1. **Free Roof Inspection & Emergency Booking Engine (`#book`)**
   - Step 1: Trade Service Selection (11 full-scope trades)
   - Step 2: Emergency / Storm Damage Toggle & Urgency Flag
   - Step 3: America/Chicago Dynamic Slot Picker (respects business hours, holidays, blocked dates, max bookings per slot)
   - Step 4: Property Details, Roof Type, Contact Preference, Optional Damage Photo Uploads
   - Step 5: Confirmation with reference number (e.g., `RRJ-2026-XXXX`), iCalendar (.ics) download, direct dial emergency line, and self-service management link.

2. **Interactive Before & After Image Comparison Slider**
   - Touch-enabled and mouse-draggable split screen comparing hail/storm damage against brand new architectural shingle and standing seam roofs.

3. **12-Module Admin CRM & Control Panel (`#admin`)**
   - Overview KPI Dashboard (pending triage, emergency flags, revenue pipeline, 7-day inspection chart)
   - Bookings Table (filters by status, urgency, date range, search by customer/phone/address, internal notes, photo inspection drawer, CSV export)
   - Calendar View (Month, Week, Day views with colored urgency tags)
   - Services Manager (toggle active/inactive, reorder, edit durations and copy)
   - Operating Hours & Blocked Dates (customize hours per weekday, block storm holidays)
   - Customers Directory (customer profiles, history of inspections, CSV export)
   - Before/After Projects Manager
   - Testimonials & Reviews Manager
   - Contact Inbox (inquiries and quick reply tracking)
   - Site Settings (live business phone, emergency banner notice, address)
   - User Management (Admin & Staff roles)
   - Audit & Notification Logs (tracks all actions and simulated Resend email dispatches)

4. **Self-Service Customer Appointment Management**
   - Customers can access `#book?manage=<TOKEN>` to view status, download their `.ics` invite, or reschedule their inspection slot directly.

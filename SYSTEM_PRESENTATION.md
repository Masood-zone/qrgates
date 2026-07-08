# QuickGates — System Presentation

A comprehensive guide for presenting the QuickGates Event Ticketing System to group members.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema & ORM](#4-database-schema--orm)
5. [User Roles & Activities](#5-user-roles--activities)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [System Flows](#7-system-flows)
8. [API Architecture](#8-api-architecture)
9. [Payment Integration (Paystack)](#9-payment-integration-paystack)
10. [QR Code & Ticket Verification](#10-qr-code--ticket-verification)
11. [Notification System](#11-notification-system)
12. [Design System](#12-design-system)
13. [Deployment](#13-deployment)

---

## 1. Project Overview

**QuickGates** is a modern event ticketing platform that enables event organizers to create and manage events, sell tickets with QR code generation, and verify attendees at the door. It provides role-based dashboards for users (attendees), organizers, a super admin, and security officers who handle ticket verification.

**Core Problem Solved:**
Event organizers (especially for club jams, concert parties, and campus events in Kumasi, Ghana) struggle with manual ticket sales, paper-based entry verification, and lack of attendee tracking. QuickGates digitizes the entire ticketing lifecycle — from event discovery and purchase to QR-based entry validation.

**Key Capabilities:**
- Multi-role platform: User (Attendee), Organizer, Admin, Security Officer
- Event discovery with category filtering, search, and status badges
- QR code ticket generation on purchase
- Security officer portal for real-time ticket scanning and verification
- Paystack-powered checkout with order and ticket creation
- Automated event status updates via Vercel cron
- Admin dashboard with user management, event oversight, analytics, and security officer assignment
- Organizer portal for event CRUD, attendee management, and sales tracking
- Email notifications for registration, tickets, suspension, event announcements, and security assignments

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 15.5 | Full-stack React framework with App Router |
| **UI Library** | React | 19.1 | Component-based UI rendering |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Database** | PostgreSQL | — | Relational data storage |
| **ORM** | Prisma | 7.8 | Database access, schema management, migrations |
| **DB Adapter** | PrismaPg | 7.8 | Serverless PostgreSQL driver |
| **Authentication** | NextAuth.js | latest | Session-based auth with Credentials + Email providers |
| **Payments** | Paystack | — | Online payment processing (GHS currency) |
| **State Management** | Zustand | latest | Client-side state (cart) |
| **Data Fetching** | TanStack Query | latest | Server state caching and synchronization |
| **Forms** | React Hook Form + Zod | 7.54 / 3.24 | Form handling and validation |
| **Styling** | TailwindCSS | 3.4 | Utility-first CSS framework |
| **UI Components** | Shadcn/ui + Radix UI | — | Pre-built accessible components (54 primitives) |
| **QR Codes** | qrcode | 1.5 | QR code generation (PNG data URLs) |
| **QR Scanning** | html5-qrcode / react-qr-reader | 2.3 / 3.0-beta | Camera-based QR code scanning |
| **Charts** | Recharts | 2.15 | Dashboard analytics visualizations |
| **Email** | Nodemailer | latest | Email sending with HTML templates |
| **File Uploads** | Cloudinary | 2.6 | Image upload and storage |
| **Animations** | tailwindcss-animate | 1.0 | Tailwind animation utilities |
| **Package Manager** | pnpm | — | Fast, disk-efficient dependency management |
| **Deployment** | Vercel | — | Serverless deployment with cron support |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  ┌───────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │   User    │  │ Organizer  │  │   Super Admin     │  │
│  │  Portal   │  │  Portal    │  │   Console         │  │
│  └─────┬─────┘  └─────┬──────┘  └────────┬──────────┘  │
│        │               │                  │              │
│        └───────────────┼──────────────────┘              │
│                        │                                 │
│           TanStack Query + Zustand (Cart)                │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │ HTTP (JSON)
┌────────────────────────┼─────────────────────────────────┐
│                    API LAYER (Next.js)                    │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Route Handlers (app/api/)            │    │
│  │                                                    │    │
│  │  ┌────────┐  ┌──────────┐  ┌─────────────────┐  │    │
│  │  │ User   │  │Organizer │  │   Super Admin   │  │    │
│  │  │ API    │  │ API      │  │   API           │  │    │
│  │  └───┬────┘  └────┬─────┘  └───────┬─────────┘  │    │
│  │      │             │                │             │    │
│  │  ┌───┴─────────────┴────────────────┴─────────┐  │    │
│  │  │         Auth Guards (admin-auth.ts)         │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
│                        │                                 │
│              ┌─────────┴─────────┐                       │
│              │   Services Layer  │                       │
│              │  (Business Logic) │                       │
│              └─────────┬─────────┘                       │
│                        │                                 │
│  ┌─────────────────────┼─────────────────────────────┐   │
│  │          Lib Layer (Infrastructure)                │   │
│  │  Auth │ Prisma │ Paystack │ QR │ Cloudinary │ Mail│   │
│  └─────────────────────┼─────────────────────────────┘   │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
     ┌──────┴──────┐ ┌──┴───┐ ┌──────┴──────┐
     │ PostgreSQL  │ │Paystack│ │  Cloudinary │
     │ (PrismaPg)  │ │  API  │ │  (Uploads)  │
     └─────────────┘ └──────┘ └─────────────┘
```

### 3.2 Architectural Pattern: Layered Architecture

The system follows a clean **layered architecture** with clear separation of concerns:

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Route Layer** | `app/` | Page components, layouts, route protection, API endpoints |
| **Component Layer** | `components/` | UI screens and reusable primitives (54 Shadcn components) |
| **Service Layer** | `lib/services/` | HTTP fetch wrappers, API client |
| **Store Layer** | `lib/store/` | Zustand stores (cart) |
| **Lib Layer** | `lib/` | Cross-cutting infrastructure (auth, DB, payments, QR, email, cloudinary) |
| **Type Layer** | `lib/types/` | API response contracts and data shapes |
| **Schema Layer** | `prisma/` | Domain model, migrations, seed scripts |

### 3.3 Route-Based Role Separation

Each role has its own isolated route group with a dedicated layout that enforces access:

```
app/
├── (auth)/                    # Public: Sign In, Sign Up, Forgot/Reset Password
│   ├── signin/
│   ├── signup/
│   ├── forgot-password/
│   ├── reset-password/
│   └── verify-request/
├── (dashboard)/               # Protected: Authenticated users
│   ├── layout.tsx             # Server-side session check
│   └── dashboard/
│       ├── page.tsx           # User dashboard
│       ├── orders/            # Order history
│       ├── tickets/           # Ticket list with QR codes
│       ├── profile/           # Profile management
│       └── settings/          # Account settings
├── (organizer)/               # Protected: Organizer role
│   ├── layout.tsx             # Server-side session check + isOrganizer flag
│   └── organizer/
│       ├── page.tsx           # Organizer dashboard
│       ├── events/            # Event management
│       ├── attendees/         # Attendee lists
│       ├── sales/             # Sales tracking
│       └── analytics/         # Event analytics
├── (admin)/                   # Protected: Admin role only
│   ├── layout.tsx             # Server-side session check + ADMIN role
│   └── admin/
│       ├── page.tsx           # Admin dashboard
│       ├── users/             # User management
│       ├── events/            # Event oversight
│       ├── organizers/        # Organizer management
│       ├── security/          # Security officer management
│       ├── analytics/         # Platform analytics
│       └── settings/          # Platform settings
├── security/                  # Security Officer Portal (role-specific)
│   └── [eventId]/
│       └── [securityId]/      # Per-officer, per-event scanning portal
├── events/                    # Public: Event listing and detail pages
├── checkout/                  # Checkout flow
├── cart/                      # Cart page
├── about/                     # About page
├── profile/                   # Public profile
├── api/                       # Backend API routes (role-gated per namespace)
├── page.tsx                   # Landing page
└── layout.tsx                 # Root layout (Navbar + Footer + Providers)
```

---

## 4. Database Schema & ORM

### 4.1 ORM: Prisma 7.8

- **Schema file:** `prisma/schema.prisma`
- **Database:** PostgreSQL (via PrismaPg adapter)
- **Client:** `lib/prisma.ts` (singleton with global caching)
- **Features used:** Enums, relations, cascading deletes, composite unique constraints, text fields, database indexes

### 4.2 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      User        │       │     Event        │       │   TicketType     │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)          │──┐    │ id (PK)          │
│ email (unique)   │  │    │ title            │  │    │ name             │
│ name             │  │    │ description      │  │    │ price            │
│ password         │  │    │ category         │  │    │ quantity         │
│ phone            │  │    │ location         │  │    │ soldCount        │
│ address          │  │    │ startDate        │  │    │ description      │
│ gender           │  │    │ endDate          │  │    │ eventId (FK)     │───┘
│ birthday         │  │    │ mainImage        │  │
│ role (enum)      │  │    │ price            │  │    ┌──────────────────┐
│ status (enum)    │  │    │ totalTickets     │  │    │   EventImage     │
│ isOrganizer      │  │    │ soldTickets      │  │    ├──────────────────┤
│ profileImage     │  │    │ status (enum)    │  │    │ id (PK)          │
│ emailVerified    │  │    │ organizerId (FK) │───┘    │ url              │
│ createdAt        │  │    │ createdAt        │       │ eventId (FK)     │
│ updatedAt        │  │    │ updatedAt        │       └──────────────────┘
└──────────────────┘  │    └──────────────────┘
                      │
                      │    ┌──────────────────┐
                      │    │     Ticket       │
                      │    ├──────────────────┤
                      │    │ id (PK)          │
                      │    │ qrCode (Text)    │
                      │    │ type             │
                      │    │ price            │
                      │    │ isUsed           │
                      │    │ usedAt           │
                      │    │ eventId (FK)     │
                      │    │ userId (FK)      │
                      │    │ orderId (FK)     │
                      │    │ ticketTypeId(FK) │
                      │    └──────────────────┘
                      │
                      │    ┌──────────────────┐       ┌──────────────────┐
                      │    │     Order        │       │SecurityOfficer   │
                      │    ├──────────────────┤       ├──────────────────┤
                      │    │ id (PK)          │       │ id (PK)          │
                      │    │ total            │       │ name             │
                      │    │ status (enum)    │       │ email            │
                      │    │ paymentMethod    │       │ phone            │
                      │    │ paymentId        │       │ active           │
                      │    │ reference        │       │ userId (FK)      │
                      │    │ userId (FK)      │       │ eventId (FK)     │
                      │    │ eventId (FK)     │       └──────────────────┘
                      │    │ createdAt        │
                      │    └──────────────────┘       ┌──────────────────┐
                      │                               │VerificationLog   │
                      │    ┌──────────────────┐       ├──────────────────┤
                      │    │NewsletterSubscr. │       │ id (PK)          │
                      │    ├──────────────────┤       │ ticketId (FK)    │
                      │    │ id (PK)          │       │ securityOfficerId│
                      │    │ email (unique)   │       │ eventId (FK)     │
                      │    │ userId (FK)      │       │ action           │
                      │    └──────────────────┘       │ details          │
                      │                               │ timestamp        │
                      │    ┌──────────────────┐       └──────────────────┘
                      │    │   PasswordReset  │
                      │    ├──────────────────┤       ┌──────────────────┐
                      │    │ id (PK)          │       │     About        │
                      │    │ userId (FK)      │       ├──────────────────┤
                      │    │ token            │       │ id (PK)          │
                      │    │ expires          │       │ mission/vision   │
                      │    └──────────────────┘       │ story, values    │
                      │                               │ teamMembers[]    │
          ┌───────────┴───────────────────────────────│ contact info     │
          │       NextAuth Tables                      └──────────────────┘
          │  Account │ Session │ VerificationToken     ┌──────────────────┐
          └───────────────────────────────────────────│  TeamMember      │
                                                      ├──────────────────┤
                                                      │ id (PK)          │
                                                      │ name, role, bio  │
                                                      │ image, order     │
                                                      │ aboutId (FK)     │
                                                      └──────────────────┘
```

### 4.3 Key Enums

| Enum | Values | Used In |
|------|--------|---------|
| `Role` | `USER`, `ADMIN`, `ORGANIZER`, `SECURITY` | User |
| `UserStatus` | `ACTIVE`, `SUSPENDED` | User |
| `EventStatus` | `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED` | Event |
| `OrderStatus` | `PENDING`, `COMPLETED`, `CANCELLED`, `REFUNDED` | Order |

### 4.4 Schema Conventions

- **CUID primary keys:** All core tables use `@default(cuid())` for IDs
- **UUID primary keys:** `About` and `NewsletterSubscription` use `@default(uuid())`
- **Cascading deletes:** Most relationships use `onDelete: Cascade` for automatic cleanup
- **Timestamped records:** All tables have `createdAt` and `updatedAt`
- **Table mapping:** All tables use `@@map()` for snake_case table names in PostgreSQL
- **Soft fields:** `isUsed`/`usedAt` on tickets are legacy — entry/exit logic uses `VerificationLog`
- **Password hashing:** bcrypt with salt rounds of 12
- **Seed script:** Seeds admin user, organizer user, 6 demo events (various statuses), and about page data

---

## 5. User Roles & Activities

### 5.1 Role Hierarchy

```
┌──────────────────┐
│      ADMIN       │  ← Platform operator. Manages everything.
├──────────────────┤
│   ORGANIZER      │  ← Event creator. Manages own events.
├──────────────────┤
│    SECURITY      │  ← Door staff. Scans tickets at events.
├──────────────────┤
│      USER        │  ← End user. Browses events and buys tickets.
└──────────────────┘
```

### 5.2 Role Capabilities

#### ADMIN (Platform Operator)

| Area | Activities |
|------|-----------|
| **Dashboard** | View platform-wide analytics: total users, events, revenue, ticket sales |
| **Users** | View all users, suspend/activate accounts (sends email notification) |
| **Events** | View all events, moderate listings, manage event statuses |
| **Organizers** | Create organizer accounts (with email credentials), manage organizer status |
| **Security** | Assign security officers to events (sends assignment email), manage officer status |
| **Analytics** | View revenue charts, ticket sales trends, user growth |
| **Settings** | Manage platform settings |

#### ORGANIZER (Event Creator)

| Area | Activities |
|------|-----------|
| **Dashboard** | View own event stats: total events, total tickets sold, revenue |
| **Events** | Create, edit, and manage events with multiple ticket types |
| **Attendees** | View attendee lists per event, search attendees |
| **Sales** | Track ticket sales per event, view order history |
| **Analytics** | View event-specific analytics and charts |
| **Notifications** | Receive order milestone emails (every 10 completed orders) |

#### SECURITY (Door Staff)

| Area | Activities |
|------|-----------|
| **Portal** | Access dedicated scanning portal per assigned event |
| **Scan** | Scan attendee QR codes via camera for real-time verification |
| **Verify** | Check ticket validity (correct event, not already used) |
| **Log** | All scans are logged with timestamp, officer ID, and action type |

#### USER (Attendee)

| Area | Activities |
|------|-----------|
| **Browse** | Discover events by category, search, and status |
| **Purchase** | Add tickets to cart, complete Paystack checkout |
| **Dashboard** | View purchased tickets with QR codes, order history |
| **Profile** | Manage personal information and account settings |
| **Cart** | Multi-item cart with expiration handling |

---

## 6. Authentication & Authorization

### 6.1 Authentication: NextAuth.js

The system uses **NextAuth.js** with the Prisma adapter and JWT session strategy.

**Configuration** (`lib/auth.ts`):
- **Credentials Provider:** Email + password with bcrypt verification
- **Email Provider:** Magic link authentication via Nodemailer
- **Session strategy:** JWT (not database sessions)
- **Custom JWT fields:** `id`, `role`, `isOrganizer`
- **Suspended user blocking:** Login returns `null` for suspended accounts
- **Custom pages:** `/auth/signin`, `/auth/error`, `/auth/verify-request`

**Flow:**
1. User submits email + password at `/auth/signin`
2. NextAuth verifies credentials against the database (bcrypt compare)
3. If the user is suspended, authentication fails
4. JWT token is created with user ID, role, and organizer flag
5. Session is established and stored as an HTTP-only cookie
6. Every subsequent request includes the session cookie

### 6.2 Authorization: Server-Side Role Guards

Access control is enforced at **two levels**:

#### Level 1: Route Layouts (Server Components)

Each role's layout file performs a server-side session check and redirects unauthorized users:

```typescript
// app/(admin)/admin/layout.tsx (simplified)
const user = await getCurrentUser();
if (!user) redirect("/auth/signin");
if (user.role !== "ADMIN") redirect("/dashboard");
```

| Route Group | Allowed Roles |
|-------------|--------------|
| `/dashboard/*` | Any authenticated user |
| `/organizer/*` | Users with `isOrganizer = true` |
| `/admin/*` | `ADMIN` role only |
| `/security/*` | `SECURITY` role (per-event assignment) |

#### Level 2: API Route Guards

Each API namespace has a guard function that validates the session:

| Guard | File | Checks |
|-------|------|--------|
| `requireAdmin()` | `lib/admin-auth.ts` | Session exists, role is ADMIN, account not suspended |
| `getServerSession(authOptions)` | Various API routes | Session exists (used in organizer/user routes) |

---

## 7. System Flows

### 7.1 User Registration & Onboarding Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│   User   │    │   Auth UI    │    │   NextAuth   │    │  Database  │
│          │    │              │    │   API        │    │            │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘
     │                 │                   │                   │
     │  1. Visit /auth/signup             │                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │  2. Fill: name, email, password    │                   │
     │  ─────────────>│                   │                   │
     │                 │  3. POST /api/auth/callback/credentials
     │                 │  ─────────────────>│                   │
     │                 │                   │                   │
     │                 │  4. Hash password (bcrypt)           │
     │                 │  5. Create User record               │
     │                 │  6. Create Account record            │
     │                 │  ────────────────────────────────────>│
     │                 │                   │                   │
     │                 │  7. Send registration confirmation email
     │                 │                   │                   │
     │  8. Redirect to dashboard          │                   │
     │  <──────────────│                   │                   │
```

### 7.2 Event Discovery & Ticket Purchase Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│   User   │    │   Event UI   │    │   Payment    │    │  Database  │
│          │    │              │    │   API        │    │            │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘
     │                 │                   │                   │
     │  1. Browse events (/events)        │                   │
     │  ─────────────>│                   │                   │
     │                 │  2. GET /api/events                  │
     │                 │  ─────────────────────────────────────>│
     │                 │                   │                   │
     │  3. Select event, choose ticket type                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │  4. Add to cart (Zustand)          │                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │  5. Go to checkout                 │                   │
     │  ─────────────>│                   │                   │
     │                 │  6. POST /api/checkout               │
     │                 │  ─────────────────>│                   │
     │                 │                   │                   │
     │                 │  7. Create Order (PENDING)            │
     │                 │  8. Create Tickets (QR codes)        │
     │                 │  9. Decrement TicketType.soldCount   │
     │                 │  ────────────────────────────────────>│
     │                 │                   │                   │
     │                 │  10. Initialize Paystack payment     │
     │                 │  ─────────────────>│                   │
     │                 │                   │                   │
     │                 │  11. Return authorization_url        │
     │                 │  <────────────────────────────────────│
     │                 │                   │                   │
     │  12. Redirect to Paystack          │                   │
     │  <──────────────│                   │                   │
     │                 │                   │                   │
     │  13. Complete payment              │                   │
     │  ─────────────────────────────────>│                   │
     │                 │                   │                   │
     │  14. Paystack callback → /checkout/verify             │
     │  ─────────────>│                   │                   │
     │                 │  15. POST /api/payments/verify       │
     │                 │  ─────────────────>│                   │
     │                 │                   │                   │
     │                 │  16. Verify with Paystack API        │
     │                 │  17. Update Order → COMPLETED        │
     │                 │  18. Generate QR codes for tickets   │
     │                 │  19. Send ticket email with QR codes │
     │                 │  20. Notify organizer (milestone)    │
     │                 │  ────────────────────────────────────>│
     │                 │                   │                   │
     │  21. "Payment successful!"         │                   │
     │  <──────────────│                   │                   │
```

### 7.3 Security Officer Ticket Verification Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│ Security │    │  Scanner UI  │    │  Security    │    │  Database  │
│ Officer  │    │              │    │  API         │    │            │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘
     │                 │                   │                   │
     │  1. Open portal: /security/:eventId/:securityId        │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │  2. Camera activates (html5-qrcode)│                   │
     │  <──────────────│                   │                   │
     │                 │                   │                   │
     │  3. Scan attendee's QR code        │                   │
     │  ─────────────>│                   │                   │
     │                 │  4. POST /api/security/verify-ticket │
     │                 │  ─────────────────>│                   │
     │                 │                   │                   │
     │                 │  5. Decode QR data                    │
     │                 │  6. Find ticket by ID                 │
     │                 │  7. Verify ticket belongs to event    │
     │                 │  8. Check not already used            │
     │                 │  9. Mark ticket as used               │
     │                 │  10. Create VerificationLog           │
     │                 │     (action: SCANNED/ENTRY)          │
     │                 │  ────────────────────────────────────>│
     │                 │                   │                   │
     │  11. "Ticket valid! Entry allowed" │                   │
     │  <──────────────│                   │                   │
     │                 │                   │                   │
     │  OR: "Ticket already used" / "Invalid ticket"          │
     │  <──────────────│                   │                   │
```

### 7.4 Automated Event Status Update Flow

A Vercel cron job runs daily to update event statuses:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Vercel     │    │   Cron       │    │  Database    │
│   Cron       │    │   Handler    │    │              │
│  (00:00 UTC) │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └─────┬────────┘
       │                   │                   │
       │  1. GET /api/cron (Bearer token auth)│
       │  ──────────────>│                   │
       │                 │                   │
       │                 │  2. Verify CRON_SECRET
       │                 │                   │
       │                 │  3. UPCOMING → ONGOING:
       │                 │     Where startDate <= now < endDate
       │                 │  ─────────────────>│
       │                 │                   │
       │                 │  4. ONGOING → COMPLETED:
       │                 │     Where endDate <= now
       │                 │  ─────────────────>│
       │                 │                   │
       │                 │  5. Fix statuses:
       │                 │     Where startDate > now → UPCOMING
       │                 │  ─────────────────>│
       │                 │                   │
       │  6. Return update counts          │
       │  <──────────────│                   │
```

**Schedule:** Every day at 00:00 UTC (configured in `vercel.json`)

---

## 8. API Architecture

### 8.1 API Route Structure

All backend endpoints live under `app/api/`:

```
app/api/
├── auth/[...nextauth]/route.ts    # NextAuth catch-all handler
├── auth/actions.ts                # Server-side auth helpers (getCurrentUser)
├── cron/route.ts                  # Vercel cron for event status updates
├── events/
│   ├── route.ts                   # GET public events, POST create (organizer)
│   ├── [id]/route.ts              # GET/PATCH/DELETE event
│   └── status-update/route.ts     # PATCH event status
├── checkout/route.ts              # POST create order from cart
├── payments/
│   ├── initialize/route.ts        # POST initialize Paystack payment
│   └── verify/route.ts            # POST verify Paystack payment
├── orders/route.ts                # GET user orders
├── tickets/
│   ├── route.ts                   # GET user tickets
│   ├── mark-used/route.ts         # PATCH mark ticket as used
│   └── verify/route.ts            # GET verify ticket QR code
├── security/
│   ├── route.ts                   # GET security officers
│   ├── [id]/route.ts              # GET/PATCH security officer
│   ├── verify-ticket/route.ts     # POST verify ticket at door
│   ├── mark-ticket-used/route.ts  # PATCH mark ticket used by officer
│   └── stats/route.ts             # GET verification stats
├── admin/
│   ├── users/route.ts             # GET/PATCH user management
│   ├── events/route.ts            # GET admin event oversight
│   ├── organizers/route.ts        # GET/PATCH organizer management
│   ├── security/route.ts          # GET/PATCH security officer management
│   ├── analytics/route.ts         # GET platform analytics
│   ├── seed-admins/route.ts       # POST seed admin users
│   └── seed-organizers/route.ts   # POST seed organizer users
├── users/route.ts                 # GET/PATCH user profile
├── newsletter/route.ts            # POST newsletter subscription
├── about/route.ts                 # GET about page data
├── sales/route.ts                 # GET sales data
└── upload/route.ts                # POST file upload (Cloudinary)
```

### 8.2 Standard API Response Envelope

Every API endpoint returns a consistent JSON structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
```

**Success example:**
```json
{
  "success": true,
  "data": { "events": [...], "pagination": { "page": 1, "total": 25 } }
}
```

**Error example:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 8.3 API Route Pattern

Every protected API route follows the same structure:

```typescript
export async function GET(request: Request) {
  try {
    // 1. Auth guard
    const { error, user } = await requireAdmin();
    if (error) return error;

    // 2. Query Prisma
    const data = await prisma.event.findMany({ ... });

    // 3. Return consistent envelope
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 9. Payment Integration (Paystack)

### 9.1 Overview

The system integrates **Paystack** for processing ticket purchases in **GHS (Ghanaian Cedi)**.

### 9.2 Payment Flow

```
1. User clicks "Checkout" in cart
         │
2. Client calls POST /api/checkout
         │
3. Server creates Order (PENDING) + Tickets (with QR codes)
         │
4. Server decrements TicketType.soldCount
         │
5. Client calls POST /api/payments/initialize
         │
6. Server calls Paystack /transaction/initialize API
         │
7. Paystack returns authorization_url + reference
         │
8. User redirected to Paystack payment page
         │
9. User completes payment
         │
10. Paystack redirects to /checkout/verify?reference=...
         │
11. Client calls POST /api/payments/verify with reference
         │
12. Server calls Paystack /transaction/verify/:reference
         │
13. If successful:
    - Order status → COMPLETED
    - Payment ID and reference saved
    - QR code PNG attachments built from ticket data
    - Ticket email sent with QR codes as inline images
    - Organizer notified (every 10th order milestone)
```

### 9.3 Key Implementation Details

| Aspect | Detail |
|--------|--------|
| **Currency** | GHS (Ghanaian Cedi) |
| **Amount conversion** | Converted to Paystack subunits (×100) via `Math.round(amount * 100)` |
| **Reference format** | Auto-generated by Paystack |
| **Duplicate prevention** | Order status checked before completing |
| **Server-side verify** | Payment status is always verified server-side via Paystack API |
| **Error handling** | Custom `PaystackError` class with status codes |

### 9.4 Environment Variables

```
PAYSTACK_SECRET_KEY=sk_...       # Server-side secret
PAYSTACK_BASE_URL=https://api.paystack.co  # API base URL
```

---

## 10. QR Code & Ticket Verification

### 10.1 QR Code Generation

When a payment is completed, QR codes are generated for each ticket:

```typescript
// lib/qr-code.ts
interface QRCodeData {
  eventId: string;
  userId: string;
  orderId: string;
  ticketNumber: number;
  timestamp: number;
}

// Generates a PNG data URL
export async function generateQRCode(data: QRCodeData): Promise<string> {
  const qrString = JSON.stringify(data);
  return await QRCode.toDataURL(qrString, { errorCorrectionLevel: "H" });
}
```

The QR code encodes a JSON payload with event, user, and order identifiers. The PNG data URL is stored in the ticket's `qrCode` field and attached to the confirmation email.

### 10.2 Ticket Verification

Security officers use a dedicated portal at `/security/:eventId/:securityId` that activates the device camera via `html5-qrcode`. When a QR code is scanned:

1. The QR data is decoded (JSON with event/user/order/ticket info)
2. The ticket is looked up in the database
3. Verification checks:
   - Does the ticket belong to this event?
   - Has it already been used?
4. If valid: ticket is marked as used, a `VerificationLog` entry is created
5. If invalid: appropriate error message is shown

### 10.3 Verification Log

Every scan creates a `VerificationLog` record:

| Field | Purpose |
|-------|---------|
| `ticketId` | Which ticket was scanned |
| `securityOfficerId` | Which officer performed the scan |
| `eventId` | Which event this was for |
| `action` | SCANNED, MARKED_USED, ENTRY, or EXIT |
| `details` | Additional context |
| `timestamp` | When the scan occurred |

---

## 11. Notification System

### 11.1 Email Notifications

The system sends branded HTML emails via **Nodemailer** for various events:

| Event | Recipient | Template |
|-------|-----------|----------|
| User registration | New user | `registrationConfirmationEmail` |
| Organizer onboarding | New organizer | `organizerOnboardingEmail` (with credentials) |
| Ticket purchase | Buyer | `purchaseConfirmationEmail` (with QR codes as attachments) |
| Purchase failure | Buyer | `purchaseFailureEmail` |
| Ticket scan | Ticket holder | `ticketScanNotificationEmail` |
| Account suspended | Suspended user | `accountSuspendedEmail` |
| New event announcement | All active users | `newEventAnnouncementEmail` (BCC) |
| Order milestone | Organizer | `organizerOrderMilestoneEmail` (every 10 orders) |
| Security assignment | Assigned officer | `securityOfficerAssignmentEmail` (with portal link) |

### 11.2 Email Infrastructure

- **Transporter:** Nodemailer with SMTP configuration
- **Templates:** HTML string templates with inline styles (no React Email)
- **Logo:** Cloudinary-hosted QuickGates logo
- **Error handling:** `sendSafeMail()` wraps all sends in try/catch — email failures don't block core operations

### 11.3 Newsletter

A simple email subscription endpoint (`POST /api/newsletter`) stores subscriber emails in the `NewsletterSubscription` table with a unique constraint.

---

## 12. Design System

### 12.1 Design Philosophy

> A clean, modern design with light/dark theme support, HSL-based CSS custom properties, and a refined component library built on Shadcn/ui primitives.

### 12.2 Theme System

The app uses CSS custom properties (HSL) for theming with TailwindCSS:

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | Near-white | Near-black | Page backgrounds |
| `--foreground` | Near-black | Near-white | Primary text |
| `--primary` | Brand color | Brand color | Actions, navigation |
| `--primary-foreground` | Contrast | Contrast | Text on primary |
| `--card` | White | Dark surface | Card backgrounds |
| `--muted` | Light gray | Dark gray | Secondary elements |
| `--accent` | Subtle highlight | Subtle highlight | Hover states |
| `--destructive` | Red | Red | Error/delete actions |
| `--border` | Light border | Dark border | Separators |
| `--ring` | Focus ring | Focus ring | Accessibility focus |
| `--sidebar-*` | Sidebar tokens | Sidebar tokens | Sidebar navigation |

### 12.3 Typography

| Element | Font | Rationale |
|---------|------|-----------|
| **All text** | Inter (Google Fonts) | Clean, readable, modern sans-serif |

### 12.4 Component Library

Built on **Shadcn/ui** with **Radix UI** primitives (54 components):

| Category | Components |
|----------|-----------|
| **Layout** | Accordion, Aspect Ratio, Collapsible, Resizable, Scroll Area, Separator |
| **Navigation** | Breadcrumb, Navigation Menu, Menubar, Tabs, Sidebar |
| **Forms** | Button, Checkbox, Input, Label, Radio Group, Select, Slider, Switch, Textarea, Toggle, Toggle Group |
| **Data Display** | Avatar, Badge, Card, Table, Calendar, Command |
| **Feedback** | Alert, Alert Dialog, Dialog, Drawer, Hover Card, Popover, Sonner (toast), Tooltip |
| **Overlay** | Context Menu, Dropdown Menu, Sheet |
| **Charts** | Recharts (Line, Bar, Area, Pie charts) |
| **Specialized** | Image Upload, Image Gallery Upload, Ticket Type Selector, Input OTP, Loading, Skeleton |

---

## 13. Deployment

### 13.1 Platform: Vercel

- **Framework preset:** Next.js (auto-detected)
- **Build command:** `prisma generate && prisma migrate deploy && next build`
- **Cron jobs:** Configured in `vercel.json` — daily event status updates at 00:00 UTC

### 13.2 Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | NextAuth session secret |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `NEXTAUTH_URL` | App base URL |
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` | Public app URL for email links |
| `CRON_SECRET` | Bearer token for Vercel cron endpoint |
| `PAYSTACK_SECRET_KEY` | Paystack server-side key |
| `PAYSTACK_BASE_URL` | Paystack API base URL |
| `EMAIL_FROM` / `EMAIL_USER` | Sender email address |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_PASS` | SMTP configuration |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Image upload config |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin credentials |
| `SEED_ORGANIZER_EMAIL` / `SEED_ORGANIZER_PASSWORD` | Seed organizer credentials |

### 13.3 Build & Deploy

```bash
# Install dependencies
pnpm install

# Set up database
pnpm prisma migrate dev     # Run migrations
pnpm seed:admin             # Seed admin, organizer, demo events, about data

# Development
pnpm dev                    # Start Next.js dev server

# Production
pnpm build                  # Generate Prisma client, run migrations, build Next.js
pnpm start                  # Start production server

# Type checking & linting
pnpm lint                   # ESLint
```

---

## Summary

The **QuickGates Event Ticketing System** is a well-structured, production-ready platform for event management and ticket sales. Its key architectural strengths are:

1. **Role-based isolation** — Four separate portals (User, Organizer, Admin, Security) with server-side enforcement at both the layout and API levels
2. **Clean layered architecture** — Routes, components, services, lib, and types are clearly separated with consistent patterns
3. **Prisma + PostgreSQL** — Strong typing, migrations, and relational integrity for complex multi-entity data
4. **QR code ticketing** — End-to-end flow from purchase to generation to scanning with full audit trail
5. **Secure payments** — Server-side Paystack integration with reference verification and order completion
6. **Automated workflows** — Cron-driven event status updates, order milestone notifications, and security assignment emails
7. **Comprehensive email system** — 9 distinct email templates covering the entire user lifecycle
8. **Security officer portal** — Dedicated camera-based QR scanning interface with real-time verification
9. **Consistent API design** — Every endpoint follows the same guard → query → respond pattern

# QuickGates

A modern event ticketing platform with QR code generation, event discovery, admin dashboard, and security officer portal. Built with Next.js 15, React 19, Prisma 7 (PostgreSQL), TailwindCSS, and Shadcn/UI.

---

## Folder Structure

```
QuickGates/
│
├── app/
│   ├── (admin)/admin/          # Admin dashboard pages
│   ├── (dashboard)/            # User dashboard
│   ├── (organizer)/organizer/  # Organizer event management
│   ├── api/
│   │   ├── admin/              # Admin API routes (users, events, organizers, analytics, security)
│   │   ├── auth/               # Authentication (NextAuth)
│   │   ├── cron/               # Vercel cron for event status updates
│   │   ├── events/             # Public and organizer event endpoints
│   │   ├── newsletter/         # Newsletter subscription
│   │   ├── orders/             # Order management
│   │   ├── payments/           # Paystack integration
│   │   ├── sales/              # Ticket sales data
│   │   ├── security/           # Security officer ticket verification
│   │   ├── tickets/            # Ticket CRUD and scanning
│   │   ├── users/              # User profiles and management
│   │   └── about/              # About page data
│   ├── auth/                   # Auth pages (signin, signup, verify)
│   ├── events/                 # Public event pages
│   ├── security/               # Security officer portal
│   ├── checkout/               # Checkout flow
│   └── assets/designs/         # Design mockups and references
│
├── components/
│   ├── admin/                  # Admin dashboard components
│   ├── home/                   # Landing page sections (hero, features, stats, etc.)
│   ├── events/                 # Public event cards and listing page
│   ├── organizer/              # Organizer event management components
│   ├── dashboard/              # User dashboard components
│   ├── security/               # Security scanning components
│   ├── checkout/               # Checkout and payment components
│   ├── layout/                 # Navbar, footer, navigation progress
│   └── ui/                     # Shared Shadcn/UI primitives
│
├── lib/
│   ├── api/                    # Client-side API helpers (events, about, orders, etc.)
│   ├── store/                  # Zustand stores (cart)
│   ├── services/               # HTTP fetch wrappers
│   ├── types/                  # TypeScript type definitions
│   ├── email/                  # Nodemailer templates and notification dispatchers
│   ├── payments/               # Payment processing utilities
│   ├── auth.ts                 # NextAuth configuration
│   ├── prisma.ts               # Prisma client (PrismaPg adapter)
│   ├── admin-auth.ts           # Admin role guard middleware
│   ├── paystack.ts             # Paystack payment integration
│   ├── qr-code.ts              # QR code generation
│   ├── date-utils.ts           # Date formatting helpers
│   ├── event-categories.ts     # Event category definitions and normalization
│   ├── cart-utils.ts           # Cart item expiration utilities
│   └── cloudinary.ts           # Image uploads
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script (admin, organizer, demo events, about)
│   └── migrations/
│
├── prisma.config.ts            # Prisma 7 datasource config
├── pnpm-workspace.yaml         # Build permissions for native deps
├── vercel.json                 # Vercel cron schedule
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
└── tsconfig.json
```

---

## Key Features

- **Event Discovery** -- Public listing with category filtering, search, and status badges
- **Centralized Event Categories** -- Unified category definitions with normalization and legacy value mapping
- **QR Code Tickets** -- Generation on purchase, scanning for entry verification
- **Admin Dashboard** -- User management, event oversight with image gallery uploads, organizer control, analytics, security officer management
- **User Suspension** -- Admins can suspend users; suspended accounts are blocked at login with email notifications
- **Organizer Portal** -- Event CRUD, attendee management, ticket sales tracking, order milestone notifications
- **Security Officer Portal** -- QR-based ticket verification per event
- **Automated Cron** -- Vercel cron updates event statuses (UPCOMING -> ONGOING -> COMPLETED)
- **Checkout Flow** -- Paystack-powered payment with order and ticket creation
- **Cart Expiration Handling** -- Automatic pruning of expired cart items and blocking past event purchases
- **Navigation Progress** -- Visual progress indicator during page transitions
- **Email Notifications** -- Branded emails for registration, tickets, account suspension, and event announcements
- **Newsletter** -- Email subscription endpoint
- **Responsive UI** -- TailwindCSS with refined light/dark theme tokens

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL via Prisma 7 + PrismaPg adapter |
| Auth | NextAuth.js |
| Payments | Paystack (Ghana Cedis) |
| Styling | TailwindCSS + Shadcn/UI |
| State | Zustand (cart), React Query (server data) |
| Email | Nodemailer |
| Hosting | Vercel |

---

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Fill in DATABASE_URL, JWT_SECRET, CRON_SECRET, NEXTAUTH_SECRET, etc.
   ```

3. **Run migrations and seed:**
   ```bash
   pnpm prisma migrate dev
   pnpm seed:admin
   ```

4. **Start the dev server:**
   ```bash
   pnpm dev
   ```

---

## Seed Script

```bash
pnpm seed:admin
```

Seeds an admin user, an organizer user, six demo events (various statuses), and about page data. Credentials and details can be overridden via environment variables (see `prisma/seed.ts`).

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | NextAuth session secret |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `NEXTAUTH_URL` | App base URL |
| `CRON_SECRET` | Bearer token for Vercel cron endpoint |
| `PAYSTACK_SECRET_KEY` | Paystack payment integration |
| `PAYSTACK_BASE_URL` | Paystack API base URL (defaults to https://api.paystack.co) |
| `EMAIL_FROM` / `EMAIL_USER` | Sender email address for notifications |
| `EMAIL_HOST` / `EMAIL_PORT` | SMTP server configuration |
| `CLOUDINARY_*` | Image upload configuration |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin credentials |
| `SEED_ORGANIZER_EMAIL` / `SEED_ORGANIZER_PASSWORD` | Seed organizer credentials |

---

## License

This project is for educational and demonstration purposes.

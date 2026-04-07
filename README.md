<p align="center">
  <img src="public/logo.svg" alt="Subscrip Logo" width="80" height="80" />
</p>

<h1 align="center">Subscrip</h1>

<p align="center">
  <strong>Smart subscription management for your personal and business finances</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#license">License</a>
</p>

---

## 🎯 About

**Subscrip** is a SaaS platform designed to solve the "invisible money leak" problem — users who lose track of multiple active subscriptions (Netflix, AWS, Vercel, gyms, etc.) and end up paying for services they don't use or being surprised by unexpected renewals.

### The Problem

- 💸 Forgotten subscriptions draining your bank account
- 😱 Surprise charges from annual renewals
- 🌍 Difficulty tracking costs in multiple currencies
- 📅 No centralized view of upcoming bills

### The Solution

Subscrip provides a unified dashboard to track, manage, and get alerts for all your subscriptions in one place.

---

## ✨ Features

### 📊 Dashboard Overview
- **Monthly & Annual spending** estimates with real-time currency conversion
- **Active subscriptions** count at a glance
- **Next billing date** with countdown alerts
- **Spending by category** visualization (charts)

### 📁 Subscription Management
- **Categorized view** — Entertainment, Infrastructure, Tools, Education, Fitness, and more
- **Pre-populated service database** — 30+ popular services (Netflix, Spotify, AWS, Vercel, Notion, etc.) with official pricing and cancellation links
- **Quick actions** — Edit, pause, or cancel subscriptions
- **Multi-currency support** — BRL, USD, EUR with automatic conversion

### 🔔 Smart Reminders
- **Email notifications** — Get alerts X days before billing (1, 3, 7, or 14 days)
- **Browser push notifications** — Never miss a renewal
- **Weekly digest** — Summary of upcoming charges
- **Per-subscription settings** — Customize reminder preferences for each service

### 👤 User Profile
- **Theme preference** — Dark/Light mode with system detection
- **Default currency** — Set your preferred display currency
- **Notification settings** — Global reminder preferences
- **Account management** — Update profile or delete account

### 🎨 Design
- **Mobile-first responsive design** — Works seamlessly on all devices
- **Dark & Light mode** — Beautiful UI in both themes
- **Smooth animations** — GSAP-powered micro-interactions
- **Accessible components** — Built with Radix UI primitives

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router & Server Components |
| **TypeScript** | Type-safe development |
| **React 19** | UI library with latest features |
| **Tailwind CSS 4** | Utility-first styling |
| **Shadcn UI** | Accessible component library (Radix UI based) |
| **GSAP** | Professional-grade animations |
| **next-themes** | Dark/Light mode with persistence |

### State & Forms

| Technology | Purpose |
|---|---|
| **Redux Toolkit** | Global state management |
| **React Hook Form** | Performant form handling |
| **Zod** | Schema validation |

### Backend

| Technology | Purpose |
|---|---|
| **Next.js Server Actions** | Type-safe server mutations |
| **Better Auth** | Modern authentication with OTP |
| **Prisma** | Type-safe ORM |
| **PostgreSQL** | Relational database |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Vercel** | Hosting & Edge Functions |
| **Neon** | Serverless PostgreSQL |
| **Resend** | Transactional emails |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** (recommended) or npm/yarn
- **Docker** (for local PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jhiltonsantos/subscrip.git
   cd subscrip
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   The default `.env.example` is pre-configured for Docker local development.

4. **Start PostgreSQL with Docker**
   ```bash
   pnpm docker:up
   ```
   This starts a PostgreSQL 16 container on `localhost:5432`.

5. **Set up the database**
   ```bash
   pnpm db:generate   # Generate Prisma Client
   pnpm db:push       # Sync schema to database
   pnpm db:seed       # Seed with sample data
   ```
   
   Or run all at once:
   ```bash
   pnpm setup
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm docker:up` | Start PostgreSQL container |
| `pnpm docker:down` | Stop PostgreSQL container |
| `pnpm db:studio` | Open Prisma Studio (database GUI) |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm setup` | Full setup (docker + generate + push + seed) |

### Test User

After seeding, you can use:
- **Email:** `test@subscrip.dev`

---

## 🗺 Roadmap

- [x] Project foundation & database schema
- [x] Authentication system (passwordless)
- [ ] Landing page with GSAP animations
- [ ] Complete dashboard with metrics
- [ ] Subscription CRUD operations
- [ ] Pre-populated service templates
- [ ] Email & push notification reminders
- [ ] Currency conversion API integration
- [ ] Analytics & spending charts
- [ ] User settings & preferences

---

## 🎨 Design System

### Color Palette

The design uses an **Emerald green** palette, conveying **financial control**, **growth**, and **security**.

| Mode | Primary | Background | Foreground |
|---|---|---|---|
| Light | `#10B981` | `#FFFFFF` | `#111827` |
| Dark | `#34D399` | `#111827` | `#F9FAFB` |

### Responsive Breakpoints

| Breakpoint | Width | Target |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

---

## � Project Structure

```
src/
├── app/                                    # App Router (Next.js 16)
│   ├── layout.tsx                          # Root Layout (providers, fonts)
│   ├── globals.css                         # Global styles
│   │
│   ├── (landing)/                          # Route Group: Landing pages
│   │   ├── layout.tsx                      # → LandingLayout
│   │   └── page.tsx                        # → URL: /
│   │
│   ├── (auth)/                             # Route Group: Authentication
│   │   ├── layout.tsx                      # → AuthLayout
│   │   └── auth/
│   │       ├── login/page.tsx              # → URL: /auth/login
│   │       └── register/page.tsx           # → URL: /auth/register
│   │
│   ├── (platform)/                         # Route Group: Authenticated platform
│   │   ├── layout.tsx                      # Server: session check
│   │   ├── layout-client.tsx               # Client: PlatformLayout wrapper
│   │   └── dashboard/page.tsx              # → URL: /dashboard
│   │
│   └── api/auth/[...all]/route.ts          # Better Auth API handler
│
├── components/
│   ├── layouts/                            # Reusable layout components
│   │   ├── index.ts                        # Exports
│   │   ├── landing-layout.tsx              # Public header + children
│   │   ├── auth-layout.tsx                 # Minimal header + background
│   │   └── platform-layout.tsx             # Authenticated header + sidebar
│   ├── ui/                                 # shadcn/ui components
│   ├── locale-link.tsx                     # Link with locale support
│   └── locale-switcher.tsx                 # Language selector
│
├── lib/
│   ├── proxy/                              # Modular proxy logic
│   │   ├── index.ts                        # Exports
│   │   ├── auth.ts                         # Authentication logic
│   │   └── i18n.ts                         # Internationalization logic
│   │
│   ├── i18n/                               # next-intl configuration
│   │   ├── config.ts                       # Locales config (en, pt)
│   │   ├── request.ts                      # getRequestConfig
│   │   └── server-translations.ts          # Server-side translation helper
│   │
│   ├── utils/
│   │   ├── helpers.ts                      # cn(), etc.
│   │   └── formatters.ts                   # formatCurrency(), etc.
│   │
│   ├── auth.ts                             # Better Auth server config
│   ├── auth-client.ts                      # Better Auth client
│   └── prisma.ts                           # Prisma client
│
├── server/
│   └── actions/
│       └── auth.ts                         # Server actions (signOut, getSession)
│
├── translations/
│   ├── client/                             # UI translations (next-intl)
│   │   ├── en.json
│   │   └── pt.json
│   └── server/                             # Server-only translations (emails)
│       ├── en.json
│       └── pt.json
│
└── proxy.ts                                # Proxy entry point
```

### Route Groups

Next.js App Router uses **Route Groups** `(name)` to organize routes without affecting URLs:

| Route Group | Purpose | Layout |
|---|---|---|
| `(landing)` | Public landing pages | `LandingLayout` |
| `(auth)` | Authentication pages (login, register) | `AuthLayout` |
| `(platform)` | Authenticated platform pages | `PlatformLayout` |

### Proxy vs Middleware

This project uses `proxy.ts` instead of `middleware.ts`:

| Aspect | `middleware.ts` | `proxy.ts` |
|---|---|---|
| **Runtime** | Edge Runtime (limited) | Node.js Runtime (full) |
| **Location** | `src/middleware.ts` | `src/proxy.ts` (Next.js 16+) |
| **API Access** | Limited (no fs, prisma) | Full (any Node.js lib) |
| **Recommended for** | Simple redirects | Complex auth, i18n |

### Proxy Flow

```
Request → proxy.ts
              │
              ├─→ 1. stripLocalePrefix()     [lib/proxy/i18n.ts]
              │       Extract locale from URL (/pt/dashboard → pt)
              │
              ├─→ 2. Skip /api/*
              │
              ├─→ 3. checkAuth()             [lib/proxy/auth.ts]
              │       Check session and return action
              │       → redirect to /dashboard (if logged in on /auth/*)
              │       → redirect to /auth/login (if not logged in on protected route)
              │       → next (continue)
              │
              └─→ 4. handleLocaleRewrite()   [lib/proxy/i18n.ts]
                      Rewrite /pt/* → /* with x-locale header
                      Set NEXT_LOCALE cookie
```

### Internationalization (i18n)

URLs follow the pattern:
- **English (default):** `/dashboard`, `/auth/login`
- **Portuguese:** `/pt/dashboard`, `/pt/auth/login`

The proxy rewrites `/pt/*` routes internally while setting the locale via cookie and header.

---

## �📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Hilton Santos**

- GitHub: [@jhiltonsantos](https://github.com/jhiltonsantos)

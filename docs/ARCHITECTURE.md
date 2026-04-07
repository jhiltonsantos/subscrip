# Architecture

This document describes the project architecture, design patterns, and conventions used in Subscrip.

## Table of Contents

- [Project Structure](#project-structure)
- [App Router & Route Groups](#app-router--route-groups)
- [Layouts System](#layouts-system)
- [Proxy System](#proxy-system)
- [Internationalization (i18n)](#internationalization-i18n)
- [Authentication](#authentication)
- [Design Patterns](#design-patterns)

---

## Project Structure

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
│   ├── global/                             # Global reusable components
│   │   ├── index.ts                        # Exports
│   │   ├── LocaleLink.tsx                  # Link with locale support
│   │   └── LocaleSwitcher.tsx              # Language selector
│   ├── layout/                             # Layout components
│   │   ├── index.ts                        # Exports
│   │   ├── Header.tsx                      # Header with variants (landing, auth, platform)
│   │   ├── LandingLayout.tsx               # Public layout
│   │   ├── AuthLayout.tsx                  # Auth pages layout
│   │   └── PlatformLayout.tsx              # Authenticated platform layout
│   └── ui/                                 # shadcn/ui components
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

---

## App Router & Route Groups

### What are Route Groups?

Route Groups are a Next.js App Router feature that allows organizing routes **without affecting the URL structure**. They are created by wrapping folder names in parentheses: `(name)`.

### Our Route Groups

| Route Group | Purpose | Layout | Protected |
|---|---|---|---|
| `(landing)` | Public landing pages | `LandingLayout` | No |
| `(auth)` | Authentication pages | `AuthLayout` | No (redirects if logged in) |
| `(platform)` | Authenticated platform | `PlatformLayout` | Yes |

### URL Mapping

```
src/app/(landing)/page.tsx          → /
src/app/(auth)/auth/login/page.tsx  → /auth/login
src/app/(auth)/auth/register/page.tsx → /auth/register
src/app/(platform)/dashboard/page.tsx → /dashboard
```

---

## Layouts System

### Architecture

```
RootLayout (app/layout.tsx)
    │
    ├── (landing)/layout.tsx → LandingLayout
    │       └── page.tsx
    │
    ├── (auth)/layout.tsx → AuthLayout
    │       └── auth/login/page.tsx
    │       └── auth/register/page.tsx
    │
    └── (platform)/layout.tsx → PlatformLayout (with session check)
            └── dashboard/page.tsx
```

### Layout Components

Located in `src/components/layout/`:

#### `Header.tsx`
- Unified header component with `variant` prop
- Variants: `landing`, `auth`, `platform`
- Handles different header styles based on context

#### `LandingLayout.tsx`
- Uses `Header` with `variant="landing"`
- Public header with logo, navigation, and auth buttons
- LocaleSwitcher for language selection
- Used for marketing/landing pages

#### `AuthLayout.tsx`
- Uses `Header` with `variant="auth"`
- Minimal header with logo only
- Gradient background
- Centered content area
- Used for login/register pages

#### `PlatformLayout.tsx`
- Uses `Header` with `variant="platform"`
- Authenticated header with user info and logout
- LocaleSwitcher
- Main content area with padding
- Used for all authenticated pages

### Global Components

Located in `src/components/global/`:

#### `LocaleLink.tsx`
- Link component that automatically prepends `/pt/` for Portuguese locale
- Drop-in replacement for Next.js `Link`

#### `LocaleSwitcher.tsx`
- Language selector dropdown
- Triggers full page reload with new locale prefix

### Server vs Client Layouts

The `(platform)` route group uses a special pattern:

```tsx
// layout.tsx (Server Component)
export default async function PlatformRouteLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session) {
    redirect("/auth/login")
  }

  return (
    <PlatformLayoutClient user={session.user}>
      {children}
    </PlatformLayoutClient>
  )
}

// layout-client.tsx (Client Component)
"use client"
export function PlatformLayoutClient({ children, user }) {
  return <PlatformLayout user={user}>{children}</PlatformLayout>
}
```

This pattern allows:
1. Server-side session verification
2. Client-side interactivity in the layout

---

## Proxy System

### Proxy vs Middleware

Next.js 16 introduced `proxy.ts` as an alternative to `middleware.ts`:

| Aspect | `middleware.ts` | `proxy.ts` |
|---|---|---|
| **Runtime** | Edge Runtime (limited) | Node.js Runtime (full) |
| **Location** | `src/middleware.ts` | `src/proxy.ts` |
| **API Access** | Limited (no fs, prisma) | Full (any Node.js lib) |
| **Performance** | Faster (edge) | Slightly slower |
| **Recommended for** | Simple redirects | Complex auth, i18n |

### Modular Proxy Architecture

```
src/proxy.ts                    # Entry point
    │
    └── src/lib/proxy/
            ├── index.ts        # Exports
            ├── auth.ts         # Authentication logic
            └── i18n.ts         # Internationalization logic
```

### Proxy Flow

```
Request → proxy.ts
              │
              ├─→ 1. stripLocalePrefix()     [lib/proxy/i18n.ts]
              │       Extract locale from URL (/pt/dashboard → pt)
              │
              ├─→ 2. Skip /api/*
              │       API routes bypass proxy
              │
              ├─→ 3. checkAuth()             [lib/proxy/auth.ts]
              │       Check session and return action:
              │       → redirect to /dashboard (if logged in on /auth/*)
              │       → redirect to /auth/login (if not logged in on protected route)
              │       → next (continue)
              │
              └─→ 4. handleLocaleRewrite()   [lib/proxy/i18n.ts]
                      Rewrite /pt/* → /* with x-locale header
                      Set NEXT_LOCALE cookie
```

### Auth Module (`lib/proxy/auth.ts`)

```typescript
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"]
const AUTH_ROUTES = ["/auth/login", "/auth/register"]

export function checkAuth(req, cleanPath, locale): AuthAction {
  const sessionCookie = getSessionCookie(req)
  const isLoggedIn = !!sessionCookie
  
  // Redirect logged-in users away from auth pages
  if ((isPublicRoute || isAuthRoute) && isLoggedIn) {
    return { type: "redirect", url: "/dashboard" }
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublicRoute) {
    return { type: "redirect", url: "/auth/login" }
  }

  return { type: "next" }
}
```

### i18n Module (`lib/proxy/i18n.ts`)

```typescript
export function stripLocalePrefix(pathname: string) {
  if (pathname.startsWith("/pt/") || pathname === "/pt") {
    return { cleanPath: pathname.replace("/pt", "") || "/", locale: "pt" }
  }
  return { cleanPath: pathname, locale: "en" }
}

export function handleLocaleRewrite(req, cleanPath, locale) {
  if (locale === "pt") {
    const headers = new Headers(req.headers)
    headers.set("x-locale", "pt")
    
    const response = NextResponse.rewrite(new URL(cleanPath, req.url), {
      request: { headers },
    })
    response.cookies.set("NEXT_LOCALE", "pt", { path: "/" })
    return response
  }
  
  const response = NextResponse.next()
  response.cookies.set("NEXT_LOCALE", "en", { path: "/" })
  return response
}
```

---

## Internationalization (i18n)

### URL Strategy

- **English (default):** No prefix → `/dashboard`, `/auth/login`
- **Portuguese:** `/pt/` prefix → `/pt/dashboard`, `/pt/auth/login`

### How it Works

1. **Proxy** detects `/pt/` prefix and sets:
   - `x-locale` header
   - `NEXT_LOCALE` cookie
   - Rewrites URL internally (removes `/pt/`)

2. **next-intl** reads locale from header/cookie in `request.ts`:
   ```typescript
   export default getRequestConfig(async () => {
     const headerLocale = (await headers()).get("x-locale")
     const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value
     const locale = headerLocale || cookieLocale || "en"
     
     return {
       locale,
       messages: (await import(`@/translations/client/${locale}.json`)).default,
     }
   })
   ```

3. **Components** use translations:
   ```tsx
   // Client Component
   const t = useTranslations("dashboard")
   return <h1>{t("title")}</h1>
   
   // Server Component
   const t = await getTranslations("dashboard")
   return <h1>{t("title")}</h1>
   ```

### Translation Files

```
src/translations/
├── client/           # UI translations (loaded by next-intl)
│   ├── en.json
│   └── pt.json
└── server/           # Server-only translations (emails, etc.)
    ├── en.json
    └── pt.json
```

### LocaleLink Component

For links that respect the current locale:

```tsx
import { LocaleLink } from "@/components/locale-link"

// Automatically prepends /pt/ when locale is Portuguese
<LocaleLink href="/dashboard">Dashboard</LocaleLink>
```

---

## Authentication

### Stack

- **Better Auth** - Modern authentication library
- **Email OTP** - Passwordless authentication via email codes
- **Resend** - Transactional email service

### Flow

1. User enters email on login/register page
2. OTP code is sent via email (Resend)
3. User enters 6-digit code
4. Session cookie is set
5. User is redirected to dashboard

### Session Check

Sessions are verified in two places:

1. **Proxy** (`lib/proxy/auth.ts`) - Quick cookie check for redirects
2. **Platform Layout** (`app/(platform)/layout.tsx`) - Full session verification

---

## Design Patterns

### 1. Separation of Concerns

- `app/` - Routes and pages only
- `components/` - Reusable UI components
- `lib/` - Business logic and utilities
- `server/` - Server-side code (actions)

### 2. Modular Proxy

Instead of a monolithic proxy file, logic is split by responsibility:
- `lib/proxy/auth.ts` - Authentication
- `lib/proxy/i18n.ts` - Internationalization

### 3. Layout Composition

Layouts are composed from reusable components in `components/layouts/`, allowing:
- Consistent styling across route groups
- Easy maintenance and updates
- Clear separation between route config and UI

### 4. Server/Client Boundary

Clear separation between Server and Client Components:
- Server Components for data fetching and session checks
- Client Components for interactivity
- `layout-client.tsx` pattern for hybrid layouts

### 5. Type Safety

- TypeScript throughout
- Zod for runtime validation
- Prisma for type-safe database access

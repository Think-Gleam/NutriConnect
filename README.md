# NutriConnect

## Overview
NutriConnect is a private TypeScript/React (ES Modules) web application built with Vite. It helps connect surplus nutritious food with **nearby Community Health Centers (CHCs)** and surfaces **SDG 3 impact** through a dashboard. The app includes:
- A **vendor workflow** for logging surplus food for pickup/visibility.
- A **food posting workflow** with routing/claiming actions toward the closest CHC.
- A **map-based CHC locator** that periodically refreshes nearby centers.
- An **impact dashboard** that aggregates nutritional KPIs from surplus inventory.

It also includes shared UI primitives (Radix-based), chart theming wrappers (Recharts), and small utilities for styling and error handling.

---

## Key Features
- **Vendor surplus intake**
  - Form to submit surplus items with: vendor, food item name, category (Protein/Veggie/Fruit/Grain), quantity (kg), and expiry datetime.
  - Client-side validation (required fields, quantity > 0, expiry must be in the future).
  - Sensible default expiry values and periodic “min expiry” updates on the client.
  - Protein category triggers a **high-priority alert** notification.
  - Submit uses `useSurplusInventory().addItem`, with success/error feedback and state reset.

- **Food cards with CHC routing actions**
  - Displays posting details: name, category badge, quantity, vendor, and assigned/target CHC (if available).
  - Shows **expiry urgency** (human-readable time remaining), highlighting items expiring within 6 hours.
  - Actions:
    - **Claim** (routes the item to the closest available CHC; requires `origin` + `centers` context)
    - **Route to CHC** (forwards to the closest CHC)
  - Buttons disable when the item isn’t available or a closest CHC can’t be determined.
  - Supports optional deletion via `onDelete`.
  - Manages loading/busy state to prevent duplicate submissions.

- **Interactive CHC map**
  - Leaflet map centered on the user’s current coordinates (with fallback coordinates).
  - Loads nearby CHCs via `fetchNearbyHealthCenters(location)`.
  - Refreshes centers every **5 minutes**.
  - Computes and displays the **closest CHC** using `findClosestHealthCenter`.
  - Includes custom Leaflet marker icon setup for bundler compatibility.

- **SDG 3 Impact Dashboard**
  - Aggregates nutrition impact metrics from surplus food:
    - lives impacted, nutritional servings, total food rescued (kg), calories, protein (g)
  - Breaks down contribution by category (kg) using memoized calculations.
  - Displays KPI summary cards and a category contribution panel with proportional progress visualization.

- **Reusable UI primitives**
  - Navigation menu components wrapping Radix UI primitives (`@radix-ui/react-navigation-menu`) with consistent Tailwind/CVA styling.
  - Scroll area components (Radix `ScrollArea`) with configurable vertical/horizontal scrollbars.
  - Carousel UI built on Embla Carousel with orientation support and keyboard navigation.
  - Command palette components using `cmdk` integrated with Radix Dialog.
  - Card components with consistent layout and typography.
  - Chart UI wrappers around Recharts:
    - theme-aware series styling via `ChartConfig`
    - custom tooltip and legend content that reads series config
    - responsive chart container with generated IDs for scoping chart CSS variables

- **Error handling utilities**
  - `src/lib/error-capture.ts`: captures recent global `error` and `unhandledrejection` events into an in-memory stash with a **TTL of 5 seconds**, exposed via `consumeLastCapturedError()`.
  - `src/lib/error-page.ts`: `renderErrorPage()` returns a user-friendly “This page didn’t load” HTML string with:
    - “Try again” (reload)
    - “Go home” (link to `/`)

- **Tailwind class merging helper**
  - `src/lib/utils.ts`: `cn(...classes)` merges Tailwind class strings using `clsx` + `tailwind-merge` to resolve conflicts cleanly.

---

## Tech Stack
- **Frontend**
  - React (TypeScript), Vite (ES Modules)
  - Tailwind CSS + Tailwind class merging (`clsx`, `tailwind-merge`)
- **UI / Components**
  - Radix UI (navigation menu, scroll area, dialog, etc.)
  - Embla Carousel (carousel UI)
  - `cmdk` + Radix Dialog (command palette UI)
  - Lucide icons (e.g., Search icon in command input)
- **Routing / Data**
  - TanStack React Router / React Start / router plugin (based on dependencies described in `package.json`)
  - React Query (data fetching/state)
- **Charts & Visualization**
  - Recharts (wrapped with chart theming/tooltip/legend utilities)
- **Maps**
  - Leaflet + React Leaflet (map visualization for CHCs)
- **Forms / Validation**
  - `react-hook-form`, `zod`, zod resolvers
- **Utilities / UX**
  - Date utilities
  - Notifications and OTP support (present in dependencies as described)

---

## Project Architecture
Based on the described source files and component responsibilities, the codebase is organized into:

- **Entry / App-level concerns**
  - Global error capturing via `src/lib/error-capture.ts`
  - Error-page rendering via `src/lib/error-page.ts`
  - Shared styling helper via `src/lib/utils.ts`

- **Reusable UI layer**
  - `src/components/ui/*`
    - Navigation menu wrappers
    - Scroll area wrappers
    - Carousel components
    - Command palette components
    - Card layout primitives
    - Chart wrappers around Recharts with config-driven theming and custom tooltip/legend rendering

- **Domain components (feature layer)**
  - `Navbar.tsx`
    - Sticky top navigation bar with branding and section links (e.g., Vendor, Health Centers, Impact).
  - `VendorDashboard.tsx`
    - Surplus logging form and submission logic to the surplus inventory system; includes high-priority alert behavior for Protein items.
  - `FoodCard.tsx`
    - Presentation + actions for each surplus posting, including CHC claim/routing and expiry urgency display.
  - `MapView.tsx`
    - Leaflet map for locating nearby CHCs and determining closest center.
  - `ImpactDashboard.tsx`
    - SDG 3 impact KPIs and category contribution visualization.

This layered approach separates:
- **Infrastructure/UI primitives** (`src/components/ui/*`)
- **Reusable utility functions** (`src/lib/*`)
- **Feature components** (`src/components/*`)

---

## Installation / Usage (Placeholder)
> The repository summaries provided don’t include exact commands for install/build specifics beyond Vite scripts. Use the following as a starting point and adjust to your environment.

### Prerequisites
- Node.js (version compatible with your `package.json` tooling)
- npm/yarn/pnpm (whichever your repo expects)

### Install
bash
npm install
# or: yarn install
# or: pnpm install


### Development
bash
npm run dev
# (Vite development server)


### Build
bash
npm run build
# or: npm run build:dev (if you use the dev-mode build script)


### Preview
bash
npm run preview


### Lint / Format
bash
npm run lint
npm run format


---

## Notes for Developers
- **Error flow:** Use `consumeLastCapturedError()` to retrieve the latest captured error/rejection reason (only valid for ~5 seconds), and consider pairing it with `renderErrorPage()` for a friendly fallback.
- **Styling:** Prefer `cn()` for Tailwind class composition to avoid conflicting classes.
- **Charts:** When using the chart wrappers, structure series metadata via `ChartConfig` so tooltips/legends and theme variables stay consistent.
- **CHC routing:** `FoodCard` actions depend on the ability to compute a closest CHC; ensure `origin` and `centers` are available in the calling context when enabling claim/routing.

---
*This README was generated with [PresentMe](https://www.presentmeapp.xyz/).
View the full presentation [here]https://www.presentmeapp.xyz/p/478f1e8c-925e-4721-9610-ec64bb6e96fa).*

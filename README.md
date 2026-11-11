# VIDHARA DASHBOARD — Creative Agency CRM & Task Management

A design agency task orchestration and client deliverables platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

Inspired by modern creative studio workflows with a multi-area dashboard composition and weekly calendar scheduling.

---

## 🎨 Visual Design Foundation

- **Primary Background:** `#FFF1F1`
- **Soft Lavender:** `#E9B3FB`
- **Primary Purple:** `#6F00FF`
- **Deep Purple:** `#3B0270`
- **Main Text:** `#241A33`
- **Secondary Text:** `#837C8D`
- **Soft Borders:** `#F0E6F3`
- **Muted Surfaces:** `#FAF7FC`
- **Success:** `#16865C`
- **Warning:** `#D99516`
- **Error:** `#D84B66`

---

## ⚡ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + custom Vidhara tokens & glassmorphic utilities
- **UI Components:** Radix UI primitives + Lucide React icons
- **State Management:** React Context (`TaskProvider`) with live updates and toast feedback
- **Backend Ready:** Supabase (`@supabase/ssr`) with browser and server clients

---

## 🚀 Key Features & Pages

- **Creative Control Center (`/`):** 3-area layout featuring weekly pinned tasks, mini calendar, center timeline with real-time status toggles, and performance summary widgets.
- **Weekly Schedule (`/calendar`):** 7-column calendar with time slots (08:00–18:00), active day dark pill, horizontal dashed current-time indicator, and review actions.
- **My Tasks (`/my-tasks`):** Personal sprint tasks with 5 status filters, search, and Grid/List view toggles.
- **All Tasks (`/all-tasks`):** Admin master task pipeline with 5-stage Kanban board.
- **Client Requests (`/requests`):** Inbound client creative briefs with deliverable scope checklists and approval actions.
- **Reviews & Proofing (`/reviews`):** Visual deliverable proofing, versioning (v1, v2, v3), feedback annotations, and client signoff.
- **Creative Archive (`/completed`):** Delivered portfolio showcase and handoff asset manager.
- **Team Accounts (`/team`):** Designer roster, sprint capacity meters, and allocation tracking.
- **Notification Center (`/notifications`):** Live notification center with mark-all-read and category filters.
- **Studio Settings (`/settings`):** Design system color token visualizer and workspace preferences.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/jeripothulaabhishek/Vidhara-CRM.git
   git branch -M main
   git push -u origin main
   ```
2. Import the project into [Vercel](https://vercel.com/new).
3. (Optional) Set the following environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.

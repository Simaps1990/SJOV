---
name: code-quality-animations
description: Fix code quality issues and add subtle professional animations/UX to SJOV site
metadata:
  type: project
---

# Code Quality & Animations — SJOV

**Date:** 2026-06-28  
**Scope:** All public pages  
**Constraint:** Zero new dependencies, no functionality changes

---

## 1. Code Quality Fixes

| # | Problem | File | Fix |
|---|---------|------|-----|
| 1 | `window.location.href` used for SPA navigation | `Header.tsx` | Replace with `useNavigate()` / `<Link>` |
| 2 | `ContentContext.fixed.tsx` orphan file | `context/` | Delete |
| 3 | Dev comments in production (`✅ ❗ // adapte le chemin`) | Multiple files | Remove |
| 4 | `animate-slide-down` used but not defined | `tailwind.config.js` | Add keyframe |
| 5 | Inconsistent indentation | `HomePage.tsx`, `App.tsx` | Reformat |

**Rules:** No logic changes, no rename of exports, no restructuring of components.

---

## 2. New Hook — `useScrollReveal`

**File:** `src/hooks/useScrollReveal.ts`

```ts
// Returns { ref, isVisible } using IntersectionObserver
// threshold: 0.15, triggerOnce: true
```

Used by every public page section and card grid.

---

## 3. Tailwind Keyframes — Additions to `tailwind.config.js`

```js
keyframes: {
  fadeUp: {
    '0%': { opacity: '0', transform: 'translateY(24px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  slideDown: {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(0)' },
  },
  scaleIn: {
    '0%': { opacity: '0', transform: 'scale(0.97)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
}
animation: {
  'fade-up': 'fadeUp 0.5s ease-out both',
  'slide-down': 'slideDown 0.25s ease-out both',
  'scale-in': 'scaleIn 0.35s ease-out both',
}
```

---

## 4. Animations by Zone

### Header (`Header.tsx`)
- On mount: `scrollY === 0` → `bg-white/80 backdrop-blur-sm shadow-none`
- On scroll > 10px → `bg-white shadow-md` with `transition-all duration-300`
- Mobile menu: use new `animate-slide-down` (fixes existing bug)
- Navigation: replace `window.location.href` with `useNavigate` + `<Link>`

### Hero (HomePage)
- Titre: `animate-fade-up` delay 0ms
- Texte intro: `animate-fade-up` delay 150ms
- Boutons: `animate-fade-up` delay 300ms

### Sections au scroll (all public pages)
- Each `<section>` wraps content with `useScrollReveal`
- Hidden state: `opacity-0 translate-y-6`
- Visible state: `opacity-100 translate-y-0 transition-all duration-700`
- Sections stagger: `delay-[100ms]` increments

### Cards (BlogCard, EventCard, AnnoncesCard)
- Hover lift: `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`
- Image zoom: keep existing `group-hover:scale-105` (already in place)
- Grid entry: cards get `animate-fade-up` with stagger index × 100ms

### Buttons
- Add `active:scale-95` to `.btn` in `index.css`
- Add `transition-transform duration-150` to `.btn`

---

## 5. Files Changed

### Modified
- `tailwind.config.js` — new keyframes + animations
- `src/index.css` — `.btn` micro-animation
- `src/components/layout/Header.tsx` — scroll effect + nav fix
- `src/components/ui/BlogCard.tsx` — hover lift + entry anim
- `src/components/ui/EventCard.tsx` — hover lift + entry anim
- `src/components/ui/AnnoncesCard.tsx` — hover lift (if exists, else inline in HomePage)
- `src/pages/HomePage.tsx` — hero stagger + section reveals + cleanup
- `src/pages/BlogPage.tsx` — section reveal
- `src/pages/EventsPage.tsx` — section reveal
- `src/pages/AssociationPage.tsx` — section reveal
- `src/pages/ContactPage.tsx` — section reveal
- `src/pages/ApplyPage.tsx` — section reveal
- `src/pages/Annonces.tsx` — section reveal
- `src/App.tsx` — comment cleanup

### New
- `src/hooks/useScrollReveal.ts`

### Deleted
- `src/context/ContentContext.fixed.tsx`

---

## 6. What Does NOT Change

- All Supabase queries and data fetching
- Admin pages (untouched)
- Routing structure
- Component exports and interfaces
- SEO / HelmetProvider
- Forms and submission logic

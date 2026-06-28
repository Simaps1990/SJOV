# Code Quality & Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix SPA navigation bug + dead code + dev comments, then add scroll-reveal animations and header scroll-effect across all public pages.

**Architecture:** Single `useScrollReveal` hook (Intersection Observer) consumed by every public page. Tailwind keyframes drive all motion. Header gains scroll-state via a `useEffect`+`scrollY` listener. Cards get CSS transition hover lift.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, Vite, React Router v6. Zero new dependencies.

## Global Constraints

- No changes to Supabase queries, form logic, admin pages, or component exports.
- No new npm packages.
- `npm run build` must pass (TypeScript clean) after every task.
- All public routes remain accessible and functional.
- Dev server: `npm run dev` (Vite, default port 5173).

---

### Task 1: Tailwind keyframes + button micro-animation

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**
- Produces: animation utility classes `animate-fade-up`, `animate-slide-down`, `animate-scale-in` usable anywhere in TSX via className.

- [ ] **Step 1: Add keyframes and animation utilities to tailwind.config.js**

Replace the existing `animation` and `keyframes` blocks inside `theme.extend`:

```js
// tailwind.config.js — full theme.extend replacement
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.5s ease-out',
  'pulse-slow': 'pulse 3s infinite',
  'fade-up': 'fadeUp 0.5s ease-out both',
  'slide-down': 'slideDown 0.25s ease-out both',
  'scale-in': 'scaleIn 0.35s ease-out both',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
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
},
```

- [ ] **Step 2: Add button micro-animation to index.css**

In the `.btn` component block (inside `@layer components`), append `active:scale-95` and `transition-transform`:

```css
.btn {
  @apply inline-flex items-center justify-center px-5 py-2.5 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95;
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors, no Tailwind warnings.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "style: add fadeUp/slideDown/scaleIn keyframes and btn active:scale-95"
```

---

### Task 2: useScrollReveal hook

**Files:**
- Create: `src/hooks/useScrollReveal.ts`

**Interfaces:**
- Produces: `useScrollReveal(threshold?: number) => { ref: React.RefObject<HTMLDivElement>, isVisible: boolean }`
- `threshold` defaults to `0.15` (element is 15% in viewport before trigger)
- Fires once (disconnects observer after first intersection)

- [ ] **Step 1: Create the hook file**

```ts
// src/hooks/useScrollReveal.ts
import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useScrollReveal.ts
git commit -m "feat: add useScrollReveal hook (IntersectionObserver, fires once)"
```

---

### Task 3: Fix Header — navigation + scroll effect + mobile menu animation

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Problem 1:** Desktop nav buttons use `window.location.href` — causes full page reload on every nav click, breaking SPA.  
**Problem 2:** Mobile nav same issue.  
**Problem 3:** `animate-slide-down` was undefined (now fixed in Task 1).  
**Problem 4:** No scroll-based visual change — header looks same whether at top or mid-page.

**Interfaces:**
- Consumes: `useNavigate`, `Link` from `react-router-dom` (already installed)
- Produces: header with transparent-ish top state → opaque+shadow on scroll; SPA navigation; animated mobile menu

- [ ] **Step 1: Rewrite Header.tsx**

Full file replacement:

```tsx
// src/components/layout/Header.tsx
import React, { useState, useEffect, forwardRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Lock, Menu, X } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const Header = forwardRef<HTMLElement>((_, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { associationContent } = useContent();
  const headerIcon: string | undefined = associationContent.headerIcon;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/association', label: 'Notre association' },
    { to: '/blog', label: 'Blog' },
    { to: '/events', label: 'Événements' },
    { to: '/annonces', label: 'Annonces' },
    { to: '/apply', label: 'Postuler' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header
      ref={ref}
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center">
          {headerIcon && (
            <img src={headerIcon} alt="SJOV Logo" className="h-12 w-12" />
          )}
          <div className="ml-3 text-primary-700 leading-tight flex flex-col">
            <span className="text-xl font-bold">SJOV</span>
            <span className="text-sm font-medium text-primary-600">
              Jardins Ouvriers de Villeurbanne
            </span>
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPath === to
                  ? 'text-primary-600'
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
            >
              {label}
            </Link>
          ))}

          <form onSubmit={handleSearch} className="relative w-full max-w-[180px]">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full pl-10 pr-4 py-2 rounded border border-neutral-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          </form>

          <Link
            to="/login"
            className="text-neutral-700 hover:text-primary-600 p-2"
            aria-label="Administration"
          >
            <Lock size={22} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-neutral-700 hover:text-primary-600 p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 animate-slide-down">
          <nav className="flex flex-col items-end gap-3 text-sm font-medium mt-3">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium px-3 py-1.5 rounded transition-colors duration-200 ${
                  currentPath === to
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-700 hover:text-primary-600'
                }`}
              >
                {label}
              </Link>
            ))}

            <form
              onSubmit={(e) => {
                handleSearch(e);
                setMobileOpen(false);
              }}
              className="relative w-full max-w-[180px]"
            >
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2 rounded border border-neutral-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            </form>

            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-neutral-700 hover:text-primary-600 p-2"
              aria-label="Administration"
            >
              <Lock size={22} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
});

export default Header;
```

**Key changes vs original:**
- Added `useEffect` scroll listener → `scrolled` state → conditional header classes
- Desktop nav: `window.location.href` → `<Link to={to}>`
- Mobile nav: `window.location.href` + `setMobileOpen(false)` → `<Link to={to} onClick={() => setMobileOpen(false)}>`
- Mobile search: `navigate()` via `handleSearch`
- Mobile dropdown: `animate-slide-down` now works (defined in Task 1)
- Logo `<h1>` → `<span>` (was semantically wrong in a header component used on every page)
- Removed `forwardRef` import duplication (was imported twice via different paths in original)

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Manual check — navigate between pages**

```bash
npm run dev
```

Click each nav link. Confirm: no full page reload (URL updates without white flash), active link highlights correctly, mobile menu closes on link click, header gets shadow on scroll.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "fix: replace window.location.href with React Router Link in Header, add scroll effect"
```

---

### Task 4: Cleanup — delete orphan file + remove dev comments

**Files:**
- Delete: `src/context/ContentContext.fixed.tsx`
- Modify: `src/pages/Annonces.tsx` (remove console.logs + dev comment)
- Modify: `src/pages/admin/AdminLayout.tsx` (remove `❗` comment if present)
- Modify: `src/App.tsx` (remove `// ✅ Import correct` + `{/* ❗ AJOUT ICI */}`)
- Modify: `src/pages/HomePage.tsx` (remove `// adapte le chemin` + `// ajuste le chemin si besoin`)

- [ ] **Step 1: Delete orphan file**

```bash
rm src/context/ContentContext.fixed.tsx
```

- [ ] **Step 2: Clean App.tsx**

In `src/App.tsx`:

Line 25: `import AnnoncesPage from './pages/Annonces'; // ✅ Import correct`
→ `import AnnoncesPage from './pages/Annonces';`

Line 104: `<Route path="annonces" element={<AdminAnnoncesPage />} /> {/* ❗ AJOUT ICI */}`
→ `<Route path="annonces" element={<AdminAnnoncesPage />} />`

- [ ] **Step 3: Clean HomePage.tsx**

Line 7: `import MeteoConseilsSection from '../components/ui/MeteoConseilsSection'; // adapte le chemin`
→ `import MeteoConseilsSection from '../components/ui/MeteoConseilsSection';`

Line 8: `import { renderAnnonceType } from '../constants/annonceTypes'; // ajuste le chemin si besoin`
→ `import { renderAnnonceType } from '../constants/annonceTypes';`

- [ ] **Step 4: Clean Annonces.tsx**

Remove the three `console.log` statements:
- Line 18-22 block: `console.log('📤 Envoi Cloudinary :', {...})` → delete
- Line 31: `console.log("📥 Cloudinary Response Status:", res.status);` → delete
- Line 137-138: `console.log("Photo 1 URL =>", photo1Url);` + `console.log("Photo 2 URL =>", photo2Url);` → delete

Remove line 7: `import { renderAnnonceType } from '../constants/annonceTypes'; // ajuste le chemin si besoin`
→ `import { renderAnnonceType } from '../constants/annonceTypes';`

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove ContentContext.fixed.tsx orphan, clean dev comments and console.logs"
```

---

### Task 5: Card hover polish — BlogCard, EventCard, AnnoncesCard

**Files:**
- Modify: `src/components/ui/BlogCard.tsx`
- Modify: `src/components/ui/EventCard.tsx`
- Modify: `src/components/ui/AnnoncesCard.tsx`

**Goal:** Make cards feel lighter and more responsive. The existing `.card` class has `transition-shadow` — extend with `hover:-translate-y-1` for a lift effect. The image zoom (`group-hover:scale-105`) is already in place.

- [ ] **Step 1: Update BlogCard.tsx article element**

Current line 35-38:
```tsx
<article
  className={`card group transition-all duration-300 h-full ${
    isFeature ? 'md:flex' : ''
  }`}
>
```

Replace with:
```tsx
<article
  className={`card group transition-all duration-300 h-full hover:-translate-y-1 hover:shadow-lg ${
    isFeature ? 'md:flex' : ''
  }`}
>
```

- [ ] **Step 2: Update EventCard.tsx Link element**

Current line 15-17:
```tsx
<Link
  to={`/events/${event.id}`}
  className={`card group transition-all duration-300 block ${event.isPast ? 'opacity-80' : ''}`}
>
```

Replace with:
```tsx
<Link
  to={`/events/${event.id}`}
  className={`card group transition-all duration-300 block hover:-translate-y-1 hover:shadow-lg ${event.isPast ? 'opacity-80' : ''}`}
>
```

- [ ] **Step 3: Update AnnoncesCard.tsx article element**

Current line 13:
```tsx
<article className="card group transition-all duration-300 h-full">
```

Replace with:
```tsx
<article className="card group transition-all duration-300 h-full hover:-translate-y-1 hover:shadow-lg">
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/BlogCard.tsx src/components/ui/EventCard.tsx src/components/ui/AnnoncesCard.tsx
git commit -m "style: add hover lift effect to BlogCard, EventCard, AnnoncesCard"
```

---

### Task 6: HomePage — hero stagger + section scroll reveals

**Files:**
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `useScrollReveal` from `../../hooks/useScrollReveal` (Task 2)

**Pattern used throughout:**
- Each `<section>` wraps in a `ref` + conditional classes
- `isVisible` false → `opacity-0 translate-y-6`
- `isVisible` true → `opacity-100 translate-y-0 transition-all duration-700 ease-out`
- Card grids: each item gets `animate-fade-up` with `animationDelay` when grid comes into view

- [ ] **Step 1: Rewrite HomePage.tsx**

```tsx
// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import BlogCard from '../components/ui/BlogCard';
import EventCard from '../components/ui/EventCard';
import React from 'react';
import MeteoConseilsSection from '../components/ui/MeteoConseilsSection';
import { renderAnnonceType } from '../constants/annonceTypes';
import SEO from '../components/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';

const HomePage: React.FC = () => {
  const { blogPosts, events, associationContent, annonces } = useContent();

  const titreAccueil = associationContent?.titreAccueil;
  const texteIntro = associationContent?.texteIntro;
  const backgroundImageUrl = associationContent?.imageAccueil;

  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestPost = sortedPosts[0] ?? null;

  const upcomingEvents = events
    .filter((event) => !event.isPast)
    .sort(
      (a, b) =>
        new Date(a.enddate || a.date || a.start || '').getTime() -
        new Date(b.enddate || b.date || b.start || '').getTime()
    );

  const pastEvents = events
    .filter((event) => event.isPast)
    .sort(
      (a, b) =>
        new Date(b.enddate || b.date || b.start || '').getTime() -
        new Date(a.enddate || a.date || a.start || '').getTime()
    );

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const latestPastEvent = pastEvents.length > 0 ? pastEvents[0] : null;

  const { ref: meteoRef, isVisible: meteoVisible } = useScrollReveal();
  const { ref: blogRef, isVisible: blogVisible } = useScrollReveal();
  const { ref: eventsRef, isVisible: eventsVisible } = useScrollReveal();
  const { ref: annoncesRef, isVisible: annoncesVisible } = useScrollReveal();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal();

  return (
    <div>
      <SEO
        title="Association des Jardins Familiaux, Jardins Partagés & Jardin Solidaire Villeurbanne | SJOV"
        description="Association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif à Villeurbanne (69100). Demande jardins familiaux, jardin communal, jardins collectifs, jardin communautaire, jardins participatifs. Membre FNJFC. Jardinons à l'école, jardiner à Paris depuis 1936."
        keywords="jardins familiaux, jardin familiaux, les jardins familiaux, association jardins, association des jardins familiaux, demande jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardinons a l'ecole, jardiner a paris, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, gmap, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, SJOV, Société des Jardins Ouvriers de Villeurbanne, jardinage urbain, Villeurbanne, 69100, Rhône-Alpes, Lyon"
      />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          "name": "SJOV - Société des Jardins Ouvriers de Villeurbanne",
          "alternateName": ["SJOV", "Association des Jardins Familiaux de Villeurbanne", "Jardins Ouvriers Villeurbanne", "Jardins Familiaux Villeurbanne"],
          "url": "https://sjov.fr",
          "logo": "https://sjov.fr/images/sjov-logo.png",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Villeurbanne",
            "addressRegion": "Auvergne-Rhône-Alpes",
            "postalCode": "69100",
            "addressCountry": "FR"
          },
          "description": "Association des jardins familiaux et jardins ouvriers à Villeurbanne. Demande jardins familiaux, jardin communal, jardins collectifs. Membre FNJFC depuis 1936.",
          "areaServed": ["Villeurbanne", "Vaulx-en-Velin", "Lyon", "Rhône-Alpes", "Auvergne-Rhône-Alpes"],
          "memberOf": {
            "@type": "Organization",
            "name": "FNJFC - Fédération Nationale des Jardins Familiaux et Collectifs"
          },
          "keywords": "jardins familiaux, jardin familiaux, association jardins, association des jardins familiaux, demande jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardinons a l'ecole, jardiner a paris, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, gmap, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs"
        })}
      </script>

      {/* Hero Section */}
      {backgroundImageUrl && (
        <section
          className="relative bg-cover bg-center h-[70vh] flex items-center -mt-10 md:-mt-24"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="container-custom relative z-10 text-white">
            <div className="max-w-6xl mt-6 md:mt-24">
              {titreAccueil ? (
                <h1
                  className="text-4xl md:text-5xl font-bold mb-4 animate-fade-up"
                  style={{ animationDelay: '0ms' }}
                >
                  {titreAccueil}
                </h1>
              ) : (
                <h1
                  className="text-4xl md:text-5xl font-bold mb-4 animate-fade-up"
                  style={{ animationDelay: '0ms' }}
                >
                  Jardins Partagés à Villeurbanne et Vaulx-en-Velin - Association de Bénévoles
                </h1>
              )}
              {texteIntro && (
                <p
                  className="text-xl mb-8 animate-fade-up"
                  style={{ animationDelay: '150ms' }}
                >
                  {texteIntro}
                </p>
              )}
              <div
                className="flex flex-wrap gap-4 animate-fade-up"
                style={{ animationDelay: '300ms' }}
              >
                <Link to="/apply" className="btn-primary">
                  Postuler pour un jardin
                </Link>
                <Link to="/association" className="btn bg-white text-primary-700 hover:bg-neutral-100">
                  Découvrir l'association
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Météo + Plantation */}
      <div
        ref={meteoRef}
        className={`transition-all duration-700 ease-out ${
          meteoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <section className="pt-16 px-4 md:px-6 bg-neutral-50">
          <MeteoConseilsSection />
        </section>
      </div>

      {/* Latest Blog Post */}
      <div
        ref={blogRef}
        className={`transition-all duration-700 ease-out ${
          blogVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <section className="pt-16 px-4 md:px-6 bg-neutral-50">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-3">
              <Link to="/blog" className="text-3xl font-heading font-bold no-underline hover:no-underline">
                Dernier Article
              </Link>
              <Link to="/blog" className="flex items-center text-primary-600 hover:text-primary-700">
                Tous nos articles de Blog <ChevronRight size={16} />
              </Link>
            </div>
            {latestPost ? (
              <Link to={`/blog/${latestPost.id}`} className="block">
                <BlogCard post={latestPost} isFeature={true} />
              </Link>
            ) : (
              <p className="text-neutral-500">
                Aucun article de blog n'a été publié pour le moment.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Events Section */}
      <div
        ref={eventsRef}
        className={`transition-all duration-700 ease-out ${
          eventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <section className="pt-16 px-4 md:px-6 bg-neutral-50">
          <div className="container-custom">
            <div className="flex justify-between items-center">
              <Link to="/events" className="text-3xl font-heading font-bold">
                Nos événements
              </Link>
              <Link to="/events" className="flex items-center text-primary-600 hover:text-primary-700">
                Tous les événements <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <Link to="/events" className="text-xl font-heading font-semibold mb-3 block">
                  Prochain événement
                </Link>
                {nextEvent ? (
                  <Link to={`/events/${nextEvent.id}`} className="block">
                    <EventCard event={nextEvent} isFeature={true} />
                  </Link>
                ) : (
                  <div className="card p-6">
                    <p className="text-neutral-500">
                      Aucun événement à venir n'est programmé pour le moment.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Link to="/events" className="text-xl font-heading font-semibold mb-3 block">
                  Événement passé
                </Link>
                {latestPastEvent ? (
                  <Link to={`/events/${latestPastEvent.id}`} className="block">
                    <EventCard event={latestPastEvent} isFeature={true} />
                  </Link>
                ) : (
                  <div className="card p-6">
                    <p className="text-neutral-500">Aucun événement passé n'est enregistré.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Dernières annonces */}
      <div
        ref={annoncesRef}
        className={`transition-all duration-700 ease-out ${
          annoncesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <section className="pt-16 pb-16 px-4 md:px-6 bg-neutral-50">
          <div className="container-custom">
            <div className="flex justify-between items-center">
              <Link to="/annonces" className="text-3xl font-heading font-bold mb-6">
                Les petites annonces
              </Link>
              <Link to="/annonces" className="flex items-center text-primary-600 hover:text-primary-700">
                Voir toutes les annonces <ChevronRight size={16} />
              </Link>
            </div>
            {annonces.length > 0 ? (
              <div className={`grid gap-6 ${annonces.length === 1 ? '' : 'md:grid-cols-2'}`}>
                {[...annonces]
                  .filter((a) => a.statut === 'validé')
                  .sort(
                    (a, b) =>
                      new Date(b.created_at || '').getTime() -
                      new Date(a.created_at || '').getTime()
                  )
                  .slice(0, 2)
                  .map((a, index) => (
                    <button
                      key={a.id}
                      onClick={() => (window.location.href = `/annonces#annonce-${a.id}`)}
                      className={`text-left w-full bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                        annoncesVisible ? 'animate-fade-up' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <p className="text-sm text-neutral-400 mb-1">
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Date inconnue'}
                      </p>
                      <div className="text-xl font-semibold mb-2 text-primary-700">
                        {renderAnnonceType(a.type)}
                      </div>
                      <p className="text-neutral-700 whitespace-pre-line">
                        {a.contenu || 'Contenu non renseigné.'}
                      </p>
                    </button>
                  ))}
              </div>
            ) : (
              <p className="text-neutral-500">
                Il n'y a actuellement aucune petite annonce sur le site. Vous pouvez proposer quelque chose !
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Call to Action */}
      <div
        ref={ctaRef}
        className={`transition-all duration-700 ease-out ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <section className="pt-16 pb-16 px-4 md:px-0 bg-primary-700 text-white">
          <div className="w-full text-center px-4 md:px-0">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Rejoignez-nous dans cette aventure verte
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Que vous soyez jardinier expérimenté ou novice passionné, il y a une place pour vous dans notre communauté.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/apply" className="btn bg-white text-primary-700 hover:bg-neutral-100">
                Postuler pour un jardin
              </Link>
              <Link
                to="/contact"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-700 hover:border-white"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: add hero stagger animations and scroll-reveal sections to HomePage"
```

---

### Task 7: BlogPage + EventsPage — section reveals + card stagger

**Files:**
- Modify: `src/pages/BlogPage.tsx`
- Modify: `src/pages/EventsPage.tsx`

**Pattern:** Grid container gets `useScrollReveal`. Each card gets `animate-fade-up` (or `opacity-0`) conditioned on grid visibility, with `animationDelay: index * 80ms`.

- [ ] **Step 1: Rewrite BlogPage.tsx**

```tsx
// src/pages/BlogPage.tsx
import React from 'react';
import { useContent } from '../context/ContentContext';
import BlogCard from '../components/ui/BlogCard';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';

const BlogPage: React.FC = () => {
  const { blogPosts } = useContent();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="pb-16">
      <SEO
        title="Blog Jardins Familiaux, Jardins Partagés & Jardin Solidaire SJOV | Jardinons à l'école"
        description="Blog de l'association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif SJOV. Jardinons à l'école, jardiner à Paris. Conseils jardins collectifs, jardin communal, jardin communautaire, jardins participatifs. Membre FNJFC depuis 1936."
        keywords="jardinons a l'ecole, jardiner a paris, jardins familiaux, jardin familiaux, les jardins familiaux, association jardins, association des jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, demande jardins familiaux, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, blog jardinage, conseils plantation, culture potager, SJOV, Société des Jardins Ouvriers de Villeurbanne, Villeurbanne, 69100, Rhône-Alpes, Lyon, bénévolat"
      />
      <div className="container-custom">
        <div
          ref={headerRef}
          className={`transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="font-heading font-bold text-4xl mb-2">Nos articles de blog</h1>
          <p className="text-neutral-600 text-lg mb-8">
            Retrouvez ici les dernières nouvelles de notre association.
          </p>
        </div>

        {sortedPosts.length > 0 ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0"
          >
            {sortedPosts.map((post, index) => (
              <Link
                to={`/blog/${post.id}`}
                key={post.id}
                className={`block ${gridVisible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <BlogCard post={post} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center">Aucun article pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
```

- [ ] **Step 2: Rewrite EventsPage.tsx**

```tsx
// src/pages/EventsPage.tsx
import React from 'react';
import { useContent } from '../context/ContentContext';
import EventCard from '../components/ui/EventCard';
import SEO from '../components/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';

const EventsPage: React.FC = () => {
  const { events } = useContent();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="pb-16">
      <SEO
        title="Événements Jardins Familiaux, Jardins Partagés & Jardin Solidaire SJOV | Jardinons à l'école"
        description="Événements de l'association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif SJOV. Jardins collectifs, jardin communal, jardin communautaire, jardins participatifs. Jardinons à l'école. Membre FNJFC. Ateliers jardinage à Villeurbanne depuis 1936."
        keywords="jardins familiaux, jardin familiaux, les jardins familiaux, association jardins, association des jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardinons a l'ecole, jardiner a paris, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, demande jardins familiaux, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, événements jardinage, ateliers plantation, SJOV, Société des Jardins Ouvriers de Villeurbanne, Villeurbanne, 69100, Rhône-Alpes, Lyon, bénévolat, animations jardinage, fête des jardins, troc de plantes"
      />
      <div className="container-custom">
        <div
          ref={headerRef}
          className={`transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="font-heading font-bold text-4xl mb-2">Événements</h1>
          <p className="text-neutral-600 text-lg mb-8">
            Découvrez les événements organisés par notre association
          </p>
        </div>

        {sortedEvents.length > 0 ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                className={gridVisible ? 'animate-fade-up' : 'opacity-0'}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">
              Aucun événement n'est disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/BlogPage.tsx src/pages/EventsPage.tsx
git commit -m "feat: add scroll-reveal and card stagger animations to BlogPage and EventsPage"
```

---

### Task 8: AssociationPage + ContactPage + ApplyPage + AnnoncesPage — section reveals

**Files:**
- Modify: `src/pages/AssociationPage.tsx`
- Modify: `src/pages/ContactPage.tsx`
- Modify: `src/pages/ApplyPage.tsx`
- Modify: `src/pages/Annonces.tsx`

**Note:** These pages have forms and complex state — only the **entry animation wrappers** are added. No changes to form logic, state, or data fetching.

- [ ] **Step 1: Add reveal to AssociationPage.tsx**

Add import at top:
```tsx
import { useScrollReveal } from '../hooks/useScrollReveal';
```

Add hooks after the early-return guards, just before the `return (`:
```tsx
const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
const { ref: contentRef, isVisible: contentVisible } = useScrollReveal();
const { ref: imagesRef, isVisible: imagesVisible } = useScrollReveal();
```

Wrap the existing `<h1>` + `<p>` block:
```tsx
<div
  ref={headerRef}
  className={`transition-all duration-700 ease-out ${
    headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`}
>
  <h1 className="font-heading font-bold text-4xl mb-2">
    {titreAssociation || "Notre association"}
  </h1>
  <p className="text-neutral-600 text-lg mb-8">
    Découvrez l'histoire et les valeurs de notre association de bénévoles.
  </p>
</div>
```

Wrap the `<div className="mb-10">` content block:
```tsx
<div
  ref={contentRef}
  className={`mb-10 transition-all duration-700 ease-out ${
    contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`}
>
  {/* existing content unchanged */}
</div>
```

Wrap the images grid (the `{images.length > 0 && (...)}` block):
```tsx
<div
  ref={imagesRef}
  className={`transition-all duration-700 ease-out ${
    imagesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`}
>
  {images.length > 0 && (
    <div className={`grid gap-6 ${getImageGridClass()}`}>
      {/* existing images unchanged */}
    </div>
  )}
</div>
```

- [ ] **Step 2: Add reveal to ContactPage.tsx**

Add import:
```tsx
import { useScrollReveal } from '../hooks/useScrollReveal';
```

Add hook inside component (after existing state declarations):
```tsx
const { ref: pageRef, isVisible: pageVisible } = useScrollReveal();
```

Wrap the top content `<h1>` + `<p>` + the grid:
```tsx
<div
  ref={pageRef}
  className={`transition-all duration-700 ease-out ${
    pageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`}
>
  <h1 className="font-heading font-bold text-4xl mb-2">Contact</h1>
  <p className="text-neutral-600 text-lg mb-8">
    Nous sommes à votre écoute. N'hésitez pas à nous contacter pour toute question.
  </p>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* existing content unchanged */}
  </div>
</div>
```

Also remove the commented-out import on line 7:
```tsx
// Remove: //import type { AssociationContentType } from '../context/ContentContext';
```

- [ ] **Step 3: Add reveal to ApplyPage.tsx**

Add import:
```tsx
import { useScrollReveal } from '../hooks/useScrollReveal';
```

Add hook inside component (before `return`):
```tsx
const { ref: pageRef, isVisible: pageVisible } = useScrollReveal();
```

In the main `return` (non-submitted state), wrap the inner container:
```tsx
<div
  ref={pageRef}
  className={`transition-all duration-700 ease-out ${
    pageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`}
>
  <h1 className="font-heading font-bold text-4xl mb-2">Postuler pour un jardin</h1>
  <p className="text-neutral-600 text-lg mb-8">
    Remplissez ce formulaire pour faire une demande d'attribution de parcelle.
  </p>
  <div className="p-6 bg-white shadow-md rounded-lg">
    {/* existing form unchanged */}
  </div>
</div>
```

- [ ] **Step 4: Add reveal to Annonces.tsx**

Add import at top (after existing imports):
```tsx
import { useScrollReveal } from '../hooks/useScrollReveal';
```

Add hooks inside component (after `visibleAnnonces` declaration):
```tsx
const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();
```

Wrap the `<h1>` + `<p>` + filter buttons block:
```tsx
<div
  ref={headerRef}
  className={`transition-all duration-700 ease-out ${
    headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`}
>
  <h1 className="font-heading font-bold text-4xl mb-2">Les petites annonces</h1>
  <p className="text-neutral-600 text-lg mb-4">
    Retrouvez ici les annonces de particulier à particulier.
  </p>
  <div className="flex flex-wrap gap-2 mb-6">
    {/* existing filter buttons unchanged */}
  </div>
</div>
```

Wrap the annonces grid `<div className="grid cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`:
```tsx
<div ref={gridRef}>
  {sortedAnnonces.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleAnnonces.map((post, index) => (
        <div
          key={post.id}
          id={`annonce-${post.id}`}
          className={`border rounded-lg p-4 bg-white shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            gridVisible ? 'animate-fade-up' : 'opacity-0'
          }`}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          {/* existing annonce card content unchanged */}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-neutral-500 text-center">Aucune annonce pour le moment.</p>
  )}
</div>
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AssociationPage.tsx src/pages/ContactPage.tsx src/pages/ApplyPage.tsx src/pages/Annonces.tsx
git commit -m "feat: add scroll-reveal section animations to Association, Contact, Apply, Annonces pages"
```

---

## Self-Review

**Spec coverage:**
- ✅ `window.location.href` fix → Task 3
- ✅ `ContentContext.fixed.tsx` delete → Task 4
- ✅ Dev comments removed → Task 4
- ✅ `animate-slide-down` bug → Task 1 (keyframe added) + Task 3 (used in Header)
- ✅ `useScrollReveal` hook → Task 2
- ✅ Tailwind keyframes → Task 1
- ✅ Header scroll effect → Task 3
- ✅ Hero stagger → Task 6
- ✅ Section reveals all pages → Tasks 6, 7, 8
- ✅ Card hover lift → Task 5
- ✅ Button micro-animation → Task 1
- ✅ Card entry stagger → Tasks 6, 7, 8

**Placeholder scan:** No TBD, no "similar to Task N", all code is shown in full.

**Type consistency:**
- `useScrollReveal` returns `{ ref: React.RefObject<HTMLDivElement>, isVisible: boolean }` — used as `ref={headerRef}` on `<div>` elements throughout. Where sections are non-div elements (`<section>`), they are already wrapped in a `<div>` per the plan.
- `useNavigate` used in Task 3 Header for form submit, `<Link>` used for nav items — consistent.
- No type mismatches between tasks.

**Risk check:**
- No form logic touched in Tasks 7-8.
- No Supabase queries modified.
- `window.location.href` kept for the "Voir cette annonce" button in HomePage annonces section (navigates with hash anchor — `useNavigate` doesn't support hash navigation as cleanly as `window.location.href` for same-page anchors).
- Admin routes untouched.

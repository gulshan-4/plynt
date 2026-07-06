# Plynt.space — Production-Ready Plan

**Stack:** Next.js 15 (App Router) · React 19 · TipTap editor · Redux Toolkit · Tailwind v4

---

## Current State Audit (what is actually done)

| Area | Status | Notes |
|---|---|---|
| Navbar | ✅ Done | Desktop + mobile slide-out, search UI, sign-in/up buttons |
| Footer | ⚠️ Placeholder | Hardcoded "SomeCompany 2021", no real links |
| Home page | ⚠️ Bare | 3 hardcoded posts, no layout responsiveness at desktop |
| Card component | ⚠️ Incomplete | Tags hardcoded (#travel #holidays), likes/comments hardcoded, no link to article |
| Article page (`[user]/[article]`) | ✅ Good foundation | Cover, body, comments (with replies), sidebar actions (like/save/share), TopPosts sidebar |
| Write page (`[user]/write`) | ✅ Good foundation | TipTap editor, cover upload, draft autosave (localStorage), slug gen, tags, preview |
| HomeCategories sidebar | ✅ Done | Animated category cards with images |
| CategoryCard | ✅ Done | Good visual, featured ribbon, tags preview |
| Categories page | ⚠️ Only 2 hardcoded items | |
| Trending page | ⚠️ Bare | 3 hardcoded cards, no sidebar, no sort |
| Latest page | ⚠️ Bare | Same as trending, identical code |
| TopPosts | ⚠️ Hardcoded | 3 mock posts, no real links |
| PopularTags | ⚠️ Hardcoded | 5 mock tags |
| Note/Tip/Warning/Info | ✅ Done | Callout components for article body |
| Redux (theme) | ⚠️ Incomplete | themeSlice exists, BodyWrapper applies `.dark`, but dark mode UI is commented out in Navbar |
| Profile page | ❌ Missing | No `[user]/page.jsx` at all |
| Auth UI | ❌ Missing | Sign In/Sign Up buttons go to `#` |
| Search results | ❌ Missing | Search bar UI exists but no results page |
| SEO / metadata | ⚠️ Hardcoded | Article layout has one static title; layout.js description is boilerplate |
| `@tailwindcss` import | ⚠️ Bug | `globals.css` has both `@tailwind base/components/utilities` AND `@import "tailwindcss"` — pick one (use `@import "tailwindcss"` for v4) |
| ProseMirrorEditor | 🗑️ Remove | Unused file — TipTap is chosen, ProseMirror deps should be cleaned up |
| `console.log` in article | ⚠️ Remove before prod | Line 476: `console.log("slug", article)` |
| Dark mode support | ⚠️ Incomplete | CSS vars exist, themeSlice exists, but Navbar toggle is commented out and components use hardcoded `bg-white` everywhere |

---

## Critical Fixes (do these first — they are blockers)

### 1. Fix globals.css Tailwind import
**File:** `src/app/globals.css`
Remove the old directives, keep only the v4 import:
```css
/* REMOVE these three lines: */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* KEEP only: */
@import "tailwindcss";
```

### 2. Remove ProseMirror (unused dependency bloat)
- Delete `src/app/components/ProseMirrorEditor.jsx`
- Run: `npm uninstall prosemirror-commands prosemirror-dropcursor prosemirror-gapcursor prosemirror-history prosemirror-inputrules prosemirror-keymap prosemirror-model prosemirror-schema-basic prosemirror-schema-list prosemirror-state prosemirror-view`

### 3. Fix Card — must be clickable
**File:** `src/app/components/Card.jsx`
- Wrap the card in a `<Link href={`/${user}/${slug}`}>` — cards currently navigate nowhere
- Remove hardcoded `#travel #holidays` tags — accept `tags[]` prop
- Remove hardcoded "Superhost", "76 replies", "10 likes" — accept `author`, `comments`, `likes` props

### 4. Remove console.log from article page
**File:** `src/app/[user]/[article]/page.jsx` line 476

### 5. Fix Footer
**File:** `src/app/components/Footer.jsx`
- Update copyright year dynamically (`{new Date().getFullYear()}`)
- Replace "SomeCompany" with "Plynt.space"
- Replace `href="#"` links with real routes (`/about`, `/categories`, `/latest`, `/contact`)

### 6. Fix metadata in layout.js
**File:** `src/app/layout.js`
```js
export const metadata = {
  title: "Plynt.space — A place for thoughtful writing",
  description: "Discover articles on travel, tech, food, lifestyle and more.",
  openGraph: { ... }
};
```

---

## Frontend — What to Build Next (priority order)

### PHASE 1 — Complete existing pages (1–2 weeks)

#### 1a. Home page (`page.js`)
- [ ] Replace `w-max` with proper responsive grid layout
- [ ] Pass real props to Card (author, tags, slug, likes, comments)
- [ ] Add `generateMetadata` for SEO
- [ ] Make the left sidebar (`HomeCategories`) sticky and scroll-independent
- [ ] Add a "Hero" section above cards — featured post with large image

#### 1b. Trending / Latest pages
These are identical and both bare. Both need:
- [ ] Extract shared layout to a `FeedLayout` component with a sidebar
- [ ] Add TopPosts + PopularTags in right sidebar (same as homepage)
- [ ] Add sort selector UI (Latest, Popular, Trending) — toggle between pages/params
- [ ] Accept and render real Card data with proper props

#### 1c. Article page — production polish
- [ ] Remove hardcoded `console.log`
- [ ] Replace hardcoded cover `/article-cover.webp` with dynamic `params` data
- [ ] Replace hardcoded author/date/tags with dynamic data
- [ ] Fix article metadata: `generateMetadata` returning dynamic title + description + og:image
- [ ] Add "Author block" below article (avatar, name, bio, follow button)
- [ ] Add "Related posts" section at the bottom
- [ ] Make the like button stateful (toggle, show active state)
- [ ] Make the save/bookmark button stateful (toggle with localStorage)
- [ ] Add share button: copy link + Twitter intent

#### 1d. Write page — production polish
- [ ] Add `H3`, `Strike`, `Underline` toolbar buttons
- [ ] Replace `prompt()` for link URL with a proper inline modal/popover
- [ ] Replace `confirm()` for clear draft with a proper confirmation modal
- [ ] Add category selector dropdown in sidebar
- [ ] Add cover image drag-and-drop support
- [ ] Add "Save as Draft" button (separate from Publish)
- [ ] Fix: tags should use chip-style input (add on comma/Enter, removable), not a plain text field
- [ ] The toolbar is in the sidebar — move it above the editor (standard UX pattern)

#### 1e. Categories page
- [ ] Add all 6 categories (matching the HomeCategories sidebar data)
- [ ] Add article count from mock data
- [ ] Add search/filter by name UI
- [ ] Link CategoryCard to a `/categories/[slug]` page showing filtered posts

### PHASE 2 — Missing pages (2–3 weeks)

#### 2a. Profile page `[user]/page.jsx` — HIGH PRIORITY
This is completely missing. Build it as a "mini homepage":
- [ ] Hero: cover banner + avatar + display name + tagline + follow button + stats (posts, followers, following)
- [ ] Pinned post section
- [ ] Posts grid (author's articles)
- [ ] About / bio section with social links
- [ ] "Edit Profile" link (visible only to owner)
- Use `generateMetadata` with canonical URL

#### 2b. Auth UI (Sign In / Sign Up)
- [ ] Create modal or dedicated `/sign-in` and `/sign-up` pages
- [ ] Sign In: email + password + Google OAuth button (UI only)
- [ ] Sign Up: name + email + password + username
- [ ] Show validation errors inline
- [ ] On success: redirect + show user avatar in navbar

#### 2c. User Dashboard `/dashboard`
- [ ] My Posts tab (list with edit/delete actions)
- [ ] Drafts tab
- [ ] Bookmarks tab
- [ ] Settings tab (avatar, bio, custom domain field)

#### 2d. Search Results `/search?q=...`
- [ ] Results list using Card component
- [ ] Filter by category, tag, date
- [ ] "No results" state

#### 2e. Tag page `/tags/[slug]`
- [ ] List of articles with that tag
- [ ] Tag stats (post count)

#### 2f. Category detail page `/categories/[slug]`
- [ ] Filtered article list
- [ ] Category hero image + description

### PHASE 3 — UI/UX polish (1 week)

- [ ] **Dark mode** — uncomment the toggle in Navbar, and audit every component: replace hardcoded `bg-white`, `text-gray-800` etc. with CSS variable-based classes that respond to `.dark`
- [ ] **Skeleton loaders** — replace "loading..." states with skeleton UI for cards, article, sidebar
- [ ] **Error boundaries** — add `error.jsx` files per route segment
- [ ] **Not-found pages** — add `not-found.jsx` per route with good UX
- [ ] **Loading states** — add `loading.jsx` per route
- [ ] **Font** — add a proper Google Font (Inter or Outfit) in `layout.js`
- [ ] **Micro-animations** — card hover lift, button press feedback, page transitions
- [ ] **Accessibility** — add `aria-label` to all icon-only buttons (like/save/share in article sidebar)
- [ ] **Mobile audit** — test home, article, write pages on 375px width; fix overflow/scroll issues
- [ ] **Image optimization** — replace all `<img>` tags with `<Image>` from `next/image` (CategoryCard still uses `<img>`)

### PHASE 4 — Data layer (SWR + API ready)

Before wiring any backend, wrap all mock data in SWR fetcher hooks:
- [ ] `useArticles(params)` — returns articles list
- [ ] `useArticle(slug)` — returns single article
- [ ] `useProfile(username)` — returns user profile
- [ ] `useCategories()` — returns categories
- [ ] `useTags()` — returns popular tags
- [ ] `useTopPosts()` — returns top posts

All hooks return mock data now, but are structured so you just swap the fetch URL later.

---

## Architecture Decisions (locked in)

| Decision | Choice | Reason |
|---|---|---|
| Editor | **TipTap** (keep) | Already built with custom nodes, remove ProseMirror |
| State | **Redux** for auth/theme, **SWR** for server data | Redux is installed, useful for global auth state |
| CSS | **Tailwind v4** | Already installed — fix the import |
| Dark mode | **CSS variables + `.dark` class** | Already scaffolded in globals.css + BodyWrapper |
| Font | **Inter** from Google Fonts | Add to layout.js |
| Images | **next/image** everywhere | Some components still use raw `<img>` |

---

## Backend (implement after Phase 1–3 frontend done)

**Recommended: Supabase** (Auth + Postgres + Storage in one)

### DB Schema (unchanged from original plan — still valid)

```sql
users         — id, username, display_name, bio, avatar_url, custom_domain, domain_verified
posts         — id, author_id, title, slug, excerpt, body_html, status, cover_url, category_id, views_count
tags          — id, name, slug
post_tags     — post_id, tag_id
comments      — id, post_id, author_id, parent_comment_id, body, status
likes         — user_id, post_id  (unique)
bookmarks     — user_id, post_id
follows       — follower_id, followee_id
media         — id, owner_id, url, storage_provider
custom_domains — id, user_id, domain, verified, verification_token
```

### Auth
- **NextAuth.js** with Supabase adapter, OR Supabase Auth directly
- Support: email/password + Google OAuth

### API Routes (Next.js App Router server actions or route handlers)
```
GET  /api/posts?page=&limit=&category=&tag=&sort=
GET  /api/posts/[slug]
POST /api/posts           (auth required)
PATCH /api/posts/[id]     (auth, owner only)
DELETE /api/posts/[id]    (auth, owner only)
POST /api/posts/[id]/like
POST /api/posts/[id]/comment
GET  /api/users/[username]
POST /api/media/upload
POST /api/domains/verify
```

### Hosting
- **Frontend:** Vercel (free, best Next.js support)
- **Backend:** Supabase free tier → upgrade when traffic warrants
- **Images:** Supabase Storage (free up to 1GB)
- **Email:** Resend or SendGrid free tier (verification, notifications)

---

## Production Readiness Checklist

### Security
- [ ] Sanitize HTML from TipTap before storing (use DOMPurify server-side)
- [ ] **Rate limiting** — use `next-rate-limit` or Upstash Redis on API routes: `/api/posts` (create), `/api/comments`, `/api/likes`. Limits: e.g. 5 posts/hour, 30 comments/hour per IP/user
- [ ] Auth middleware protecting write/dashboard routes
- [ ] CSP headers in `next.config.mjs`
- [ ] `NEXT_PUBLIC_*` env vars only for truly public values
- [ ] **Password reset** — `POST /api/auth/forgot-password` sends email with time-limited token; `POST /api/auth/reset-password` validates token and updates password (Supabase Auth handles this natively)
- [ ] **Account deletion** — `DELETE /api/users/me` deletes user row, all posts, comments, likes, media. Requires password confirmation. Soft-delete posts first (status = 'deleted'), then hard-delete after 30 days

### Performance
- [ ] `next/image` everywhere (lazy loading, sizing)
- [ ] Pagination or infinite scroll for article lists (not loading 1000 cards)
- [ ] `generateStaticParams` for popular article slugs (ISR)
- [ ] Avoid `"use client"` on pages that don't need it — keep RSC where possible

### SEO
- [ ] `generateMetadata` on every page (dynamic title, description, og:image)
- [ ] `<link rel="canonical">` on profile pages
- [ ] Sitemap (`/sitemap.xml`) via `next-sitemap` or App Router's built-in
- [ ] robots.txt
- [ ] Structured data (Article schema) on article pages

### Monitoring (add before go-live)
- [ ] Error tracking: Sentry (free tier)
- [ ] Analytics: Plausible or Vercel Analytics
- [ ] Uptime: Better Uptime or UptimeRobot (free)

---

## Immediate "Do This Now" Checklist

1. `[x]` Fix `globals.css` — remove duplicate Tailwind imports
2. `[x]` Remove `ProseMirrorEditor.jsx` and uninstall ProseMirror packages
3. `[x]` Fix `Card.jsx` — make it accept real props and be a real `<Link>`
4. `[x]` Fix `Footer.jsx` — real branding, dynamic year, real links
5. `[x]` Update `layout.js` metadata — real title/description
6. `[x]` Fix `Navbar` — uncomment dark mode toggle
7. `[x]` Fix `Article page` — remove console.log, make metadata dynamic
8. `[x]` Add Inter font to `layout.js`
9. `[x]` Build `[user]/page.jsx` — the profile page is 100% missing
10. `[x]` Build Auth UI (sign-in/sign-up modal or pages)
11. `[x]` Build Password Reset UI — `/forgot-password` page (email input) + `/reset-password?token=...` page (new password input)
12. `[x]` Build Account Deletion UI — Settings page → "Delete Account" with password confirmation modal
13. `[x]` Refactor Trending/Latest — share FeedLayout, add sidebar
14. `[x]` Move Write page toolbar above editor
15. `[x]` Wrap all mock data in SWR hooks
16. `[ ]` Add rate limiting to API routes (install `@upstash/ratelimit` + Upstash Redis, or `next-rate-limit`)
17. `[ ]` Audit dark mode across all components
18. `[ ]` Replace `<img>` in CategoryCard with `<Image>`
19. `[ ]` Add `not-found.jsx` and `error.jsx` per route
20. `[ ]` Add `aria-label` to all icon-only buttons
21. `[ ]` Generate `sitemap.xml`
22. `[ ]` Deploy to Vercel
23. `[ ]` Set up Supabase project and wire auth + posts API
24. `[ ]` Wire password reset to Supabase Auth (`supabase.auth.resetPasswordForEmail()`)
25. `[ ]` Wire account deletion to Supabase (`supabase.auth.admin.deleteUser()` + cascade delete data)

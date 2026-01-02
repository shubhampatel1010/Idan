# Design Guidelines: Property-Tenant Matching Dashboard

## Design Approach

**Selected Approach:** Design System + Reference Hybrid
- **Primary Reference:** Linear (modern SaaS dashboard aesthetics)
- **Secondary Reference:** Notion (data organization), Airbnb (property cards)
- **Rationale:** Utility-focused application requiring efficiency, data clarity, and professional polish

## Core Design Elements

### Typography Hierarchy

**Font Stack:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for IDs, numbers)

**Hierarchy:**
- Page Titles: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Metadata/Labels: text-sm font-medium
- Supporting Text: text-sm text-gray-600
- Captions: text-xs

### Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section gaps: gap-6, gap-8
- Container margins: m-4, m-6, m-8
- Card spacing: space-y-4

**Grid Structure:**
- Dashboard: 2-column stat cards on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Property List: 3-column cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Filters: Single column stack on mobile, multi-column on desktop
- Max container width: max-w-7xl mx-auto px-4

## Component Library

### Dashboard Page
- **Stats Cards:** Large number display (text-4xl font-bold), label beneath (text-sm), subtle border, rounded corners (rounded-lg), consistent height
- **Filter Panel:** Horizontal filter bar with dropdowns and range sliders, collapsible on mobile, always visible on desktop
- **Quick Actions:** Prominent "Add Property" and "Add Tenant" buttons (if applicable)

### Property List Page
- **Property Cards:** Image at top (aspect-ratio-16/9), title, key details (rent, bedrooms, bathrooms) in grid, two action buttons at bottom full-width stacked
- **View Button:** Primary styling, full-width
- **Matched Button:** Secondary styling with match count badge
- **List Header:** Search bar + filter toggles + sort dropdown aligned horizontally

### Property Detail Page
- **Image Gallery:** Hero image carousel at top (h-96), thumbnail strip below for navigation
- **Details Grid:** Two-column layout for specifications (label-value pairs)
- **Features Section:** Icon grid showing amenities (furnished, parking, pets, etc.)
- **Description:** Max-width prose layout (max-w-prose)
- **Similar Properties:** Horizontal scrollable card strip at bottom, compact cards showing image + title + rent + bedrooms

### Matched Tenants Page
- **Tenant Cards:** Profile photo (circular, w-16 h-16), name + match percentage prominently displayed, expandable details section
- **Match Score:** Large percentage display (text-2xl font-bold) with progress bar visualization
- **Matching Criteria:** Small badges showing matched preferences (neighborhood, bedrooms, etc.)
- **Send Button:** Prominent position, disabled state after sending, success feedback

### Navigation
- **Sidebar (Desktop):** Fixed left navigation (w-64), logo at top, page links with icons (Heroicons), active state highlighting
- **Mobile:** Bottom tab bar with 4 main sections, hamburger menu for secondary actions
- **Breadcrumbs:** Show on detail pages (Dashboard > Properties > Property Name)

### Shared Components
- **Buttons:** rounded-md, consistent padding (px-4 py-2), clear hierarchy (primary/secondary/ghost)
- **Input Fields:** Consistent border styling, proper labels above inputs, helper text below
- **Dropdowns:** Clean select styling with chevron icon
- **Loading States:** Skeleton loaders matching component shapes
- **Error States:** Inline error messages, retry buttons
- **Empty States:** Centered icon + message + action button

### Data Display
- **Tables (if used):** Striped rows, sticky header, sortable columns, responsive (stack on mobile)
- **Badges:** Rounded-full, small text (text-xs), status indicators (Available, Occupied, Sent)
- **Progress Bars:** Match percentage visualization, consistent height (h-2)

### Modals/Overlays
- **Confirmation Dialogs:** Centered, max-w-md, clear actions (Cancel/Confirm)
- **Image Lightbox:** Full-screen overlay for property images, navigation arrows, close button

## Animations
- **Minimal transitions only:** hover states (subtle opacity change), page transitions (none/instant), loading spinners
- **No scroll animations** or complex interactions

## Images
- **Property Images:** Required for all property cards and detail views
- **Tenant Profile Photos:** Circular avatars in matched tenants list
- **Empty State Illustrations:** Simple icon-based graphics (using Heroicons)
- **No hero image** - this is a dashboard application, not a marketing site

## Responsive Breakpoints
- Mobile: < 768px (stack all layouts)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full multi-column layouts)
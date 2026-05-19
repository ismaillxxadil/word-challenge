# Frontend FCP Analysis

This is a code-based review of likely reasons the frontend First Contentful Paint is high. I did not run a browser trace here, so the items below are ranked by how strongly the code suggests they affect FCP.

## High-confidence causes

### 1. The root layout loads an external Google Font before first paint

The app shell loads `Playpen Sans Arabic` through a blocking stylesheet in the document head. That means the browser must fetch and process a third-party font resource before the page can paint with the intended typography.

Files:

- `client/web/app/layout.tsx`
- `client/web/app/globals.css`

Why this matters:

- External fonts add network round trips.
- The font is used as the global `font-sans`, so text rendering is tied to that resource.
- The layout does not use `next/font`, so there is no built-in font optimization or automatic preload strategy.

### 2. The landing page is a client component with a large interactive bundle

The home route is marked `use client` and imports several heavy client-side libraries directly into the initial page bundle, including `framer-motion`, `howler`, `lucide-react`, the avatar selector, and the sound hook.

Files:

- `client/web/app/page.tsx`
- `client/web/hooks/useSound.ts`
- `client/web/components/AvatarSelector.tsx`

Why this matters:

- The browser must download and execute more JavaScript before the page settles.
- `howler` initializes preloaded sound objects in an effect.
- `framer-motion` adds animation runtime cost to the initial route.
- The avatar selector renders a grid of remote avatar images immediately.

### 3. The landing page renders a large amount of decorative DOM on startup

The home page builds 55 floating letters, multiple blurred gradient orbs, motion wrappers, and several nested cards and buttons. Even though these are mostly visual, they increase DOM size and paint work on the first screen.

Files:

- `client/web/app/page.tsx`

Why this matters:

- More DOM nodes increase initial render cost.
- Large blur regions, backdrop blur, shadows, and animated gradients are expensive to paint.
- The page animates a lot of elements immediately on mount.

### 4. The page uses expensive visual effects above the fold

The landing card and background rely on `backdrop-blur`, large blur radii, multiple shadow layers, animated gradient text, and pulse animations.

Files:

- `client/web/app/page.tsx`
- `client/web/components/Model.tsx`

Why this matters:

- Blur and backdrop-filter are paint-heavy, especially on lower-end devices.
- Several of these effects are applied immediately on the first viewport.

## Medium-confidence contributors

### 5. Global analytics and toaster UI are mounted on every page

The root layout mounts `Toaster`, `Analytics`, and `SpeedInsights` for all routes.

File:

- `client/web/app/layout.tsx`

Why this matters:

- These add client-side runtime and extra third-party scripts to every page load.
- They are probably not the main FCP issue, but they do increase baseline work.

### 6. The room page is also a client component and eagerly loads game UI

The room route is also `use client` and imports motion, sound, room state, modal UI, lobby UI, and game UI.

File:

- `client/web/app/[room_id]/page.tsx`

Why this matters:

- If this route is part of the slow path being measured, its initial JS cost will be high.
- It connects to room state on mount and conditionally loads multiple large UI trees.

### 7. Remote avatars can delay visual completeness

The avatar picker uses remote `api.dicebear.com` images.

Files:

- `client/web/components/AvatarSelector.tsx`
- `client/web/next.config.ts`

Why this matters:

- Remote images can slow the page if they are part of the above-the-fold content.
- They are not as likely to dominate FCP as fonts and JS, but they add network dependency.

## What is most likely hurting FCP the most

If I had to prioritize the top reasons from the code alone, I would rank them as:

1. External Google Font loaded in `layout.tsx`
2. Large client-side landing bundle from `page.tsx` plus motion/sound/avatar dependencies
3. Heavy above-the-fold decorative rendering and blur effects on the landing page
4. Global client scripts from analytics/toaster/speed-insights

## Practical next steps

1. Replace the Google Fonts `<link>` with `next/font`.
2. Reduce the landing page client bundle by splitting non-critical UI out of the initial route.
3. Remove or defer the decorative background letters and some motion effects for the first paint.
4. Consider lazy-loading `AvatarSelector`, `Toaster`, or sound-related code where possible.
5. Measure with a real Lighthouse or Web Vitals trace after each change.

## Notes

This report is based on code inspection only. To confirm the actual FCP bottleneck, the next useful check would be a Lighthouse trace or the browser performance panel on the landing route.

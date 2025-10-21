# YouTube Music Clone · Responsive QA Checklist

- **Breakpoints covered:** xs <480, sm ≥480, md ≥768, lg ≥1024, xl ≥1440. Verify layout transitions at each threshold using Chrome DevTools device toolbar.
- **Navigation & shell:** Confirm sidebar density swaps (expanded/compact/hidden) line up with the breakpoints above, mobile tab bar remains tappable, and the footer player offsets correctly when the nav is visible.
- **Hero sections:** On album/playlist/mix detail pages, ensure artwork maintains a square aspect ratio, gradients render via the new CSS tokens, and action buttons wrap without overlap on devices ≤480px wide.
- **Carousels & lists:** Horizontal scrollers should expose scroll controls on desktop, snap-scroll smoothly on touch, and adjust card spacing on xs/sm screens. Track tables should collapse the album column below md and remain scrollable without clipping.
- **Sheets & drawers:** Mobile queue drawer and track action sheet should inherit the frosted backdrop utilities, avoid background bleed, and respect the safe area at the bottom.
- **Theming regression pass:** Toggle between music and non-music routes to confirm new CSS variables do not leak globally and that `bg-music-hero`/`bg-music-queue` classes still match prior gradients.
- **Residual risks:** No automated visual regression; capture manual screenshots if gradients or shadows appear inconsistent, especially on Safari where `backdrop-filter` support differs. Record anomalies in the project log before promoting to the next phase.

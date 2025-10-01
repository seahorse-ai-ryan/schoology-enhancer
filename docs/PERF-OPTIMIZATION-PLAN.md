# Performance & Cost Optimization Plan

Last Updated: September 30, 2025
Scope: Rendering speed, API latency, cross-browser, cost controls.

---

## Performance Targets (SLOs)

- LCP < 2.0s p75 (mid-tier Android/iPhone), TTI < 1.5s
- API p95 < 500ms; cache-hit ratio > 70%
- Memory footprint stable across tabs; no leaks on SPA nav

## Rendering Strategy

- Split dashboard into independently streaming widgets
- Prefetch next-likely data on idle (course grades when viewing assignments)
- Virtualize long lists (assignments)
- Minify and tree-shake aggressively; remove unused shadcn components from bundles

## Network Strategy

- SWR/TanStack dedupe; stale-while-revalidate
- Compress JSON (gzip/br); prefer selective fields in API
- ETags for Schoology proxy responses (if applicable)

## Cross-Browser/OS

- Test matrix: iOS Safari 16+, Android Chrome 120+, Desktop Chrome/Edge/Firefox
- Use `prefers-reduced-motion` and avoid heavy CSS animations on low-power devices

## Cost Optimization

- Firestore reads: batch, paginate, limit; move derived fields client-side
- Index only essential queries; review monthly
- AI: use Gemini Flash; cap per-user; cache generated summaries by key

## Monitoring

- Web Vitals reporting to Analytics
- Custom dashboard: LCP/FID/TTI distributions, API p95, cache-hit ratio

## Release Gates

- Block promotion if LCP regresses > 15% vs prior release
- Warn if API p95 > 750ms on Beta

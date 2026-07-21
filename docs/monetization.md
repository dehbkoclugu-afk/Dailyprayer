# Monetization Playbook

Goal: subscription-first, ad-free. Modeled on the proven category funnel
(Bible Chat onboarding × Hallow content × YouVersion retention).

## Funnel

```
Install → Welcome → 9-step quiz (investment) → "Building your plan…" →
Plan reveal (personalized) → PAYWALL (trial ON, annual pre-selected) →
  subscribe → charity reframe → Today
  dismiss   → limited free tier → contextual paywalls on locked content
```

## Pricing (initial; A/B via RevenueCat offerings)

| SKU | Price | Role |
|-----|-------|------|
| `lumen.weekly` | $9.99/wk | anchor — makes annual look 87% cheaper |
| `lumen.annual` | $59.99/yr + 7-day trial | **default selection** |
| `lumen.lifetime` | $129.99 | churn rescue / power users |
| Dismiss offer | 50% off first year | shown once on paywall close |

## Free vs Plus

| Feature | Free | Plus |
|---------|------|------|
| Daily verse + streak + widget | ✓ | ✓ |
| Daily devotional | ✓ | ✓ |
| Guided prayers | 3 starter | full library |
| Sleep prayers & stories | — | ✓ |
| Reading plans | 1 active | unlimited + Bible-in-a-Year |
| AI "write my prayer" | 3/week | unlimited |
| Journal | ✓ (local) | + sync/export |

Free tier must be genuinely lovable (YouVersion lesson) — the daily loop is free,
depth is paid. Retention sells the subscription; the paywall just collects it.

## Retention levers (in v1 code)

- App-open streak + completion ring; streak-save local notification at 20:30 if today's
  ritual is unfinished.
- Prayer-time reminder at user-chosen hour with rotating verse hooks.
- Shareable verse images (organic acquisition).
- Charity reframe post-purchase reduces refunds and buyer's remorse.

## KPIs

D1 ≥ 45%, D7 ≥ 25%, trial start ≥ 8% of installs, trial→paid ≥ 40%,
12-mo LTV target $18+ per install on faith-keyword UA.

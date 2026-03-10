# Code for Beginner

MVP foundation for a child-friendly logic learning platform built with Next.js, TypeScript, Tailwind CSS, and Supabase-ready data models.

## Run

```bash
npm install
npm run dev
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase schema and API integration points
- Playwright E2E scaffolding

## Notes

- The app ships with seed content so the MVP is playable immediately.
- If Supabase environment variables are configured, API routes can persist attempts and admin-created activities to the backend.

## Subscription, Payment, And Rewards

### Subscription gating

- Child progression is level-based.
- Free access is capped at level 5 through a shared config rule.
- Activities above the free cap remain visible but become locked until a parent subscription is active.
- Locked progression is enforced in the child UI and in the server-side attempt API.

### Brainy Coins

- Correct answers award Brainy Coins.
- Completing an activity awards a bonus.
- Leveling up awards an extra bonus.
- Child progress stores both the current balance and the lifetime total earned.

### Reward milestones

The MVP ships with config-driven reward milestones:

- `50` Brainy Coins: Mini Game unlock
- `100` Brainy Coins: New Avatar unlock
- `500` Brainy Coins: Junior Coder Certificate

These unlocks are stored separately from the UI so more reward types can be added later.

### Payment integration seam

- Subscription state is stored in `user_subscriptions`.
- The current upgrade flow is a placeholder/manual activation path intended for MVP use.
- `/api/subscriptions/upgrade` is the integration seam for a future checkout provider such as Stripe.
- Provider-oriented fields already exist on the subscription model so real billing identifiers can be attached later.

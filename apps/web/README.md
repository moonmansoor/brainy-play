# Code for Beginner

`apps/web` contains the main Brainy Play web app built with Next.js, TypeScript, Tailwind CSS, and Supabase-ready APIs.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Current product behavior

### Subscription gating

- The free tier is limited by a configurable free-level rule.
- MVP default: non-subscribed children can progress through **level 5**.
- Activities above the free cap are shown as locked and disabled in the child UI.
- Premium access is enforced in server-side flow as well as the client experience.
- `src/app/api/subscriptions/upgrade/route.ts` is the current placeholder upgrade endpoint and is the intended seam for a future Stripe integration.

### Brainy Coins and rewards

- Children earn **Brainy Coins** for successful gameplay.
- Coins can be awarded for correct answers, full activity completion, and progression events.
- Reward milestones are data/config driven and currently include:
  - `mini-game`
  - `new-avatar`
  - `junior-coder-certificate`

## Activity system

The activity system is now template-based instead of being limited to a fixed switch of hardcoded logic.

### Supported interaction types

- `drag-drop`
- `click-select`
- `draw-trace`
- `type-answer`
- `object-match`
- `sort`
- `sequence`
- `connect`
- `block-arrange`

### Example activity types

- `shape-match`
- `count-objects`
- `pattern-complete`
- `sort-game`
- `odd-one-out`
- `sequence-order`
- `maze-path`
- `connect-logic`
- `code-blocks`
- `word-builder`

### Template architecture

Each activity template defines:

- activity type
- interaction type
- supported themes
- learning areas
- level-based difficulty rules
- generation guidance
- default explanation text
- fun fact pool

Core template registry:

- [`src/features/activities/template-registry.ts`](/Users/munirohmansoor/brainy-play/apps/web/src/features/activities/template-registry.ts)

Shared activity model:

- [`src/types/activity.ts`](/Users/munirohmansoor/brainy-play/apps/web/src/types/activity.ts)

Renderer registry:

- [`src/features/activities/activity-renderers.tsx`](/Users/munirohmansoor/brainy-play/apps/web/src/features/activities/activity-renderers.tsx)

## Learning and progress tracking

Attempts now track more than score alone. The model supports:

- activity type
- interaction type
- learning areas
- level played
- difficulty snapshot
- success rate
- correct answers
- total prompts
- duration
- mistakes
- explanation text
- fun fact
- per-learning-area scores

This supports later parent reporting in areas such as:

- pattern recognition
- logic reasoning
- spatial thinking
- memory
- problem solving
- sequencing
- classification

## Database direction

The Supabase schema now includes support for:

- `activity_templates`
- richer `activities` metadata
- richer `activity_attempts` analytics fields
- subscription and reward tables used by the monetization and progression layer

Schema source:

- [`supabase/schema.sql`](/Users/munirohmansoor/brainy-play/apps/web/supabase/schema.sql)

## Adding a new activity type

1. Add the new type and its config/answer types in [`src/types/activity.ts`](/Users/munirohmansoor/brainy-play/apps/web/src/types/activity.ts).
2. Register a template in [`src/features/activities/template-registry.ts`](/Users/munirohmansoor/brainy-play/apps/web/src/features/activities/template-registry.ts).
3. Add starter JSON in [`src/lib/validation/activity.ts`](/Users/munirohmansoor/brainy-play/apps/web/src/lib/validation/activity.ts).
4. Implement the playable component in `src/games/...`.
5. Register the renderer in [`src/features/activities/activity-renderers.tsx`](/Users/munirohmansoor/brainy-play/apps/web/src/features/activities/activity-renderers.tsx).
6. Add sample or seeded content in [`src/lib/constants/sample-data.ts`](/Users/munirohmansoor/brainy-play/apps/web/src/lib/constants/sample-data.ts).
7. If needed, extend persistence mapping in the API/repository layer.

## Notes

- The app ships with sample content so the MVP is playable without backend setup.
- If Supabase environment variables are configured, activity attempts and admin-authored activities can persist to the backend.
- `npm run typecheck` and `npm run build` should stay green when adding new activity templates.

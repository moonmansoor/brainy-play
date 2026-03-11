# Brainy Play

Brainy Play is a child-friendly interactive learning platform for ages **4-12**. It blends playful logic games, parent visibility, level progression, subscription gating, and an in-app reward loop built around **Brainy Coins**.

## What the MVP supports

- Interactive logic activities instead of quiz-style worksheets
- Child profiles with tracked attempts and progress snapshots
- Template-driven activity content so new games can be added without hardcoding every activity
- Free access through **level 5**, with premium progression locked after that
- **Brainy Coins** earned from successful play and level progress
- Reward milestones such as **Mini Game**, **New Avatar**, and **Junior Coder Certificate**

## Activity system

The platform now supports a broader set of interaction models:

- Drag and drop
- Click selection
- Drawing and tracing
- Typing simple answers
- Object matching
- Sorting objects
- Sequence arrangement
- Connecting related elements
- Early code-block ordering

Current example activities include shape matching, pattern building, logic sorting, odd one out, sequence ordering, maze direction, connect the logic, code blocks thinking, and word building.

## Adaptive progression

- Activity types now act as reusable gameplay formats instead of fixed 1-2 question packs.
- Each play session generates a fresh task set for the child’s current skill level.
- Mastery is tracked per skill area, not just by counting completed activities.
- If a child has not mastered a skill, the system keeps serving new variations at the same level.
- Parents can see current level, strengths, and areas that need more practice.

## Subscription and rewards

- Non-subscribed learners can play normally until the configurable free level cap.
- After level 5, locked levels and premium activities remain visible but disabled.
- Subscription state is modeled in the backend and exposed through a placeholder upgrade route that can later connect to Stripe or another provider.
- Brainy Coins are awarded for correct answers, completed activities, and progression milestones.
- Reward unlocks are data-driven and can expand without embedding milestone logic directly in UI components.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready Auth, database, and storage integration points

## Status

MVP foundation with working activity engine, progression tracking, premium gating, and reward scaffolding.

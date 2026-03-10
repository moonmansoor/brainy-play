12. Database Design (Initial)
12.1 profiles

Represents parent/admin users.

Suggested fields:

id

role (parent | admin)

full_name

email

created_at

12.2 children

Suggested fields:

id

parent_id

display_name

age

avatar_url

current_level

created_at

12.3 activities

Suggested fields:

id

title

slug

type

age_min

age_max

difficulty

instructions_text

instructions_audio_url

thumbnail_url

config_json

is_published

created_at

updated_at

12.4 activity_assets

Suggested fields:

id

activity_id

asset_type (image, audio)

file_url

metadata_json

12.5 activity_attempts

Suggested fields:

id

child_id

activity_id

score

stars_earned

completed

hints_used

mistakes_count

duration_seconds

started_at

finished_at

12.6 badges

Suggested fields:

id

code

title

description

image_url

12.7 child_badges

Suggested fields:

id

child_id

badge_id

awarded_at

13. Data Model Notes
activities.config_json

Store activity-specific configuration in JSON so that different game types can reuse one activity table.

Examples:

correct answer index

draggable items

drop zones

sequence order

card pairs

display rules

hint config

This allows the content system to support multiple activity types without creating a separate table for every game.

14. UI / UX Requirements
14.1 Child UI

Must prioritize:

big cards

big buttons

minimal text

strong visual cues

happy feedback

clear progress state

14.2 Parent UI

Must show:

child performance by category

latest attempts

total stars

recommended next activities

14.3 Admin UI

Must allow:

create/edit activity

preview activity

manage publish status

upload assets

assign age/difficulty

15. Game Engine Strategy

Do not use PixiJS for the whole application.

Use PixiJS only where needed:

drag and drop games

animated matching

canvas-based shape interactions

richer touch-based mini-games

Use normal React components for:

dashboard

menus

forms

login

progress

admin tools

This hybrid approach is preferred for maintainability.

16. API / Backend Strategy

Use Supabase for backend-first MVP.

Use Supabase for:

auth

Postgres database

storage for images/audio

row-level access rules

future analytics or server logic

Server-side usage

Use Next.js server routes or server actions where needed for:

admin content creation workflows

secure dashboard aggregation

protected data fetching

custom business rules

17. Security and Privacy Notes

Because this system is for children, implementation should be conservative and privacy-aware.

Requirements:

minimal personal data

no public child profiles

parent-controlled access

secure auth

safe storage rules

no ads

no public chat features

no unnecessary tracking

18. Analytics Events

Track these events:

activity_viewed

activity_started

activity_completed

activity_failed

hint_used

badge_earned

level_completed

Useful dimensions:

child age group

activity type

difficulty

duration

mistakes count

This helps improve activity quality later.

19. Testing Strategy
19.1 End-to-end tests with Playwright

Cover:

login flow

child profile selection

activity completion

score saved

parent dashboard shows progress

admin creates activity

19.2 Component tests

Cover:

answer validation

reward calculation

progress calculation

activity rendering states

19.3 Manual testing focus

Especially important on:

tablet touch interaction

mobile performance

drag and drop usability

audio playback

20. MVP Release Plan
Phase 1

Build the platform foundation:

auth

child profile

activity list

activity player framework

attempt saving

progress dashboard

Phase 2

Implement these activities:

shape match

count objects

pattern completion

odd one out

memory cards

Phase 3

Add admin content tools:

create/edit activity

upload images/audio

publish control

Phase 4

Improve motivation:

stars

badges

streaks

friendly animations

21. Coding Standards

Use TypeScript everywhere

Use reusable typed domain models

Keep activity engine modular

Separate game logic from page UI

Avoid hardcoding content in components

Prefer config-driven activity rendering

Keep components small and composable

Write tests for core logic and flows

22. Technical Recommendation Summary
Chosen stack

Next.js

React

TypeScript

Tailwind CSS

Supabase

PixiJS

Playwright

Why this stack

strong for full-stack product development with modern React architecture

efficient backend platform with Postgres, auth, storage, and APIs in one service

suitable high-performance 2D rendering for interactive educational mini-games

reliable E2E testing across browsers and mobile emulation

23. Implementation Instruction for Coding Agent

Implement an MVP for Code for Beginner using:

Next.js

React

TypeScript

Tailwind CSS

Supabase

PixiJS for interactive mini-games only

Playwright for E2E tests

Required implementation goals

Create the app structure for parent, child, and admin flows.

Implement child profile selection.

Implement activity listing and activity detail/play screens.

Implement at least 3 activity types:

shape match

count objects

pattern completion

Save attempts and scores to the backend.

Create a basic parent dashboard showing recent progress.

Create a basic admin page to add/edit activities.

Keep the system modular so new activity types can be added later.

Use a config-driven activity model where possible.

Keep the UI touch-friendly and child-friendly.

Constraints

Do not over-engineer.

Prioritize MVP completeness over advanced architecture.

Keep the code clean, modular, and typed.

Make the app production-structured, but lightweight enough for rapid iteration.



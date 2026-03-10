# Code for Beginner — Product & Technical Specification

## 1. Product Overview

**System name:** Code for Beginner

**Goal:**  
Build a child-friendly learning platform for ages **4–12** that trains **logical thinking** using interactive activities based on:

- images
- numbers
- shapes
- colors
- matching
- sorting
- sequencing
- pattern recognition
- simple problem solving

This is **not** a traditional coding IDE for kids.  
It is a **visual logic-learning system** where children develop beginner computational thinking through play.

Examples of activities:
- match shape to shadow
- count objects and pick the correct number
- drag shapes into the correct group
- arrange images in logical sequence
- find the odd one out
- complete a visual pattern
- basic if/then logic games
- memory and matching cards
- simple maze or directional reasoning

---

## 2. Target Users

### Primary users
- Kids aged **4–12**

### Secondary users
- Parents
- Teachers
- Admin/content creators

### Age grouping
The system should support content grouping by difficulty:

- **Age 4–6**: image-first, minimal text, simple matching, colors, shapes, counting
- **Age 7–9**: patterns, sequences, categorization, beginner reasoning puzzles
- **Age 10–12**: stronger logic tasks, multi-step puzzles, scoring, progression

---

## 3. Product Principles

The system must be:

- simple
- visual-first
- touch-friendly
- rewarding
- safe for children
- easy to extend with new activities

### UX rules
- Large buttons
- Bright but not overwhelming design
- Minimal reading required for younger children
- Optional audio instructions
- Fast activity loading
- Clear feedback for right/wrong actions
- Reward system (stars, badges, progress bar)

---

## 4. Recommended Tech Stack

## Frontend
- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Why
- Next.js is a modern React framework suitable for full-stack web apps and supports routing and production app structure. :contentReference[oaicite:0]{index=0}
- TypeScript improves maintainability and reduces bugs in a growing codebase. Next.js supports TypeScript directly in its setup flow. :contentReference[oaicite:1]{index=1}

## Interactive game layer
- **PixiJS** for game-like scenes and canvas-heavy interactions

### Why
- PixiJS is designed for fast 2D graphics and interactive experiences, making it suitable for drag/drop, shape games, and animated educational content. :contentReference[oaicite:2]{index=2}

## Backend / platform
- **Supabase**
  - Postgres database
  - Authentication
  - Storage for images/audio
  - Optional realtime
  - Optional edge functions later

### Why
- Supabase provides Postgres, auth, storage, APIs, and realtime in one platform, making MVP development faster and simpler. :contentReference[oaicite:3]{index=3}

## Testing
- **Playwright**

### Why
- Playwright supports end-to-end testing across Chromium, Firefox, and WebKit, including mobile emulation, which is useful for tablet and phone testing. :contentReference[oaicite:4]{index=4}

## Deployment
- **Vercel** for frontend
- **Supabase** for backend services

---

## 5. Final Architecture Decision

Use this stack for MVP:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **PixiJS** only for mini-games that need richer interaction
- **Playwright** for E2E tests

### Reasoning
Do **not** build the whole app as a heavy game engine project.

Use:
- normal React/Next.js pages for dashboards, menus, progress, settings, admin, and simple quiz screens
- PixiJS only inside specific interactive game modules

This keeps the app easier to build, test, and scale.

---

## 6. MVP Scope

## Core MVP modules

### 6.1 Child learning app
A child can:
- choose age group
- choose activity
- complete activity
- see score / stars
- unlock next levels
- get positive feedback

### 6.2 Parent dashboard
A parent can:
- create or manage child profile
- see activity history
- see strengths / weak areas
- monitor time spent
- track progress by category

### 6.3 Admin/content management
An admin can:
- create activities
- upload images
- upload optional audio
- assign age group
- assign difficulty
- publish/unpublish content

---

## 7. Activity Types for MVP

Implement these first:

### 7.1 Shape Match
Child sees a shape and chooses the matching shape.

### 7.2 Count the Objects
Child counts objects in an image and picks the right number.

### 7.3 Pattern Completion
Child completes a repeating pattern:
- circle, square, circle, square, ?

### 7.4 Sort by Group
Drag objects into the correct category:
- shape
- color
- size
- number group

### 7.5 Odd One Out
Choose the item that does not belong.

### 7.6 Sequence Order
Arrange images in logical order:
- seed → plant → flower
- morning → afternoon → night

### 7.7 Memory Cards
Flip and match image pairs.

### 7.8 Simple Logic Game
Examples:
- “If the object is red, put it in box A”
- “If it has 4 sides, put it in box B”

---

## 8. Functional Requirements

## 8.1 Authentication
Support these roles:
- child
- parent
- admin

For MVP:
- parent login
- admin login
- child can access through parent-selected profile or simple session mode

## 8.2 Child Profile
Each child profile should include:
- id
- display name
- age
- level
- avatar
- progress summary

## 8.3 Activities
Each activity should include:
- id
- title
- type
- age group
- difficulty
- instructions
- assets (images/audio)
- answer config
- scoring config
- publish status

## 8.4 Attempt Tracking
Each activity attempt should save:
- child id
- activity id
- start time
- end time
- score
- completion status
- hints used
- number of mistakes

## 8.5 Rewards
Support:
- stars
- badges
- level completion
- streaks (optional for MVP)

## 8.6 Audio
Optional but recommended:
- play voice instructions for younger children

## 8.7 Responsive / Device Support
The product must work well on:
- desktop
- tablet
- mobile

Touch interaction is important.

---

## 9. Non-Functional Requirements

- fast initial load
- activity interaction should feel smooth
- accessible large touch targets
- simple navigation
- safe child-friendly UI
- scalable content model
- maintainable TypeScript codebase
- testable core user flows

---

## 10. Suggested App Structure

## 10.1 Public / app pages
- landing page
- login
- register
- choose child profile
- activity library
- child progress
- parent dashboard
- admin dashboard

## 10.2 Feature areas
- auth
- profiles
- activities
- attempts
- rewards
- admin content management

## 10.3 Game modules
Game-specific components should be isolated from normal UI pages.

Examples:
- `shape-match`
- `pattern-complete`
- `memory-cards`
- `sort-game`

---

## 11. Suggested Folder Structure

```text
src/
  app/
    (public)/
    parent/
    child/
    admin/
    api/

  components/
    ui/
    layout/
    activity/
    rewards/
    charts/

  features/
    auth/ 
    child-profiles/
    activities/
    attempts/
    progress/
    rewards/
    admin/

  games/
    shape-match/
    count-objects/
    pattern-complete/
    sort-game/
    odd-one-out/
    memory-cards/

  lib/
    supabase/
    utils/
    validation/
    constants/

  types/
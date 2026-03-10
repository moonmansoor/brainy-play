# Brainy Play

Brainy Play is a visual learning platform that helps kids aged **4–12** develop logical thinking through fun interactive activities.

The system uses images, shapes, numbers, and puzzles to train problem-solving skills in a playful way.

## Example Activities

- Match shapes to shadows
- Count objects and choose the correct number
- Drag shapes into the correct group
- Arrange images in logical sequence
- Find the odd one out
- Complete visual patterns
- Memory and matching cards
- Simple logic puzzles
- Directional and maze challenges

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Storage)

## Goals

- Make learning logic fun for kids
- Use beautiful visuals to keep children engaged
- Support many activity types and questions
- Allow parents to track children's progress

## Target Users

- Kids aged 4–12
- Parents
- Teachers (future)

## Current Status

MVP in development.

## Subscription And Rewards MVP

- Free accounts can play through level 5.
- Levels after 5 stay visible but locked until the parent activates a subscription.
- Access control is enforced in both the UI and the attempt-saving API layer.
- Correct answers, activity completion, and level-ups award `Brainy Coins`.
- Reward milestones unlock automatically at 50, 100, and 500 Brainy Coins.

## Payment Architecture

- Parent subscriptions are stored in an internal `user_subscriptions` model with plan, status, start date, optional end date, and provider reference fields.
- The current upgrade flow uses a placeholder/manual activation path so the product can ship before a real checkout provider is connected.
- A dedicated subscription upgrade API route is in place so Stripe or another payment provider can later replace the placeholder flow without rewriting progression or access rules.

insert into public.badges (code, title, description)
values
  ('first-star', 'First Star', 'Earned after completing a first activity.'),
  ('count-champ', 'Count Champ', 'Earned after strong counting progress.')
on conflict (code) do nothing;

insert into public.reward_definitions (
  code,
  title,
  description,
  required_brainy_coins,
  reward_type,
  metadata_json
)
values
  (
    'mini-game-unlock',
    'Mini Game Unlock',
    'Unlock a bonus mini game after earning 50 Brainy Coins.',
    50,
    'mini-game',
    '{"icon":"gamepad","theme":"bonus-play"}'::jsonb
  ),
  (
    'new-avatar',
    'New Avatar',
    'Unlock a fresh avatar style after earning 100 Brainy Coins.',
    100,
    'avatar',
    '{"icon":"avatar","avatarStyle":"explorer"}'::jsonb
  ),
  (
    'junior-coder-certificate',
    'Junior Coder Certificate',
    'Celebrate a big milestone after earning 500 Brainy Coins.',
    500,
    'certificate',
    '{"icon":"certificate","printable":true}'::jsonb
  )
on conflict (code) do update
set
  title = excluded.title,
  description = excluded.description,
  required_brainy_coins = excluded.required_brainy_coins,
  reward_type = excluded.reward_type,
  metadata_json = excluded.metadata_json;

insert into public.badges (code, title, description)
values
  ('first-star', 'First Star', 'Earned after completing a first activity.'),
  ('count-champ', 'Count Champ', 'Earned after strong counting progress.')
on conflict (code) do nothing;

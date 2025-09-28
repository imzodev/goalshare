-- Seed mínimo para communities (domains/topics) y goal_templates
-- Requiere tablas con prefijo goalshare_

begin;

-- Subscription plans
insert into goalshare_subscription_plans (id, display_name, description, stripe_price_id, billing_period)
values
  ('free', 'Plan Gratuito', 'Acceso básico con límites en interacción social.', null, null),
  -- NOTA: sustituir `stripe_price_id` tras desplegar con el price real de Stripe (ver docs)
  ('premium', 'Plan Premium', 'Acceso completo con todas las funciones sociales.', null, 'monthly')
on conflict (id) do update
set
  display_name = excluded.display_name,
  description = excluded.description,
  stripe_price_id = excluded.stripe_price_id,
  billing_period = excluded.billing_period;

-- Plan permissions (bool/int/text values según necesidad)
insert into goalshare_plan_permissions (plan_id, permission_key, bool_value, int_value, text_value)
values
  ('free', 'can_comment_global', false, null, null),
  ('free', 'max_active_goals', null, 5, null),
  ('premium', 'can_comment_global', true, null, null),
  ('premium', 'max_active_goals', null, null, 'unlimited')
on conflict (plan_id, permission_key) do update
set
  bool_value = excluded.bool_value,
  int_value = excluded.int_value,
  text_value = excluded.text_value;

-- Domain: Languages y Fitness usando CTEs para capturar IDs
with lang as (
  insert into goalshare_communities (kind, slug, name, description)
  values ('domain', 'languages', 'Languages', 'Language learning topics')
  on conflict (slug) do update set slug = excluded.slug
  returning id
), fit as (
  insert into goalshare_communities (kind, slug, name, description)
  values ('domain', 'fitness', 'Fitness', 'Fitness and running topics')
  on conflict (slug) do update set slug = excluded.slug
  returning id
)
-- Topics under Languages
insert into goalshare_communities (parent_id, kind, slug, name)
select lang.id, 'topic', 'languages-english', 'English' from lang
on conflict (slug) do update set slug = excluded.slug;

with lang as (
  select id from goalshare_communities where slug = 'languages'
), fit as (
  select id from goalshare_communities where slug = 'fitness'
)
insert into goalshare_communities (parent_id, kind, slug, name)
select lang.id, 'topic', 'languages-french', 'French' from lang
on conflict (slug) do update set slug = excluded.slug;

-- Topic under Fitness
with fit as (
  select id from goalshare_communities where slug = 'fitness'
)
insert into goalshare_communities (parent_id, kind, slug, name)
select fit.id, 'topic', 'fitness-run-10k', 'Run 10k' from fit
on conflict (slug) do update set slug = excluded.slug;

-- Templates mapping to topics
with lang_en as (
  select id from goalshare_communities where slug = 'languages-english'
), lang_fr as (
  select id from goalshare_communities where slug = 'languages-french'
), fit_10k as (
  select id from goalshare_communities where slug = 'fitness-run-10k'
)
insert into goalshare_goal_templates (slug, name, description, default_topic_community_id)
select 'learn-english', 'Learn English', 'Get started learning English', id from lang_en
on conflict (slug) do update set slug = excluded.slug;

insert into goalshare_goal_templates (slug, name, description, default_topic_community_id)
select 'learn-french', 'Learn French', 'Get started learning French', id
from goalshare_communities where slug = 'languages-french'
on conflict (slug) do nothing;

insert into goalshare_goal_templates (slug, name, description, default_topic_community_id)
select 'run-10k', 'Run 10k', 'Train to complete a 10k race', id
from goalshare_communities where slug = 'fitness-run-10k'
on conflict (slug) do nothing;

commit;

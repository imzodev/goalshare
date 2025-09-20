-- Seed mínimo para communities (domains/topics) y goal_templates
-- Requiere tablas con prefijo goalshare_

begin;

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

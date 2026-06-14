-- Migration: 012_create_indexes.sql

create index idx_places_city_id on public.places(city_id);
create index idx_places_category on public.places(category);
create index idx_places_verification on public.places(verification_status);

create index idx_events_city_id on public.events(city_id);
create index idx_events_status on public.events(status);
create index idx_events_start_time on public.events(start_time);
create index idx_events_place_id on public.events(place_id);

create index idx_quests_city_id on public.quests(city_id);
create index idx_quests_is_published on public.quests(is_published);

create index idx_quest_stops_quest_id on public.quest_stops(quest_id);

create index idx_stamps_place_id on public.stamps(place_id);

create index idx_check_ins_user_id on public.check_ins(user_id);
create index idx_check_ins_place_id on public.check_ins(place_id);
create index idx_check_ins_quest_id on public.check_ins(quest_id);

create index idx_user_stamps_user_id on public.user_stamps(user_id);
create index idx_user_stamps_stamp_id on public.user_stamps(stamp_id);

create index idx_itineraries_user_id on public.itineraries(user_id);

create index idx_submissions_status on public.submissions(status);
create index idx_submissions_city_id on public.submissions(city_id);

create index idx_profiles_auth_id on public.profiles(auth_id);
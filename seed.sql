-- seed.sql — Surabaya sample data for Questara MVP

-- Admin profile (no auth_id — set after Supabase Auth user is created)
INSERT INTO profiles (id, auth_id, username, display_name, role, xp, home_city) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'admin', 'Admin User', 'admin', 0, 'Surabaya');

-- Demo user profile
INSERT INTO profiles (id, auth_id, username, display_name, role, xp, home_city) VALUES
  ('00000000-0000-0000-0000-000000000002', NULL, 'demo_user', 'Demo User', 'user', 150, 'Surabaya');

-- Surabaya city
INSERT INTO cities (id, name, province, country, lat, lng, is_active) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Surabaya', 'Jawa Timur', 'Indonesia', -7.2575, 112.7521, true);

-- Places in Surabaya (real locations with approximate coordinates)
INSERT INTO places (id, city_id, name, description, category, address, lat, lng, opening_hours, ticket_price_min, ticket_price_max, image_url, verification_status) VALUES

-- Museums
('p0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Museum 10 November',
 'Museum dedicated to the heroic battle of Surabaya, November 10, 1945. Houses historical artifacts, dioramas, and documents from the Surabaya struggle.',
 'museum', 'Jl. Pahlawan, Surabaya', -7.2458, 112.7378,
 '{"senin":"08:00-15:00","selasa":"08:00-15:00","rabu":"08:00-15:00","kamis":"08:00-15:00","jumat":"08:00-15:00","sabtu":"08:00-16:00","minggu":"08:00-16:00"}',
 0, 0,
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
 'verified'),

('p0000002-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001',
 'House of Sampoerna',
 'Historic Dutch colonial building housing the Sampoerna cigarette museum and factory. Offers a glimpse into Surabaya''s industrial heritage.',
 'museum', 'Jl. Taman Apsari No.37, Surabaya', -7.2488, 112.7384,
 '{"senin":"09:00-21:00","selasa":"09:00-21:00","rabu":"09:00-21:00","kamis":"09:00-21:00","jumat":"09:00-21:00","sabtu":"09:00-21:00","minggu":"09:00-21:00"}',
 0, 0,
 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',
 'verified'),

('p0000003-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Museum WR. Soepratman',
 'Museum dedicated to Wage Rudolf Soepratman, composer of Indonesia Raya. Set in a beautiful colonial house.',
 'museum', 'Jl. Gubeng Musyawarah No.1, Surabaya', -7.2531, 112.7452,
 '{"senin":"09:00-14:00","selasa":"09:00-14:00","rabu":"09:00-14:00","kamis":"09:00-14:00","jumat":"09:00-14:00"}',
 0, 0,
 'https://images.unsplash.com/photo-1580654712603-eb43273aff33?w=800',
 'verified'),

('p0000004-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Museum Pendidikan Indonesia',
 'A museum showcasing the history of education in Indonesia, housed in a former school building.',
 'museum', 'Jl. Gentigrat No.2, Surabaya', -7.2653, 112.7522,
 '{"senin":"08:00-15:00","selasa":"08:00-15:00","rabu":"08:00-15:00","kamis":"08:00-15:00","jumat":"08:00-15:00","sabtu":"08:00-13:00"}',
 5000, 10000,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
 'verified'),

('p0000005-0001-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Museum De Javasche Bank',
 'Former Dutch East Indies bank building now serving as a monetary museum. Rich colonial architecture.',
 'museum', 'Jl.华侨路 No.1, Surabaya', -7.2492, 112.7366,
 '{"senin":"CLOSED","selasa":"09:00-15:00","rabu":"09:00-15:00","kamis":"09:00-15:00","jumat":"09:00-15:00","sabtu":"09:00-15:00","minggu":"09:00-15:00"}',
 10000, 20000,
 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
 'verified'),

-- Heritage sites
('p0000006-0001-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Tugu Pahlawan',
 'Monument commemorating the Heroes of Surabaya. The landmark obelisk stands in the heart of the city.',
 'heritage', 'Jl. Pahlawan, Surabaya', -7.2473, 112.7389,
 NULL, 0, 0,
 'https://images.unsplash.com/photo-1555899434-f4e5a9a1c5c0?w=800',
 'verified'),

('p0000007-0001-0001-0001-000000000007', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Jalan Gula',
 'Historic sugar trading street with Dutch colonial shophouses. Known for its sweet heritage and colorful buildings.',
 'heritage', 'Jl. Kembang Jepun, Surabaya', -7.2314, 112.7343,
 NULL, 0, 0,
 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
 'verified'),

('p0000008-0001-0001-0001-000000000008', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Kota Tua Surabaya (Old Town)',
 'The historic Dutch colonial quarter of Surabaya with preserved architecture, museums, and cultural venues.',
 'heritage', 'Jl. Kapasan, Surabaya', -7.2263, 112.7352,
 NULL, 0, 0,
 'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=800',
 'verified'),

('p0000009-0001-0001-0001-000000000009', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Jembatan Merah (Red Bridge)',
 'Historic bridge built during Dutch colonial era, symbol of Surabaya''s resistance struggle.',
 'heritage', 'Jl. Jembatan Merah, Surabaya', -7.2289, 112.7357,
 NULL, 0, 0,
 'https://images.unsplash.com/photo-1590071089561-7a9c0bf34e29?w=800',
 'verified'),

('p0000010-0001-0001-0001-000000000010', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Masjid Al-Akbar Surabaya',
 'One of the largest mosques in Surabaya with stunning modern Islamic architecture.',
 'heritage', 'Jl. Masjid Al-Akbar Timur No.1, Surabaya', -7.2185, 112.7222,
 NULL, 0, 0,
 'https://images.unsplash.com/photo-1590073242678-70d6b5f9c8ba?w=800',
 'verified'),

-- Cafes
('p0000011-0001-0001-0001-000000000011', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Kafe Democrat',
 'Historic coffee house established in the Dutch colonial era. Famous for its traditional Indonesian coffee.',
 'cafe', 'Jl. Ngagel No.45, Surabaya', -7.2589, 112.7501,
 '{"senin":"08:00-22:00","selasa":"08:00-22:00","rabu":"08:00-22:00","kamis":"08:00-22:00","jumat":"08:00-22:00","sabtu":"09:00-23:00","minggu":"09:00-22:00"}',
 25000, 60000,
 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
 'verified'),

('p0000012-0001-0001-0001-000000000012', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Kopi Legit (Hotel Majapahit)',
 'Iconic lobby cafe in the historic Hotel Majapahit. A taste of colonial luxury.',
 'cafe', 'Jl. Tunjungan No.32, Surabaya', -7.2499, 112.7395,
 '{"senin":"07:00-23:00","selasa":"07:00-23:00","rabu":"07:00-23:00","kamis":"07:00-23:00","jumat":"07:00-23:00","sabtu":"07:00-23:00","minggu":"07:00-23:00"}',
 35000, 90000,
 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
 'verified'),

('p0000013-0001-0001-0001-000000000013', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Commonground Coffee Roaster',
 'Modern specialty coffee roaster with a warm industrial vibe. Popular among Surabaya coffee enthusiasts.',
 'cafe', 'Jl. Pujer No.25, Surabaya', -7.2671, 112.7444,
 '{"senin":"07:00-21:00","selasa":"07:00-21:00","rabu":"07:00-21:00","kamis":"07:00-21:00","jumat":"07:00-22:00","sabtu":"08:00-22:00","minggu":"08:00-20:00"}',
 20000, 55000,
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
 'verified'),

('p0000014-0001-0001-0001-000000000014', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Kopi Tukar Mindi',
 'Cozy cafe near the university district. Known for local art displays and creative drinks.',
 'cafe', 'Jl. Lesti No.42, Surabaya', -7.2719, 112.7532,
 '{"senin":"10:00-21:00","selasa":"10:00-21:00","rabu":"10:00-21:00","kamis":"10:00-21:00","jumat":"10:00-22:00","sabtu":"10:00-22:00","minggu":"11:00-20:00"}',
 18000, 45000,
 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
 'verified'),

-- Parks and outdoor
('p0000015-0001-0001-0001-000000000015', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Taman Bungkul',
 'Urban park in the heart of Surabaya. Popular jogging spot with food vendors in the evenings.',
 'park', 'Jl. Banyu Urip, Surabaya', -7.2693, 112.7467,
 '{"senin":"00:00-23:59","selasa":"00:00-23:59","rabu":"00:00-23:59","kamis":"00:00-23:59","jumat":"00:00-23:59","sabtu":"00:00-23:59","minggu":"00:00-23:59"}',
 0, 0,
 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800',
 'verified'),

('p0000016-0001-0001-0001-000000000016', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Taman Flora',
 'Botanical garden in Surabaya featuring local and exotic plant species. Great for nature walks.',
 'park', 'Jl. Sukarno Hatta, Surabaya', -7.2845, 112.7941,
 '{"senin":"07:00-17:00","selasa":"07:00-17:00","rabu":"07:00-17:00","kamis":"07:00-17:00","jumat":"07:00-17:00","sabtu":"07:00-17:00","minggu":"07:00-17:00"}',
 5000, 10000,
 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
 'verified'),

('p0000017-0001-0001-0001-000000000017', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Kebun Binatang Surabaya (Surabaya Zoo)',
 'One of the oldest zoos in Southeast Asia. Home to diverse Indonesian wildlife.',
 'park', 'Jl. Setail No.1, Surabaya', -7.2483, 112.7241,
 '{"senin":"08:00-16:00","selasa":"08:00-16:00","rabu":"08:00-16:00","kamis":"08:00-16:00","jumat":"08:00-16:00","sabtu":"08:00-17:00","minggu":"08:00-17:00"}',
 15000, 25000,
 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800',
 'verified'),

-- Galleries and art
('p0000018-0001-0001-0001-000000000018', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Galeri Nasional Indonesia (Surabaya)',
 'National gallery showcasing Indonesian contemporary and traditional art exhibitions.',
 'gallery', 'Jl. Ratna No.14, Surabaya', -7.2513, 112.7426,
 '{"senin":"CLOSED","selasa":"09:00-16:00","rabu":"09:00-16:00","kamis":"09:00-16:00","jumat":"09:00-16:00","sabtu":"09:00-16:00","minggu":"09:00-16:00"}',
 0, 0,
 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
 'verified'),

('p0000019-0001-0001-0001-000000000019', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Tunjungan Gallery',
 'Contemporary art space in the Tunjungan district hosting rotating exhibitions and art events.',
 'gallery', 'Jl. Tunjungan No.51, Surabaya', -7.2471, 112.7402,
 '{"senin":"10:00-20:00","selasa":"10:00-20:00","rabu":"10:00-20:00","kamis":"10:00-20:00","jumat":"10:00-21:00","sabtu":"10:00-21:00","minggu":"11:00-18:00"}',
 20000, 50000,
 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800',
 'verified'),

('p0000020-0001-0001-0001-000000000020', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Museum Mpu Tantular',
 'Museum of history and culture showcasing Javanese artifacts, including Buddhist and Hindu statues.',
 'museum', 'Jl. Kuntjangan No.2, Surabaya', -7.2358, 112.7412,
 '{"senin":"08:00-15:00","selasa":"08:00-15:00","rabu":"08:00-15:00","kamis":"08:00-15:00","jumat":"08:00-15:00","sabtu":"08:00-14:00"}',
 5000, 10000,
 'https://images.unsplash.com/photo-1580654712603-eb43273aff33?w=800',
 'verified'),

-- Additional cafes/venues
('p0000021-0001-0001-0001-000000000021', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Kopi Oey',
 'Classic Indonesian cafe chain known for traditional Javanese coffee and cozy ambiance.',
 'cafe', 'Jl. Embong Ploso No.7-9, Surabaya', -7.2529, 112.7405,
 '{"senin":"08:00-22:00","selasa":"08:00-22:00","rabu":"08:00-22:00","kamis":"08:00-22:00","jumat":"08:00-23:00","sabtu":"09:00-23:00","minggu":"09:00-22:00"}',
 15000, 40000,
 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
 'verified'),

('p0000022-0001-0001-0001-000000000022', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Hotel Majapahit Gardens',
 'Historic hotel gardens with colonial-era architecture. Part of the legacy of the independence movement.',
 'heritage', 'Jl. Tunjungan No.32, Surabaya', -7.2499, 112.7395,
 NULL, 0, 0,
 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800',
 'verified');

-- Stamps (one per place)
INSERT INTO stamps (id, place_id, name, description, image_url, rarity) VALUES
('s0000001-0001-0001-0001-000000000001', 'p0000001-0001-0001-0001-000000000001', 'Pahlawan Visitor', 'Explored Museum 10 November', NULL, 'common'),
('s0000002-0001-0001-0001-000000000002', 'p0000002-0001-0001-0001-000000000002', 'Sampoerna Explorer', 'Visited House of Sampoerna', NULL, 'common'),
('s0000003-0001-0001-0001-000000000003', 'p0000003-0001-0001-0001-000000000003', 'Musik Legend', 'Discovered WR. Soepratman museum', NULL, 'rare'),
('s0000004-0001-0001-0001-000000000004', 'p0000004-0001-0001-0001-000000000004', 'Pendidikan Sejarah', 'Explored Museum Pendidikan', NULL, 'common'),
('s0000005-0001-0001-0001-000000000005', 'p0000005-0001-0001-0001-000000000005', 'Bank Historian', 'Visited De Javasche Bank museum', NULL, 'rare'),
('s0000006-0001-0001-0001-000000000006', 'p0000006-0001-0001-0001-000000000006', 'Tugu Champion', 'Stood at Tugu Pahlawan', NULL, 'common'),
('s0000007-0001-0001-0001-000000000007', 'p0000007-0001-0001-0001-000000000007', 'Gula Manis', 'Walked through Jalan Gula', NULL, 'common'),
('s0000008-0001-0001-0001-000000000008', 'p0000008-0001-0001-0001-000000000008', 'Old Town Walker', 'Explored Kota Tua Surabaya', NULL, 'rare'),
('s0000009-0001-0001-0001-000000000009', 'p0000009-0001-0001-0001-000000000009', 'Merah Explorer', 'Crossed Jembatan Merah', NULL, 'common'),
('s0000010-0001-0001-0001-000000000010', 'p0000010-0001-0001-0001-000000000010', 'Al-Akbar Pilgrim', 'Visited Masjid Al-Akbar', NULL, 'rare'),
('s0000011-0001-0001-0001-000000000011', 'p0000011-0001-0001-0001-000000000011', 'Democrat Coffee', 'Sipped at Kafe Democrat', NULL, 'common'),
('s0000012-0001-0001-0001-000000000012', 'p0000012-0001-0001-0001-000000000012', 'Colonial Sips', 'Enjoyed coffee at Hotel Majapahit', NULL, 'rare'),
('s0000013-0001-0001-0001-000000000013', 'p0000013-0001-0001-0001-000000000013', 'Commongrounder', 'Tried specialty coffee at Commonground', NULL, 'common'),
('s0000014-0001-0001-0001-000000000014', 'p0000014-0001-0001-0001-000000000014', 'Tukar Mindi Regular', 'Hung out at Kopi Tukar Mindi', NULL, 'common'),
('s0000015-0001-0001-0001-000000000015', 'p0000015-0001-0001-0001-000000000015', 'Bungkul Runner', 'Exercised at Taman Bungkul', NULL, 'common'),
('s0000016-0001-0001-0001-000000000016', 'p0000016-0001-0001-0001-000000000016', 'Flora Finder', 'Explored Taman Flora', NULL, 'common'),
('s0000017-0001-0001-0001-000000000017', 'p0000017-0001-0001-0001-000000000017', 'Zoo Explorer', 'Visited Surabaya Zoo', NULL, 'epic'),
('s0000018-0001-0001-0001-000000000018', 'p0000018-0001-0001-0001-000000000018', 'Art Enthusiast', 'Viewed exhibitions at Galeri Nasional', NULL, 'rare'),
('s0000019-0001-0001-0001-000000000019', 'p0000019-0001-0001-0001-000000000019', 'Contemporary Viewer', 'Visited Tunjungan Gallery', NULL, 'rare'),
('s0000020-0001-0001-0001-000000000020', 'p0000020-0001-0001-0001-000000000020', 'Budaya Hunter', 'Explored Museum Mpu Tantular', NULL, 'rare'),
('s0000021-0001-0001-0001-000000000021', 'p0000021-0001-0001-0001-000000000021', 'Oey Coffee Fan', 'Enjoyed Kopi Oey', NULL, 'common'),
('s0000022-0001-0001-0001-000000000022', 'p0000022-0001-0001-0001-000000000022', 'Garden Stroller', 'Walked Hotel Majapahit Gardens', NULL, 'common');

-- Quests
INSERT INTO quests (id, city_id, title, description, difficulty, estimated_duration_minutes, estimated_budget_min, estimated_budget_max, cover_image_url, is_published, tags) VALUES

('q0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Surabaya Heritage Starter',
 'Begin your Surabaya adventure with the city''s most iconic heritage sites. Visit Tugu Pahlawan, Museum 10 November, and explore the historic Old Town.',
 'easy', 240, 0, 50000,
 'https://images.unsplash.com/photo-1555899434-f4e5a9a1c5c0?w=800',
 true,
 '{"heritage", "history", "starter"}'),

('q0000002-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Jalan Gula Quest',
 'Trace Surabaya''s sweetest heritage along Jalan Gula, the historic sugar trading street. Discover colonial architecture and local snacks.',
 'easy', 180, 50000, 150000,
 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
 true,
 '{"heritage", "food", "walking"}'),

('q0000003-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Surabaya Museum Marathon',
 'Visit five museums in one day. From the heroic Museum 10 November to colonial banking history at De Javasche Bank.',
 'medium', 360, 25000, 100000,
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
 true,
 '{"museum", "history", "culture"}'),

('q0000004-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Kopi & Heritage Quest',
 'Combine Surabaya''s coffee culture with its colonial heritage. Visit historic cafes and heritage sites in a perfect cultural blend.',
 'easy', 210, 100000, 250000,
 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
 true,
 '{"cafe", "heritage", "food"}'),

('q0000005-0001-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Surabaya Art & Parks Quest',
 'Explore Surabaya''s green spaces and art galleries. From Taman Bungkul to Galeri Nasional, discover the city''s creative side.',
 'easy', 300, 20000, 80000,
 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800',
 true,
 '{"art", "nature", "culture"}'),

('q0000006-0001-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000001',
 'Ultimate Surabaya Challenge',
 'Complete all major heritage sites, museums, and cafes. The ultimate test for any Surabaya explorer.',
 'hard', 480, 150000, 400000,
 'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=800',
 true,
 '{"heritage", "museum", "cafe", "challenge"}');

-- Quest Stops
INSERT INTO quest_stops (id, quest_id, place_id, position, required, hint, recommended_duration_minutes) VALUES

-- Surabaya Heritage Starter (q1)
('qs00001-0001-0001-0001-000000000001', 'q0000001-0001-0001-0001-000000000001', 'p0000006-0001-0001-0001-000000000006', 1, true, 'Start early morning for best photos', 30),
('qs00002-0001-0001-0001-000000000002', 'q0000001-0001-0001-0001-000000000001', 'p0000001-0001-0001-0001-000000000001', 2, true, 'Join a free guided tour in Indonesian', 90),
('qs00003-0001-0001-0001-000000000003', 'q0000001-0001-0001-0001-000000000001', 'p0000008-0001-0001-0001-000000000008', 3, true, 'Visit the local coffee stall near the entrance', 60),
('qs00004-0001-0001-0001-000000000004', 'q0000001-0001-0001-0001-000000000001', 'p0000009-0001-0001-0001-000000000009', 4, true, 'The bridge is most beautiful at sunset', 30),

-- Jalan Gula Quest (q2)
('qs00005-0001-0001-0001-000000000005', 'q0000002-0001-0001-0001-000000000002', 'p0000007-0001-0001-0001-000000000007', 1, true, 'Try the traditional gula java candy', 60),
('qs00006-0001-0001-0001-000000000006', 'q0000002-0001-0001-0001-000000000002', 'p0000002-0001-0001-0001-000000000002', 2, true, 'Buy Sampoerna cigarettes as a souvenir', 60),
('qs00007-0001-0001-0001-0001-000000000007', 'q0000002-0001-0001-0001-000000000002', 'p0000011-0001-0001-0001-000000000011', 3, true, 'Order the signaturetubruk coffee', 45),

-- Surabaya Museum Marathon (q3)
('qs00008-0001-0001-0001-000000000008', 'q0000003-0001-0001-0001-000000000003', 'p0000001-0001-0001-0001-000000000001', 1, true, 'Start at 9am to beat the crowds', 90),
('qs00009-0001-0001-0001-000000000009', 'q0000003-0001-0001-0001-000000000003', 'p0000003-0001-0001-0001-000000000003', 2, true, 'Listen to the recorded music of Indonesia Raya', 60),
('qs00010-0001-0001-0001-000000000010', 'q0000003-0001-0001-0001-000000000003', 'p0000005-0001-0001-0001-000000000005', 3, true, 'Exchange old currency in the gift shop', 60),
('qs00011-0001-0001-0001-000000000011', 'q0000003-0001-0001-0001-000000000003', 'p0000020-0001-0001-0001-000000000020', 4, true, 'Look for the ancient inscriptions', 60),

-- Kopi & Heritage Quest (q4)
('qs00012-0001-0001-0001-000000000012', 'q0000004-0001-0001-0001-000000000004', 'p0000012-0001-0001-0001-000000000012', 1, true, 'Sit in the colonial-era lobby for full effect', 60),
('qs00013-0001-0001-0001-000000000013', 'q0000004-0001-0001-0001-000000000004', 'p0000007-0001-0001-0001-000000000007', 2, true, 'Photography spots at every corner', 60),
('qs00014-0001-0001-0001-000000000014', 'q0000004-0001-0001-0001-000000000004', 'p0000013-0001-0001-0001-000000000013', 3, true, 'Try the single-origin pour-over', 60),

-- Surabaya Art & Parks Quest (q5)
('qs00015-0001-0001-0001-000000000015', 'q0000005-0001-0001-0001-000000000005', 'p0000015-0001-0001-0001-000000000015', 1, true, 'Best visited early morning or evening', 45),
('qs00016-0001-0001-0001-000000000016', 'q0000005-0001-0001-0001-000000000005', 'p0000018-0001-0001-0001-000000000018', 2, true, 'Check current exhibitions online first', 75),
('qs00017-0001-0001-0001-000000000017', 'q0000005-0001-0001-0001-000000000005', 'p0000016-0001-0001-0001-000000000016', 3, true, 'Bring insect repellent for the botanical section', 90),

-- Ultimate Surabaya Challenge (q6)
('qs00018-0001-0001-0001-000000000018', 'q0000006-0001-0001-0001-000000000006', 'p0000006-0001-0001-0001-000000000006', 1, true, 'Start at dawn', 30),
('qs00019-0001-0001-0001-000000000019', 'q0000006-0001-0001-0001-000000000006', 'p0000001-0001-0001-0001-000000000001', 2, true, 'Full guided tour recommended', 90),
('qs00020-0001-0001-0001-000000000020', 'q0000006-0001-0001-0001-000000000006', 'p0000007-0001-0001-0001-000000000007', 3, true, 'Bring an empty stomach', 60),
('qs00021-0001-0001-0001-000000000021', 'q0000006-0001-0001-0001-000000000006', 'p0000012-0001-0001-0001-000000000012', 4, false, 'Afternoon coffee break', 60);

-- Events
INSERT INTO events (id, city_id, place_id, title, description, start_time, end_time, price_min, price_max, source_url, image_url, tags, status) VALUES

('e0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'p0000008-0001-0001-0001-000000000008',
 'Pameran Foto Surabaya Tempo Dulu',
 'Historical photo exhibition showing Surabaya from the Dutch colonial era to independence.',
 '2026-07-01 09:00:00+07', '2026-07-31 17:00:00+07',
 0, 0, 'https://example.com/surabaya-tempo-dulu', NULL,
 '{"exhibition", "history", "photo"}', 'published'),

('e0000002-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'p0000018-0001-0001-0001-000000000018',
 'Seni Lukis Kontemporer Jawa',
 'Contemporary Javanese painting exhibition featuring 30 local artists.',
 '2026-06-15 10:00:00+07', '2026-07-15 16:00:00+07',
 0, 0, 'https://example.com/seni-lukis-jawa', NULL,
 '{"art", "painting", "exhibition"}', 'published'),

('e0000003-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001', 'p0000011-0001-0001-0001-000000000011',
 'Coffee Cupping Session: Java Blend',
 'Learn to cup and taste various Indonesian coffee blends.',
 '2026-06-20 14:00:00+07', '2026-06-20 16:00:00+07',
 75000, 75000, 'https://example.com/coffee-cupping', NULL,
 '{"coffee", "workshop", "food"}', 'published'),

('e0000004-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'p0000010-0001-0001-0001-000000000010',
 'Tadarus Akbar Ramadan',
 'Community Quran reading event during Ramadan at Masjid Al-Akbar.',
 '2026-03-01 19:00:00+07', '2026-03-30 22:00:00+07',
 0, 0, NULL, NULL,
 '{"religious", "community", "ramadan"}', 'published'),

('e0000005-0001-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001', 'p0000008-0001-0001-0001-000000000008',
 'Heritage Walking Tour: Kota Tua',
 'Guided walking tour through Surabaya Old Town, exploring Dutch colonial architecture.',
 '2026-06-21 08:00:00+07', '2026-06-21 11:00:00+07',
 50000, 50000, 'https://example.com/heritage-walk', NULL,
 '{"walking", "heritage", "tour"}', 'published'),

('e0000006-0001-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000001', 'p0000015-0001-0001-0001-000000000015',
 'Taman Bungkul Morning Yoga',
 'Free community yoga session every Sunday morning at Taman Bungkul.',
 '2026-06-21 06:00:00+07', '2026-06-21 07:30:00+07',
 0, 0, NULL, NULL,
 '{"yoga", "fitness", "community"}', 'published');

-- Demo user's stamps (give demo user some progress)
INSERT INTO user_stamps (id, user_id, stamp_id, place_id, quest_id, earned_at) VALUES
('us000001-0001-0001-0001-000000000001', '00000000-0000-0000-0000-000000000002',
 's0000001-0001-0001-0001-000000000001', 'p0000001-0001-0001-0001-000000000001',
 'q0000001-0001-0001-0001-000000000001', '2026-06-10 14:00:00+07'),
('us000002-0001-0001-0001-000000000002', '00000000-0000-0000-0000-000000000002',
 's0000006-0001-0001-0001-000000000006', 'p0000006-0001-0001-0001-000000000006',
 'q0000001-0001-0001-0001-000000000001', '2026-06-10 13:30:00+07');
USE globetrotter_db;

-- =========================
-- CITIES
-- =========================

INSERT INTO cities
(name, country, region, cost_index, popularity, image_url)
VALUES
('Paris', 'France', 'Europe', 1.45, 100, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'),
('London', 'United Kingdom', 'Europe', 1.60, 98, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'),
('Tokyo', 'Japan', 'Asia', 1.50, 97, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'),
('New York', 'United States', 'North America', 1.70, 96, 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f'),
('Dubai', 'United Arab Emirates', 'Middle East', 1.55, 94, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'),
('Singapore', 'Singapore', 'Asia', 1.65, 92, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd'),
('Rome', 'Italy', 'Europe', 1.30, 91, 'https://images.unsplash.com/photo-1529260830199-42c24126f198'),
('Barcelona', 'Spain', 'Europe', 1.25, 89, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4');

-- =========================
-- ACTIVITIES
-- =========================

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Eiffel Tower Visit', 'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris.', 'Sightseeing', 35, 120,
'https://images.unsplash.com/photo-1543349689-9a4d426bee8e'
FROM cities WHERE name = 'Paris' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Louvre Museum', 'Explore famous artworks and historical collections at the Louvre.', 'Museum', 25, 180,
'https://images.unsplash.com/photo-1564399579883-451a5d44ec08'
FROM cities WHERE name = 'Paris' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Big Ben & Westminster', 'Explore Westminster and see the famous Big Ben clock tower.', 'Sightseeing', 0, 120,
'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'
FROM cities WHERE name = 'London' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'London Eye', 'Enjoy panoramic views of London from the London Eye.', 'Entertainment', 40, 60,
'https://images.unsplash.com/photo-1520986606214-8b456906c813'
FROM cities WHERE name = 'London' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Tokyo Tower', 'Visit Tokyo Tower and enjoy city views.', 'Sightseeing', 20, 90,
'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc'
FROM cities WHERE name = 'Tokyo' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Shibuya Crossing', 'Experience one of Tokyo''s most famous city crossings.', 'City Experience', 0, 60,
'https://images.unsplash.com/photo-1542051841857-5f90071e7989'
FROM cities WHERE name = 'Tokyo' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Statue of Liberty', 'Visit the iconic Statue of Liberty in New York Harbor.', 'Sightseeing', 30, 180,
'https://images.unsplash.com/photo-1522083165195-3424ed129620'
FROM cities WHERE name = 'New York' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Central Park Walk', 'Relax and explore the famous Central Park.', 'Outdoor', 0, 120,
'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90'
FROM cities WHERE name = 'New York' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Burj Khalifa', 'Visit the world''s famous Burj Khalifa observation decks.', 'Sightseeing', 45, 120,
'https://images.unsplash.com/photo-1518684079-3c830dcef090'
FROM cities WHERE name = 'Dubai' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Desert Safari', 'Enjoy a desert safari with dune activities and traditional experiences.', 'Adventure', 60, 300,
'https://images.unsplash.com/photo-1542401886-65d6c61db217'
FROM cities WHERE name = 'Dubai' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Marina Bay Sands', 'Explore the iconic Marina Bay Sands area.', 'Sightseeing', 0, 120,
'https://images.unsplash.com/photo-1525625293386-3f8f99389edd'
FROM cities WHERE name = 'Singapore' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Gardens by the Bay', 'Explore the futuristic gardens and Supertree Grove.', 'Nature', 20, 150,
'https://images.unsplash.com/photo-1508964942454-1a56651d54ac'
FROM cities WHERE name = 'Singapore' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Colosseum', 'Explore the ancient Roman Colosseum.', 'Historical', 25, 150,
'https://images.unsplash.com/photo-1552832230-c0197dd311b5'
FROM cities WHERE name = 'Rome' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Trevi Fountain', 'Visit Rome''s famous Trevi Fountain.', 'Sightseeing', 0, 60,
'https://images.unsplash.com/photo-1529260830199-42c24126f198'
FROM cities WHERE name = 'Rome' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Sagrada Familia', 'Visit Barcelona''s iconic basilica designed by Antoni Gaudí.', 'Architecture', 30, 120,
'https://images.unsplash.com/photo-1583779457094-ab6f5c6d3d7d'
FROM cities WHERE name = 'Barcelona' LIMIT 1;

INSERT INTO activities
(city_id, name, description, activity_type, cost, duration_minutes, image_url)
SELECT id, 'Park Güell', 'Explore Gaudí''s colorful Park Güell.', 'Outdoor', 15, 120,
'https://images.unsplash.com/photo-1539037116277-4db20889f2d4'
FROM cities WHERE name = 'Barcelona' LIMIT 1;
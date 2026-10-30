CREATE DATABASE cinestream;


INSERT INTO genres (id, name, slug) VALUES
('10000000-0000-4000-8000-000000000001', 'Adventure', 'adventure'),
('10000000-0000-4000-8000-000000000002', 'Drama', 'drama'),
('10000000-0000-4000-8000-000000000003', 'Sci-Fi', 'sci-fi'),
('10000000-0000-4000-8000-000000000004', 'Documentary', 'documentary'),
('10000000-0000-4000-8000-000000000005', 'Nature', 'nature'),
('10000000-0000-4000-8000-000000000006', 'Thriller', 'thriller'),
('10000000-0000-4000-8000-000000000007', 'Mystery', 'mystery')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO videos (
    id, slug, title, synopsis, release_year,
    duration_seconds, content_rating,
    publication_status, published_at
) VALUES
(
    '20000000-0000-4000-8000-000000000001',
    'the-last-horizon',
    'The Last Horizon',
    'An expedition into the unknown reveals a world beyond imagination.',
    2025, 6480, 'PG-13', 'published', NOW()
),
(
    '20000000-0000-4000-8000-000000000002',
    'beyond-orbit',
    'Beyond Orbit',
    'A deep-space mission discovers a signal that changes humanity forever.',
    2026, 7500, 'PG-13', 'published', NOW()
),
(
    '20000000-0000-4000-8000-000000000003',
    'deep-blue',
    'Deep Blue',
    'Marine researchers uncover the secrets of a mysterious ocean ecosystem.',
    2024, 5760, 'PG', 'published', NOW()
),
(
    '20000000-0000-4000-8000-000000000004',
    'wild-earth',
    'Wild Earth',
    'Explore extraordinary landscapes and the wildlife that calls them home.',
    2025, 4920, 'G', 'published', NOW()
),
(
    '20000000-0000-4000-8000-000000000005',
    'neon-city',
    'Neon City',
    'In a city that never sleeps, one detective follows a trail of secrets.',
    2026, 6840, 'R', 'published', NOW()
),
(
    '20000000-0000-4000-8000-000000000006',
    'the-silent-house',
    'The Silent House',
    'A remote family home holds a mystery that refuses to stay buried.',
    2024, 6060, 'PG-13', 'published', NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO video_genres (video_id, genre_id)
SELECT v.id, g.id
FROM (
    VALUES
        ('the-last-horizon', 'adventure'),
        ('the-last-horizon', 'drama'),
        ('beyond-orbit', 'sci-fi'),
        ('beyond-orbit', 'adventure'),
        ('deep-blue', 'documentary'),
        ('deep-blue', 'adventure'),
        ('wild-earth', 'documentary'),
        ('wild-earth', 'nature'),
        ('neon-city', 'thriller'),
        ('neon-city', 'drama'),
        ('the-silent-house', 'thriller'),
        ('the-silent-house', 'mystery')
) AS links(video_slug, genre_slug)
JOIN videos v ON v.slug = links.video_slug
JOIN genres g ON g.slug = links.genre_slug
ON CONFLICT (video_id, genre_id) DO NOTHING;

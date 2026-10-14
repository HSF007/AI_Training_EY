--1.
--SELECT * FROM guests;

--2.
--SELECT guest_name , city , membership_level FROM guests;

--3.
/*
SELECT * FROM rooms
WHERE price_per_night > 5000;
*/

--4.
/*
SELECT * FROM rooms
WHERE status = 'Available';
/

--5.
/*
SELECT * FROM guests
WHERE membership_level = 'Gold';
*/

--6.
/*
SELECT * FROM bookings
WHERE booking_status = 'Confirmed';
*/

--7.
/*
SELECT * FROM bookings
ORDER BY check_in_date;
*/

--8.
/*
SELECT * FROM rooms
ORDER BY price_per_night DESC;
*/

--9.
/*
SELECT * FROM rooms
WHERE price_per_night > 4000 AND price_per_night < 8000;
*/

--10.
/*
SELECT * FROM guests
WHERE city IN ('Hyderabad', 'Pune', 'Mumbai');
*/

--11.
--SELECT count(room_id) FROM rooms;

--12.
--SELECT AVG(price_per_night) FROM rooms;

--13.
/*
SELECT * FROM rooms
ORDER BY price_per_night DESC
LIMIT 1;
*/

--14.
/*
SELECT * FROM rooms
ORDER BY price_per_night ASC
LIMIT 1;
*/

--15.
/*
SELECT room_type, COUNT(room_id) FROM rooms
GROUP BY room_type;
*/

--16.
/*
SELECT room_type, ROUND(AVG(price_per_night), 2) FROM rooms
GROUP BY room_type;
*/

--17.
/*
SELECT membership_level, COUNT(guest_id) FROM guests
GROUP BY membership_level;
*/

--18.
/*SELECT booking_status, COUNT(booking_id) FROM bookings
GROUP BY booking_status;
*/

--19.
/*
SELECT service_name, SUM(service_price) FROM services
GROUP BY service_name;
*/

--20.
--SELECT ROUND(AVG(service_price), 4) FROM services;

--21.
/*
SELECT booking_id, guest_name, city, check_in_date, check_out_date, booking_status
FROM guests g
JOIN bookings b ON g.guest_id = b.guest_id;
*/

--22.
/*
SELECT booking_id, room_type, price_per_night, check_in_date, check_out_date
FROM bookings b
JOIN rooms r ON r.room_id = b.room_id;
*/

23.
/*
SELECT guest_name, room_type, price_per_night, booking_status
FROM bookings b
JOIN guests g ON b.guest_id = g.guest_id
JOIN rooms r ON r.room_id = b.room_id;
*/

--24.
/*
SELECT bs.booking_id, service_name, quantity, service_price
FROM booking_services bs
JOIN services s ON bs.service_id = s.service_id
JOIN bookings b ON b.booking_id = bs.booking_id;
*/

--25.
/*
SELECT bs.booking_id, s.service_name, bs.quantity, s.service_price, (bs.quantity*s.service_price) AS service_cost
FROM booking_services bs
JOIN services s ON bs.service_id = s.service_id
JOIN bookings b ON b.booking_id = bs.booking_id;
*/

--26.
/*
SELECT
	g.guest_name,
	bs.booking_id,
	r.room_type,
	s.service_name,
	bs.quantity,
	b.booking_status
FROM booking_services bs
JOIN services s ON bs.service_id = s.service_id
JOIN bookings b ON b.booking_id = bs.booking_id
JOIN guests g ON b.guest_id = g.guest_id
JOIN rooms r ON  r.room_id = b.room_id;
*/

--27.
/*
SELECT
	g.guest_name,
	b.booking_id,
	b.booking_status
FROM guests g
LEFT JOIN bookings b ON b.guest_id = g.guest_id;
*/

--28.
/*
SELECT
	g.guest_id,
	g.guest_name,
	g.city
FROM guests g
LEFT JOIN bookings b ON b.guest_id = g.guest_id
WHERE b.guest_id IS NULL;
*/

--29.
/*
SELECT
	g.guest_name,
	COUNT(b.booking_id) AS total_bookings
FROM guests g
LEFT JOIN bookings b ON b.guest_id = g.guest_id
GROUP BY g.guest_name;
*/

--30.
/*
SELECT
	b.booking_id,
	g.guest_name,
	SUM(bs.quantity * s.service_price) AS total_service_cost
FROM guests AS g
LEFT JOIN bookings b ON b.guest_id = g.guest_id
JOIN booking_services bs ON bs.booking_id = b.booking_id
JOIN services s ON s.service_id = bs.service_id
GROUP BY b.booking_id, g.guest_name
ORDER BY total_service_cost DESC;
*/
-- Que. 1)
-- SELECT * FROM vehicles;

-- Que. 2)
/*
SELECT * FROM service_bookings
WHERE service_status = 'Scheduled';
*/

-- Que. 3)
/*
SELECT * FROM service_items
WHERE cost > 1500;
*/

-- Que. 4)
/*
SELECT * FROM technicians
WHERE specialization in ('Electrical', 'Battery');
*/

-- Que. 5)
/*
SELECT customer_id, COUNT(customer_id) FROM vehicles
GROUP BY customer_id;
*/

-- Que. 6)
-- SELECT AVG(si.cost) FROM service_items si;

-- Que. 7)
/*
SELECT
	c.customer_name,
	v.model_name,
	v.registration_no
FROM vehicles v
JOIN customers c ON c.customer_id = v.customer_id;
*/

-- Que. 8)
/*
SELECT
	v.vehicle_id,
	v.model_name,
	sb.service_date,
	sb.service_status
FROM service_bookings sb
JOIN vehicles v ON v.vehicle_id = sb.vehicle_id;
*/

-- Que. 9)
/*
SELECT
	sb.booking_id,
	t.technician_name,
	t.specialization,
	sb.service_status
FROM service_bookings sb
JOIN technicians t ON t.technician_id = sb.technician_id;
*/

-- Que. 10)

SELECT
	customer_name,
	model_name,
	technician_name,
	service_date,
	service_status
FROM 
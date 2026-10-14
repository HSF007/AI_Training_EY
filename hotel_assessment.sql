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
-- C1. Display all parts belonging to the Mechanical category.
SELECT * FROM parts WHERE category = 'Mechanical';

-- C2. Display parts with unit_price above 1000, ordered from highest price to lowest.
SELECT * FROM parts WHERE unit_price > 1000 ORDER BY unit_price DESC;

-- C3. Find the average unit_price for each category.
SELECT category, AVG(unit_price) AS avg_unit_price FROM parts GROUP BY category;

-- C4. Find the total stock quantity for each category.
SELECT category, SUM(stock_qty) AS total_stock_qty FROM parts GROUP BY category;

-- C5. Display every purchase order with supplier_name, order_date and status using a JOIN.
SELECT
	s.supplier_name,
	po.order_date,
	po.status
FROM purchase_orders po
JOIN suppliers s
	ON po.supplier_id = s.supplier_id

-- C6. Join purchase_orders, purchase_order_items and 
-- parts to display po_id, part_name, quantity and unit_price.
SELECT
	po.po_id,
	p.part_name,
	poi.quantity,
	p.unit_price
FROM purchase_orders po
JOIN purchase_order_items poi
	ON po.po_id = poi.po_id
JOIN parts p
	ON poi.part_id = p.part_id

-- C7. Extend the previous query to calculate line_total = quantity × unit_price.
SELECT
	po.po_id,
	p.part_name,
	poi.quantity,
	p.unit_price,
	poi.quantity * p.unit_price AS line_total
FROM purchase_orders po
JOIN purchase_order_items poi
	ON po.po_id = poi.po_id
JOIN parts p
	ON poi.part_id = p.part_id

-- C8. Use a LEFT JOIN to display all suppliers, including suppliers
-- that have never received a purchase order.
SELECT
	s.supplier_id,
	s.supplier_name,
	po.po_id
FROM suppliers s
LEFT JOIN purchase_orders po
	ON s.supplier_id = po.supplier_id;

-- C9. Display only suppliers that have no purchase orders.
SELECT
	s.supplier_id,
	s.supplier_name
FROM suppliers s
LEFT JOIN purchase_orders po
	ON s.supplier_id = po.supplier_id
WHERE po.po_id IS NULL;

-- C10. Create a view named purchase_order_summary showing po_id, supplier_name,
-- part_name, quantity, unit_price, line_total and status. Query the view for Pending orders.
CREATE OR REPLACE VIEW
purchase_order_summary AS
SELECT
	po.po_id,
	s.supplier_name,
	p.part_name,
	poi.quantity,
	p.unit_price,
	poi.quantity * p.unit_price AS line_total,
	po.status
FROM purchase_orders po
JOIN suppliers s
	ON po.supplier_id = s.supplier_id
JOIN purchase_order_items poi
	ON po.po_id = poi.po_id
JOIN parts p
	ON poi.part_id = p.part_id;

SELECT * FROM purchase_order_summary WHERE status = 'Pending';

-- C11. Create a function calculate_part_discount(amount): if amount >= 2000
-- return 10% of amount, otherwise return 0. Use it with the parts table.
CREATE OR REPLACE FUNCTION
calculate_part_discount(amount NUMERIC)
RETURNs NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
	IF amount >= 2000 THEN
		RETURN amount * 0.10;
	ELSE
		RETURN 0;
	END IF;
END;
$$;

SELECT
	part_id,
	part_name,
	unit_price,
	calculate_part_discount(unit_price)
AS discount
FROM parts;

-- C12. Create a function final_part_price(amount) that returns amount minus
-- calculate_part_discount(amount). Use it in a SELECT query.
CREATE OR REPLACE FUNCTION
final_part_price(amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
	RETURN amount - calculate_part_discount(amount);
END;
$$;

SELECT
	part_id,
	part_name,
	unit_price,
	calculate_part_discount(unit_price) AS discount,
	final_part_price(unit_price) AS final_price
FROM parts;


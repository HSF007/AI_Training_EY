import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="coworking_demo",
    user="postgres",
    password="Admin@123"
)

cursor = conn.cursor()

print("Connected to PostgreSQL")

cursor.execute("""
CREATE TABLE IF NOT EXISTS rooms (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(100),
    capacity INT,
    hourly_rate FLOAT,
    status VARCHAR(100)
)
""")

conn.commit()
print("Created rooms table successfully")

cursor.execute("""
CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    room_id INT,
    booked_by VARCHAR(100),
    booking_date DATE,
    hours INT,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
)
""")

conn.commit()
print("Created bookings table successfully")


cursor.execute("""
INSERT INTO rooms
(room_id, room_name, capacity, hourly_rate, status)
VALUES
(1, 'Conference A', 20, 500.00, 'Available'),
(2, 'Meeting Room B', 6, 250.00, 'Available'),
(3, 'Training Hall', 50, 1000.00, 'Under Maintenance'),
(4, 'Board Room', 12, 400.00, 'Available')
""")

conn.commit()
print("Records inserted in rooms table successfully")


cursor.execute("""
INSERT INTO bookings
(booking_id, room_id, booked_by, booking_date, hours)
VALUES
(1, 1, 'Alice Johnson', '2026-10-05', 3),
(2, 1, 'Rajesh Kumar', '2026-10-06', 2),
(3, 2, 'Priya Sharma', '2026-10-06', 4),
(4, 4, 'John Smith', '2026-10-07', 1),
(5, 4, 'Fatima Noor', '2026-10-07', 2),
(6, 3, 'Michael Brown', '2026-10-08', 5)
""")

conn.commit()
print("Records inserted in bookings table successfully")

print("\nAll Rooms")
cursor.execute("""
SELECT * FROM rooms
""")

all_rooms = cursor.fetchall()

for room in all_rooms:
    print(room)

print('\nAll bookings')
cursor.execute("""
SELECT * FROM bookings
""")

all_bookings = cursor.fetchall()

for booking in all_bookings:
    print(booking)


print('\nRoom with capacity greater than 6')
cursor.execute("""
SELECT * FROM rooms
WHERE capacity > 6
""")

capacity = cursor.fetchall()
for room in capacity:
    print(room)


print('\nRooms available')
cursor.execute("""
SELECT * FROM rooms
WHERE status = 'Available'
""")

aval_rooms = cursor.fetchall()
for room in aval_rooms:
    print(room)

print("\nRoom book by specific person")
cursor.execute("""
SELECT * FROM bookings
WHERE booked_by = 'Michael Brown'
""")

person_book = cursor.fetchall()
for booked in person_book:
    print(booked)

print("\nIncreasing hourly rate")
cursor.execute("""
UPDATE rooms
SET hourly_rate = hourly_rate + 100.0
WHERE room_id = 1
""")

conn.commit()

cursor.execute("""
SELECT * FROM rooms
WHERE room_id = 1
""")

updated_room_rate = cursor.fetchall()
for updated_room in updated_room_rate:
    print(updated_room)


print("\nUpdating status")
cursor.execute("""
UPDATE rooms
SET status = 'Maintenance'
WHERE room_id = 1
""")

conn.commit()

cursor.execute("""
SELECT * FROM rooms
WHERE room_id = 1
""")

updated_aval = cursor.fetchall()
for updated_room in updated_aval:
    print(updated_room)


print("\nIncreasing hours for booking")
cursor.execute("""
UPDATE bookings
SET hours = hours + 2
WHERE booking_id = 4
""")

conn.commit()

cursor.execute("""
SELECT * FROM bookings
WHERE booking_id = 4
""")

updated_bookings = cursor.fetchall()
for updated_booking in updated_bookings:
    print(updated_booking)


print("\nDeleting booking")
cursor.execute("""
DELETE FROM bookings
WHERE booking_id = 1
""")

conn.commit()

cursor.execute("""
SELECT * FROM bookings
""")

updated_bookings = cursor.fetchall()
for updated_booking in updated_bookings:
    print(updated_booking)


print("\nGetting hourly rate of each booking")
cursor.execute("""
SELECT booking_id, booked_by, room_name, booking_date, hours, hourly_rate
FROM bookings
LEFT JOIN rooms ON bookings.room_id = rooms.room_id
""")

join_query = cursor.fetchall()
for entry in join_query:
    print(entry)


print("\nEach room book number of times")
cursor.execute("""
SELECT room_name, COUNT(booking_id) AS total_bookings
FROM rooms
LEFT JOIN bookings on rooms.room_id = bookings.room_id
GROUP BY rooms.room_id
""")

each_room_booking = cursor.fetchall()
for each_room in each_room_booking:
    print(each_room)


print("\nRoom with highest price")
cursor.execute("""
SELECT * FROM rooms
ORDER BY hourly_rate DESC
LIMIT 1
""")

highest_price = cursor.fetchall()
for room in highest_price:
    print(room)


print("\nPrice of each booking")
cursor.execute("""
SELECT b.booked_by AS "Booked By", r.room_name AS "Room", b.hours AS "Hours", b.hours * r.hourly_rate AS "Cost"
FROM bookings AS b
JOIN rooms r ON b.room_id = r.room_id
""")

bookings_cost = cursor.fetchall()
for booking in bookings_cost:
    print(booking)
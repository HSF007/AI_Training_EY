function EventCard({ event, available, onRegister}) {
    return (
        <div className="card">
            <h3>{event.title}</h3>
            <p>Category: {event.category}</p>
            <p>Date: {event.date}</p>
            <p>Time: {event.time}</p>
            <p>Total Seats: {event.seats}</p>
            <p>Available Seats: {available}</p>

            <button disabled={available === 0}
              onClick={() => onRegister(event)}>
              {available === 0 ? "Fully Booked" : "Register"}
            </button>
        </div>
    );
}

export default EventCard;
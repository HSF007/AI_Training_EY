import { useState } from "react";
import events from "../events";
import { useRegistration } from "../context/RegistrationContext";
import EventCard from "./EventCard";
import RegistrationForm from "./RegistrationForm";

function EventList() {
  const { registrations, setRegistrations } = useRegistration();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  function register(name, email) {
    const count = registrations.filter(
      r => r.eventId === selected.id
    ).length;

    if (count >= selected.seats) {
      alert("Event is fully booked");
      return;
    }

    const exists = registrations.some(
      r => r.eventId === selected.id &&
      r.email.trim().toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      alert("Already registered for this event");
      return;
    }

    setRegistrations([
      ...registrations,
      {
        id: Date.now(),
      eventId: selected.id,
      title: selected.title,
      date: selected.date,
      name: name,
      email: email
      }
    ]);

    alert("Registration successful!");
    setSelected(null);
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || event.category === category)
  );

  return (
    <div>
      <h2>Upcoming Events</h2>

      <input
        placeholder="Search events..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        <option>All</option>
        <option>Technology</option>
        <option>Arts</option>
        <option>Life Skills</option>
      </select>

      {filteredEvents.length === 0 && <p>No events found</p>}

      {filteredEvents.map(event => {
        const available = event.seats -
          registrations.filter(r => r.eventId === event.id).length;

        return (
          <div key={event.id}>
            <EventCard
                key={event.id}
                event={event}
                available={available}
                onRegister={setSelected}
            />
            {selected && selected.id === event.id && (
                <RegistrationForm
                  event={event}
                  onSubmit={register}
                  onClose={() => setSelected(null)}
                />
            )}
          </div>

        );
      })}
    </div>
  );
}

export default EventList;
import { useRegistration } from "../context/RegistrationContext";

function RegistrationList() {
  const { registrations, setRegistrations } = useRegistration();

  function cancel(id) {
    if (window.confirm("Are you sure you want to cancel?")) {
      setRegistrations(registrations.filter(r => r.id !== id));
    }
  }

  return (
    <div>
      <h2>My Registrations</h2>

      {registrations.length === 0 && (
        <p>No registrations found</p>
      )}

      {registrations.map(r => (
        <div className="card" key={r.id}>
          <h3>{r.title}</h3>
          <p>Name: {r.name}</p>
          <p>Email: {r.email}</p>
          <p>Date: {r.date}</p>

          <button onClick={() => cancel(r.id)}>
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}

export default RegistrationList;
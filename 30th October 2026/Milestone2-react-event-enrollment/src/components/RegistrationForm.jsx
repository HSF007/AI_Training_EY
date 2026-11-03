import { useState } from "react";

function RegistrationForm({ event, onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert("Please enter name and email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      alert("Enter a valid email");
      return;
    }

    onSubmit(name.trim(), email.trim());
  }

  return (
    <div className="card">
      <h3>Register for {event.title}</h3>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <button type="submit">Submit</button>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </form>
    </div>
  );
}

export default RegistrationForm;
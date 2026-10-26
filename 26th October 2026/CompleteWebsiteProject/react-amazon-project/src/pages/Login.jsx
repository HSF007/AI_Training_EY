import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleSubmit(event) {
    event.preventDefault();
    const success = login(email, password);
    if (success) {
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <main className="container page-content login-page">
      <h1>Login</h1>
      <form className="payment-form" onSubmit={handleSubmit}>
        <label>Email
          <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>Password
          <input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="primary-button full-width" type="submit">Login</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <p>Demo email: admin@example.com</p>
      <p>Demo password: 123456</p>
      <p><Link to="/">Back to home</Link></p>
    </main>
  );
}

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <main className="container page-content not-found">
      <span className="eyebrow">ERROR 404</span>
      <h1>We can't find that page.</h1>
      <p>The link may be incorrect, or the page may have moved.</p>
      <div className="not-found-actions">
        <Link className="primary-button button-link" to="/">Back to Home</Link>
        {!user && <Link className="secondary-button button-link" to="/login">Go to Login</Link>}
        <Link className="secondary-button button-link" to="/cart">View Cart</Link>
      </div>
    </main>
  );
}

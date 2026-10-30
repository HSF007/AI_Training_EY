
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Film, Search } from "lucide-react";

import { useAppContext } from "../context/AppContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, signOut, authReady } = useAppContext();

  const [query, setQuery] = useState(
    new URLSearchParams(location.search).get("q") || ""
  );

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);

  function handleSearch(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    navigate(
      trimmedQuery ? `/?q=${encodeURIComponent(trimmedQuery)}` : "/"
    );
  }

  function handleSignOut() {
    signOut();
    navigate("/", { replace: true });
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="CineStream home">
        <span className="brand-icon">
          <Film size={24} />
        </span>
        <span>
          CINE<span className="brand-accent">STREAM</span>
        </span>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        <Link to="/" className="nav-link">
          Browse
        </Link>

        {user && (
          <>
            <Link to="/continue-watching" className="nav-link">
              Continue Watching
            </Link>

            <Link to="/watchlist" className="nav-link">
              Watchlist
            </Link>
          </>
        )}
      </nav>

      <form className="search-form" onSubmit={handleSearch} role="search">
        <Search size={18} aria-hidden="true" />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies and shows"
          aria-label="Search videos"
        />
      </form>

      {authReady && user ? (
        <div className="nav-account">
          <span className="nav-user">
            {user.displayName || user.email}
          </span>

          <button
            type="button"
            className="nav-account-action"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      ) : authReady ? (
        <Link to="/auth" className="nav-account-action">
          Sign in
        </Link>
      ) : (
        <span className="nav-user" role="status">
          Checking session...
        </span>
      )}
    </header>
  );
}

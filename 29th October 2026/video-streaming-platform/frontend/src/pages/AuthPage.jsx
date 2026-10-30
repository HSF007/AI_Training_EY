
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Film } from "lucide-react";

import { loginAccount, registerAccount } from "../services/api";
import { useAppContext } from "../context/AppContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        password,
      };

      const response =
        mode === "register"
          ? await registerAccount({
              ...credentials,
              display_name: displayName.trim(),
            })
          : await loginAccount(credentials);

      await signIn(response);

      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((current) =>
      current === "login" ? "register" : "login"
    );
    setError("");
  }

  return (
    <main className="auth-page page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} />
        Back to browse
      </Link>

      <section className="auth-card">
        <div className="auth-brand-icon">
          <Film size={28} />
        </div>

        <span className="eyebrow">WELCOME TO CINESTREAM</span>

        <h1>
          {mode === "login"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p className="auth-description">
          {mode === "login"
            ? "Sign in to access your personal library."
            : "Create an account to save titles and viewing progress."}
        </p>

        <div className="auth-demo-notice">
          Accounts are managed by the CineStream API.
          Passwords are hashed by the backend.
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Display name
              <input
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                placeholder="Your name"
                autoComplete="nickname"
                minLength={2}
                maxLength={80}
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={
                mode === "register"
                  ? "new-password"
                  : "current-password"
              }
              minLength={mode === "register" ? 8 : 1}
              maxLength={128}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login"
            ? "New to CineStream?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            className="inline-action"
            onClick={switchMode}
            disabled={loading}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}

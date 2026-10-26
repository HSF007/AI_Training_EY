import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>ShopNest<span>.</span></Link>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
        {menuOpen ? "✕" : "☰"}
      </button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"}>
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        <NavLink to="/cart" onClick={closeMenu}>Cart ({itemCount})</NavLink>
        {user ? (
          <button className="nav-action" onClick={() => { logout(); closeMenu(); }}>Logout</button>
        ) : (
          <NavLink to="/login" className="login-link" onClick={closeMenu}>Login</NavLink>
        )}
      </nav>
    </header>
  );
}

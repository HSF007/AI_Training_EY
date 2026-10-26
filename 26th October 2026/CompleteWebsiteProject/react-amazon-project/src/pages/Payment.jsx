import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Payment() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [method, setMethod] = useState("upi");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/payment" } }} />;
  }

  if (items.length === 0 && !message) {
    return (
      <main className="container page-content empty-state">
        <h1>Nothing to checkout</h1>
        <p>Your cart is empty. Add products before making a payment.</p>
        <Link className="primary-button button-link" to="/">Browse products</Link>
      </main>
    );
  }

  function handlePayment(event) {
    event.preventDefault();
    // Demo only: this does not charge money. Integrate a payment gateway and
    // verify the transaction on your server before marking an order as paid.
    setMessage("Demo checkout complete. No real payment was taken.");
    clearCart();
  }

  return (
    <main className="container page-content">
      <span className="eyebrow">SECURE CHECKOUT</span>
      <h1>Payment</h1>
      {message ? (
        <section className="empty-state success-state" role="status">
          <h2>Thank you for your order!</h2>
          <p>{message}</p>
          <Link className="primary-button button-link" to="/">Continue shopping</Link>
        </section>
      ) : (
        <div className="cart-layout payment-layout">
          <form className="payment-form" onSubmit={handlePayment}>
            <h2>Payment method</h2>
            <label className="payment-option">
              <input type="radio" name="method" value="upi" checked={method === "upi"} onChange={(e) => setMethod(e.target.value)} />
              UPI
            </label>
            <label className="payment-option">
              <input type="radio" name="method" value="card" checked={method === "card"} onChange={(e) => setMethod(e.target.value)} />
              Credit or debit card
            </label>
            <label className="payment-option">
              <input type="radio" name="method" value="cod" checked={method === "cod"} onChange={(e) => setMethod(e.target.value)} />
              Cash on delivery (demo)
            </label>
            <p className="muted-note">
              This is a demonstration checkout. Do not enter actual card or banking details.
              A live checkout needs a payment gateway and server-side verification.
            </p>
            <button className="primary-button full-width" type="submit">
              Place demo order · {money(subtotal)}
            </button>
          </form>
          <aside className="order-summary">
            <h2>Order summary</h2>
            {items.map((item) => (
              <div className="summary-row" key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <strong>{money(Number(item.price || 0) * item.quantity)}</strong>
              </div>
            ))}
            <div className="summary-total"><span>Total</span><strong>{money(subtotal)}</strong></div>
          </aside>
        </div>
      )}
    </main>
  );
}

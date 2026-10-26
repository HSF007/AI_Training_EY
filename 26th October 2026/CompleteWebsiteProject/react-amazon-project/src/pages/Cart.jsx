import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Cart() {
  const { items, setQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <main className="container page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SHOPPING BAG</span>
          <h1>Your Cart</h1>
        </div>
        <Link className="secondary-button" to="/">Continue shopping</Link>
      </div>

      {items.length === 0 ? (
        <section className="empty-state">
          <span aria-hidden="true">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Find something you'll love and add it to your cart.</p>
          <Link className="primary-button button-link" to="/">Browse products</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Cart items">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-details">
                  <h2>{item.name}</h2>
                  <p>{money(item.price)} each</p>
                  <button
                    className="text-button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
                <label className="quantity-control">
                  <span>Qty</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(event) => setQuantity(item.id, event.target.value)}
                    aria-label={`Quantity for ${item.name}`}
                  />
                </label>
                <strong className="line-total">{money(Number(item.price || 0) * item.quantity)}</strong>
              </article>
            ))}
          </section>

          <aside className="order-summary">
            <h2>Order summary</h2>
            <div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="summary-total"><span>Total</span><strong>{money(subtotal)}</strong></div>
            <p className="muted-note">Shipping or taxes may be added by your payment provider.</p>
            <button className="primary-button full-width" onClick={() => navigate("/payment")}>
              Proceed to payment
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

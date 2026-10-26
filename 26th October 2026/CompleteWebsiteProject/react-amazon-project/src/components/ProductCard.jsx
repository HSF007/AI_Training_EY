import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  function handleAdd() {
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-bottom">
          <span className="product-price">
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="product-cart-actions">
          <label>
            <span className="sr-only">Quantity for {product.name}</span>
            <input
              aria-label={`Quantity for ${product.name}`}
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))
              }
            />
          </label>
          <button className="primary-button" onClick={handleAdd}>
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

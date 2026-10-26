import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/Productcard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("http://127.0.0.1:8000/products")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load products.");
        return response.json();
      })
      .then((data) => { if (active) setProducts(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.message || "Error fetching products."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "low") result = [...result].sort((a, b) => a.price - b.price);
    else if (sort === "high") result = [...result].sort((a, b) => b.price - a.price);
    else if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, search, sort]);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">YOUR EVERYDAY MARKETPLACE</span>
          <h1>Find something<br /><span>you'll love.</span></h1>
          <p>Discover quality products for your lifestyle, all in one place.</p>
          <div className="search-bar">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
            {search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search">✕</button>}
          </div>
        </div>
        <div className="hero-decoration" aria-hidden="true"><div className="hero-circle"><span>✦</span><strong>Discover<br />your style.</strong><span>✧</span></div></div>
      </section>

      <section className="shop-section">
        <div className="section-heading"><div><span className="eyebrow">HANDPICKED FOR YOU</span><h2>Our Products</h2></div></div>
        <div className="section-heading products-heading">
          <p className="result-count">{filteredProducts.length} products found</p>
          <label className="sort-control"><span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option><option value="low">Price: Low to high</option><option value="high">Price: High to low</option><option value="name">Name: A–Z</option>
            </select>
          </label>
        </div>
        {loading ? <p className="status-message">Loading products…</p> :
          error ? <div className="status-message error">{error}<p>Check that your product API is running at http://127.0.0.1:8000/products.</p></div> :
          filteredProducts.length > 0 ? <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> :
          <div className="empty-state"><span>⌕</span><h3>No products found</h3><p>Try searching for another product.</p><button className="primary-button" onClick={() => setSearch("")}>Show all products</button></div>}
      </section>
      <footer className="footer"><div><Link to="/" className="footer-logo">ShopNest<span>.</span></Link><p>Discover more. Shop better.</p></div><p>© {new Date().getFullYear()} ShopNest. All rights reserved.</p></footer>
    </main>
  );
}

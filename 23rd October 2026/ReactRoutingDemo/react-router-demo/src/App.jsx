import { useEffect, useState } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from "react-router-dom"

import AddProduct from "./AddProduct"
import EditProduct from "./EditProduct"


function Home() {
  const navigate = useNavigate()
  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => navigate("/products")}>
        View Products
      </button>
    </div>
  )
}


function Products() {
  const [products, setProducts] = useState([])
  useEffect(() => {
      fetch("http://127.0.0.1:8000/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data)
      })
      .catch((error) => {
        console.error("Error fetching products:", error)
      })
    }, [])
  return (
    <div>
      <h1>Products</h1>
      {products.map((product) => (
        <div key={product.id}>
          <img
            src={product.image}
            alt={product.name}
            width="150"
          />
          <h3>{product.name}</h3>
          <p>Price: ₹{product.price}</p>
          <Link to={`/products/${product.id}`}>
            View Details
          </Link>
          {" | "}
          <Link to={`/products/${product.id}/edit`}>
            Edit Product
          </Link>
          <hr />
        </div>
      ))}
    </div>
  )}


function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState([])
  useEffect(() => {
      fetch(`http://127.0.0.1:8000/products/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data)
      })
      .catch((error) => {
        console.error("Error fetching products:", error)
      })
    }, [id])

  return (
    <div>
      <h1>Product Details</h1>
      {product.map((prod) => (
        <div key={prod.id}>
          <h2>{prod.name}</h2>
          <p>Product ID: {id}</p>
          <p>Product Price: ₹{prod.price}</p>
          <img
            src={prod.image}
            alt={prod.name}
            width="200"
          />
        </div>
      ))}
      <button onClick={() => navigate("/products")}>
        Back to Products
      </button>
    </div>
  )
}


function About() {
  return (
    <div>
      <h1>About</h1>
      <p>Simple React Product Application</p>
    </div>
  )
}


function App() {
  const [products, setProducts] = useState([])
  useEffect(() => {
      fetch(`http://127.0.0.1:8000/products/`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data)
      })
      .catch((error) => {
        console.error("Error fetching products:", error)
      })
    }, [])
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        {" | "}
        <Link to="/products">Products</Link>
        {" | "}
        <Link to="/add-product">Add Product</Link>
        {" | "}
        <Link to="/about">About</Link>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/add-product" element = {<AddProduct products={products} setProducts={setProducts} />} />
        <Route path="/products/:id/edit" element = {<EditProduct />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App
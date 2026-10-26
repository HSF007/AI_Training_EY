import { useState } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from "react-router-dom"


const initialProducts = [
  {
    id: 1,
    name: "Wireless Mouse",
    price: 1200,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46"
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 3500,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3"
  },
  {
    id: 3,
    name: "Monitor",
    price: 12000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
  }
]


function Home() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the Product Application</p>

      <button onClick={() => navigate("/products")}>
        View Products
      </button>
    </div>
  )
}


function Products({ products }) {
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

          <hr />
        </div>
      ))}
    </div>
  )
}


function ProductDetails({ products }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const product = products.find(
    (product) => product.id === Number(id)
  )

  if (!product) {
    return <p>Product not found</p>
  }

  return (
    <div>
      <h1>Product Details</h1>

      <img
        src={product.image}
        alt={product.name}
        width="200"
      />

      <h2>{product.name}</h2>

      <p>Product ID: {product.id}</p>

      <p>Price: ₹{product.price}</p>

      <button onClick={() => navigate("/products")}>
        Back to Products
      </button>
    </div>
  )
}


function AddProduct({ products, setProducts }) {
  const navigate = useNavigate()

  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")

  /*function saveProduct(event) {
    event.preventDefault()

    const product = {
      id: Number(id),
      name: name,
      price: Number(price),
      image: image
    }

    setProducts([...products, product])

    navigate("/products")
  }*/

  return (
    <div>
      <h1>Add Product</h1>

      <form onSubmit={saveProduct}>
        <input
          type="number"
          placeholder="Product ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Save Product
        </button>
      </form>
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
  const [products, setProducts] = useState(initialProducts)

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

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={
            <Products products={products} />
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProductDetails products={products} />
          }
        />

        <Route
          path="/add-product"
          element={
            <AddProduct
              products={products}
              setProducts={setProducts}
            />
          }
        />

        <Route
          path="/about"
          element={<About />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App
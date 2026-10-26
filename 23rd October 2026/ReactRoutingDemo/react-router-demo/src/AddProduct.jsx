import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AddProduct() {
  const navigate = useNavigate()

  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")

  function saveProduct(event) {
    event.preventDefault()

    const product = {
      id: Number(id),
      name: name,
      price: Number(price),
      image: image
    }

    fetch("http://127.0.0.1:8000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    })
      .then((response) => response.json())
      .then(() => {
        navigate("/products")
      })
  }

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

        <br />

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <br />

        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <br />

        <button type="submit">
          Save Product
        </button>
      </form>
    </div>
  )
}

export default AddProduct
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function DeleteProduct() {
  const navigate = useNavigate()
  const { id } = useParams

  function saveProduct(event) {
    event.preventDefault()

    const product = {
      id: Number(id),
      name: name,
      price: Number(price),
      image: image
    }

    fetch("http://127.0.0.1:8000/products", {
      method: "DELETE",
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

export default DeleteProduct
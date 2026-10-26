import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")

  useEffect(() => {
        fetch(`http://127.0.0.1:8000/products/${id}`)
        .then((response) => response.json())
        .then((product) => product[0])
        .then((data) => {
            setName(data.name)
            setPrice(data.price)
            setImage(data.image)
        })
  }, [id])

  function updateProduct(event) {
    event.preventDefault()

    const product = {
      id: Number(id),
      name: name,
      price: Number(price),
      image: image
    }

    fetch(`http://127.0.0.1:8000/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    })
      .then((response) => response.json())
      .then(() => {
        navigate(`/products`)
      })
  }

  return (
    <div>
      <h1>Edit Product</h1>
      <p>Product ID: {id}</p>
      <form onSubmit={updateProduct}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br />

        <input
          type="number"
          placeholder="Product Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <br />

        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
        />

        <br />

        <button type="submit">
          Update Product
        </button>
      </form>
    </div>
  )
}

export default EditProduct
import { useState } from "react"


function Product(prop) {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h2>{prop.name}</h2>
      <p>Price: ₹{prop.price}</p>
      <button onClick={() => setCount(count + 1)}>
        Add to Cart
      </button>
      <p>Quantity: {count}</p>
    </div>
  )
}

export default Product
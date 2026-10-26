

import { useState } from "react"

function App() {
  const [username, setUsername] = useState("")

  const [loggedInUser, setLoggedInUser] = useState(
    sessionStorage.getItem("user") || ""
  )

  const [cartCount, setCartCount] = useState(
    Number(sessionStorage.getItem("cartCount")) || 0
  )


  function login() {
    if (username.trim() === "") {
      return
    }

    setLoggedInUser(username)

    sessionStorage.setItem("user", username)

    setUsername("")
  }


  function addItem() {
    const newCount = cartCount + 1

    setCartCount(newCount)

    sessionStorage.setItem(
      "cartCount",
      newCount
    )
  }


  function removeItem() {
    const newCount =
      cartCount > 0
        ? cartCount - 1
        : 0

    setCartCount(newCount)

    sessionStorage.setItem(
      "cartCount",
      newCount
    )
  }


  function logout() {
    setLoggedInUser("")
    setCartCount(0)

    sessionStorage.removeItem("user")
    sessionStorage.removeItem("cartCount")
  }


  return (
    <div>
      <h1>React Session Storage Demo</h1>

      {!loggedInUser ? (
        <div>
          <h2>Login</h2>

          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <button onClick={login}>
            Login
          </button>
        </div>
      ) : (
        <div>
          <h2>
            Welcome {loggedInUser}
          </h2>

          <p>
            Cart Items: {cartCount}
          </p>

          <button onClick={addItem}>
            Add Item
          </button>

          <button onClick={removeItem}>
            Remove Item
          </button>

          <br />
          <br />

          <button onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default App
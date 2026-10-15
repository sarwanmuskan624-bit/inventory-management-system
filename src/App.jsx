
import { useState } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  function addProduct(e) 
  
    {
    e.preventDefault()

    if (!name || !price || !quantity) {
      alert('Please fill all fields')
      return
    }

    setProducts([
      ...products,
      {
        id: Date.now(),
        name,
        price: Number(price),
        quantity: Number(quantity),
      },
    ])

    setName('')
    setPrice('')
    setQuantity('')
  }

  return (
    <div className="container">
      <h1>Inventory Management System</h1>
      <p>Manage your products and stock easily.</p>

      <form onSubmit={addProduct}>
        <input
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button type="submit">Add Product</button>
      </form>

      <h2>Product List</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>₹{product.price.toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>
                ₹{(product.price * product.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App


import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState(() => {
    try {
      const savedProducts = localStorage.getItem('inventoryProducts')
      return savedProducts ? JSON.parse(savedProducts) : []
    } catch {
      return []
    }
  })

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [billItems, setBillItems] = useState([])

  useEffect(() => {
    localStorage.setItem(
      'inventoryProducts',
      JSON.stringify(products)
    )
  }, [products])

  function addProduct(e) {
    e.preventDefault()

    if (!name.trim() || price === '' || quantity === '') {
      alert('Please fill all product fields')
      return
    }

    if (Number(price) <= 0 || Number(quantity) <= 0) {
      alert('Price and quantity must be greater than zero')
      return
    }

    const newProduct = {
      id: Date.now(),
      name: name.trim(),
      price: Number(price),
      quantity: Number(quantity),
    }

    setProducts((previousProducts) => [
      ...previousProducts,
      newProduct,
    ])

    setName('')
    setPrice('')
    setQuantity('')
  }

  function deleteProduct(id) {
    setProducts((previousProducts) =>
      previousProducts.filter((product) => product.id !== id)
    )

    setBillItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    )
  }

  function addToBill(product) {
    if (product.quantity <= 0) {
      alert('This product is out of stock')
      return
    }

    const existingItem = billItems.find(
      (item) => item.id === product.id
    )

    if (existingItem) {
      alert('This product is already in the bill')
      return
    }

    setBillItems((previousItems) => [
      ...previousItems,
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      },
    ])
  }

  function removeFromBill(id) {
    setBillItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    )
  }

  function printBill() {
    if (billItems.length === 0) {
      alert('Please add products to the bill')
      return
    }

    window.print()
  }

  const grandTotal = billItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  return (
    <div className="container">
      <h1>Inventory & Billing Management System</h1>
      <p>Manage products, stock and customer bills easily.</p>

      <h2>Add New Product</h2>

      <form onSubmit={addProduct}>
        <input
          type="text"
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
            <th>Stock</th>
            <th>Total Value</th>
            <th>Action</th>
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
              <td>
                <button
                  type="button"
                  onClick={() => addToBill(product)}
                >
                  Add to Bill
                </button>{' '}
                <button
                  type="button"
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bill-section">
        <h2>Customer Bill</h2>

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <h3>Bill Items</h3>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {billItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>₹{item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeFromBill(item.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Grand Total: ₹{grandTotal.toFixed(2)}</h2>

        <button type="button" onClick={printBill}>
          Print Bill
        </button>
      </div>
    </div>
  )
}

export default App

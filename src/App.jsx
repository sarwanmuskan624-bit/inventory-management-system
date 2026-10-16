
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('inventoryProducts')
      ) || []
    } catch {
      return []
    }
  })

  const [billHistory, setBillHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('inventoryBillHistory')
      ) || []
    } catch {
      return []
    }
  })

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [billItems, setBillItems] = useState([])
  const [currentBill, setCurrentBill] = useState(null)

  useEffect(() => {
    localStorage.setItem(
      'inventoryProducts',
      JSON.stringify(products)
    )
  }, [products])

  useEffect(() => {
    localStorage.setItem(
      'inventoryBillHistory',
      JSON.stringify(billHistory)
    )
  }, [billHistory])

  function addProduct(e) {
    e.preventDefault()

    if (!name.trim() || price === '' || quantity === '') {
      alert('Please fill all product fields')
      return
    }

    if (
      !Number.isFinite(Number(price)) ||
      !Number.isInteger(Number(quantity)) ||
      Number(price) <= 0 ||
      Number(quantity) <= 0
    ) {
      alert('Enter a valid price and whole-number quantity')
      return
    }

    setProducts((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: name.trim(),
        price: Number(price),
        quantity: Number(quantity),
      },
    ])

    setName('')
    setPrice('')
    setQuantity('')
  }

  function deleteProduct(id) {
    const usedInBill = billItems.some((item) => item.id === id)

    if (usedInBill) {
      alert('Remove this product from the current bill first')
      return
    }

    setProducts((previous) =>
      previous.filter((product) => product.id !== id)
    )
  }

  function addToBill(product) {
    const existingItem = billItems.find(
      (item) => item.id === product.id
    )

    if (existingItem) {
      alert('This product is already in the bill')
      return
    }

    if (product.quantity <= 0) {
      alert('This product is out of stock')
      return
    }

    setBillItems((previous) => [
      ...previous,
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      },
    ])
  }

  function removeFromBill(id) {
    setBillItems((previous) =>
      previous.filter((item) => item.id !== id)
    )
  }

  const grandTotal = billItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  function completeBill() {
    if (billItems.length === 0) {
      alert('Please add products to the bill')
      return
    }

    const stockIsAvailable = billItems.every((item) => {
      const product = products.find((p) => p.id === item.id)
      return product && product.quantity >= item.quantity
    })

    if (!stockIsAvailable) {
      alert('Stock changed. Please create the bill again.')
      setBillItems([])
      return
    }

    const bill = {
      id: Date.now(),
      customer: customerName.trim() || 'Walk-in Customer',
      date: new Date().toLocaleString(),
      items: billItems,
      total: grandTotal,
    }

    setProducts((previous) =>
      previous.map((product) => {
        const soldItem = billItems.find(
          (item) => item.id === product.id
        )

        return soldItem
          ? {
              ...product,
              quantity: product.quantity - soldItem.quantity,
            }
          : product
      })
    )

    setBillHistory((previous) => [bill, ...previous])
    setCurrentBill(bill)
    setBillItems([])
    setCustomerName('')

    alert('Bill completed! Stock has been updated.')
  }

  function printBill(bill = currentBill) {
    if (!bill) {
      alert('Complete a bill first')
      return
    }

    window.print()
  }

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

      <h2>Product List / Available Stock</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Stock Value</th>
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
                  disabled={product.quantity === 0}
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

      <h2>Create Customer Bill</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />

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

      <button type="button" onClick={completeBill}>
        Complete Bill & Update Stock
      </button>

      {currentBill && (
        <div className="print-area">
          <h2>Last Completed Bill</h2>
          <p>Bill No: {currentBill.id}</p>
          <p>Customer: {currentBill.customer}</p>
          <p>Date: {currentBill.date}</p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentBill.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Total: ₹{currentBill.total.toFixed(2)}</h3>

          <button type="button" onClick={() => printBill()}>
            Print Last Bill
          </button>
        </div>
      )}

      <h2>Bill History</h2>

      {billHistory.length === 0 ? (
        <p>No completed bills yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {billHistory.map((bill) => (
              <tr key={bill.id}>
                <td>{bill.id}</td>
                <td>{bill.customer}</td>
                <td>{bill.date}</td>
                <td>₹{bill.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App

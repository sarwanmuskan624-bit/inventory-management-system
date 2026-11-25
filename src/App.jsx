import { useEffect, useMemo, useState } from 'react'
import './App.css'

const productStorageKey = 'inventoryProducts'
const billStorageKey = 'inventoryBillHistory'

const starterProducts = [
  { id: 'p-1001', name: 'Classic Notebook', category: 'Stationery', sku: 'ST-1001', price: 4.5, quantity: 42 },
  { id: 'p-1002', name: 'Ceramic Coffee Mug', category: 'Home & Living', sku: 'HM-1002', price: 12, quantity: 18 },
  { id: 'p-1003', name: 'Wireless Mouse', category: 'Electronics', sku: 'EL-1003', price: 24.99, quantity: 4 },
  { id: 'p-1004', name: 'Cotton Tote Bag', category: 'Accessories', sku: 'AC-1004', price: 8.75, quantity: 26 },
  { id: 'p-1005', name: 'Desk Plant', category: 'Home & Living', sku: 'HM-1005', price: 16.5, quantity: 0 },
]

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
})

function loadStoredValue(key, fallback) {
  const savedValue = window.localStorage.getItem(key)
  return savedValue === null ? fallback : JSON.parse(savedValue)
}

function getCurrentTime() {
  return new Date()
}

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" /></>,
    receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    trend: <><path d="m4 15 5-5 4 4 7-8" /><path d="M14 6h6v6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" /></>,
    print: <><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v7H7zM17 11h.01" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function App() {
  const [products, setProducts] = useState(() => loadStoredValue(productStorageKey, starterProducts))
  const [billHistory, setBillHistory] = useState(() => loadStoredValue(billStorageKey, []))
  const [currentTime, setCurrentTime] = useState(() => getCurrentTime())
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [productDialog, setProductDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [selectedBill, setSelectedBill] = useState(null)

  useEffect(() => {
    window.localStorage.setItem(productStorageKey, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    window.localStorage.setItem(billStorageKey, JSON.stringify(billHistory))
  }, [billHistory])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(getCurrentTime()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const categories = useMemo(
    () => ['All categories', ...new Set(products.map((product) => product.category || 'General'))],
    [products],
  )
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch = !query
        || product.name.toLowerCase().includes(query)
        || (product.sku || '').toLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'All categories'
        || (product.category || 'General') === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const grandTotal = subtotal + tax
  const inventoryValue = products.reduce((total, product) => total + product.price * product.quantity, 0)
  const lowStockProducts = products.filter((product) => product.quantity > 0 && product.quantity <= 5)
  const outOfStockCount = products.filter((product) => product.quantity === 0).length
  const today = currentTime.toDateString()
  const todaysBills = billHistory.filter((bill) => new Date(bill.createdAt || bill.date).toDateString() === today)
  const todaysSales = todaysBills.reduce((total, bill) => total + bill.total, 0)
  const latestBills = billHistory.slice(0, 5)
  const displayedBill = selectedBill || billHistory[0]

  function navigate(page) {
    setActivePage(page)
    setSearch('')
    if (page === 'Billing') setCategoryFilter('All categories')
  }

  function saveProduct(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const product = {
      id: productDialog?.id || `p-${Date.now()}`,
      name: String(formData.get('name')).trim(),
      category: String(formData.get('category')).trim() || 'General',
      sku: String(formData.get('sku')).trim() || `SKU-${Date.now().toString().slice(-6)}`,
      price: Number(formData.get('price')),
      quantity: Number(formData.get('quantity')),
    }

    if (!product.name || !Number.isFinite(product.price) || product.price <= 0 || !Number.isInteger(product.quantity) || product.quantity < 0) {
      setNotice('Enter a product name, a price above zero and a whole-number stock quantity.')
      return
    }

    setProducts((current) => productDialog
      ? current.map((item) => item.id === productDialog.id ? product : item)
      : [product, ...current])
    setProductDialog(null)
    setNotice(productDialog ? 'Product details updated.' : 'Product added to your inventory.')
  }

  function deleteProduct(product) {
    const confirmed = window.confirm(`Remove ${product.name} from your inventory?`)
    if (!confirmed) return
    setProducts((current) => current.filter((item) => item.id !== product.id))
    setCart((current) => current.filter((item) => item.id !== product.id))
    setNotice('Product removed.')
  }

  function addToCart(product) {
    if (product.quantity < 1) {
      setNotice('This product is out of stock.')
      return
    }
    const currentQuantity = cart.find((item) => item.id === product.id)?.quantity || 0
    if (currentQuantity >= product.quantity) {
      setNotice(`Only ${product.quantity} ${product.name} available in stock.`)
      return
    }
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  function changeCartQuantity(productId, delta) {
    const product = products.find((item) => item.id === productId)
    setCart((current) => current.flatMap((item) => {
      if (item.id !== productId) return [item]
      const quantity = item.quantity + delta
      if (quantity <= 0) return []
      if (quantity > (product?.quantity || 0)) {
        setNotice(`Only ${product?.quantity || 0} ${item.name} available in stock.`)
        return [item]
      }
      return [{ ...item, quantity }]
    }))
  }

  function completeBill() {
    if (cart.length === 0) {
      setNotice('Add at least one product before completing the bill.')
      return
    }
    const stockChanged = cart.some((item) => {
      const product = products.find((entry) => entry.id === item.id)
      return !product || product.quantity < item.quantity
    })
    if (stockChanged) {
      setNotice('Stock changed while creating this bill. Please review your cart.')
      return
    }

    const now = getCurrentTime()
    const bill = {
      id: `INV-${now.toISOString().slice(2, 10).replaceAll('-', '')}-${String(billHistory.length + 1).padStart(3, '0')}`,
      customer: customerName.trim() || 'Walk-in Customer',
      createdAt: now.toISOString(),
      date: now.toLocaleString(),
      items: cart,
      subtotal,
      tax,
      total: grandTotal,
    }
    setProducts((current) => current.map((product) => {
      const soldItem = cart.find((item) => item.id === product.id)
      return soldItem ? { ...product, quantity: product.quantity - soldItem.quantity } : product
    }))
    setBillHistory((current) => [bill, ...current])
    setSelectedBill(bill)
    setCart([])
    setCustomerName('')
    setNotice('Bill completed. Inventory has been updated.')
  }

  function printBill() {
    if (!displayedBill) {
      setNotice('There is no bill to print yet.')
      return
    }
    window.print()
  }

  function renderBillRows(bill) {
    return bill.items.map((item) => (
      <tr key={`${bill.id}-${item.id}`}>
        <td>{item.name}</td>
        <td>{item.quantity}</td>
        <td>{money.format(item.price)}</td>
        <td className="numeric">{money.format(item.price * item.quantity)}</td>
      </tr>
    ))
  }

  const navItems = [
    { name: 'Overview', icon: 'grid' },
    { name: 'Inventory', icon: 'box' },
    { name: 'Billing', icon: 'receipt' },
    { name: 'Sales', icon: 'chart' },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); navigate('Overview') }}>
          <span className="brand-mark"><Icon name="box" size={22} /></span>
          <span>stock<span className="brand-light">wise</span><small>INVENTORY & BILLING</small></span>
        </a>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`nav-item ${activePage === item.name ? 'active' : ''}`}
              key={item.name}
              onClick={() => navigate(item.name)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.name}</span>
              {item.name === 'Billing' && cart.length > 0 && <span className="nav-count">{cart.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Icon name="bag" size={19} /></div>
            <strong>Your shop, in sync.</strong>
            <p>Products and bills are saved on this device.</p>
            <button onClick={() => navigate('Inventory')}>Manage stock <Icon name="arrow" size={15} /></button>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div><strong>Store owner</strong><span>Local workspace</span></div>
            <span className="online-dot" title="Ready" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{activePage}</strong></div>
          <div className="topbar-right">
            <span className="today-label">{currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="status-pill"><span /> All changes saved</span>
          </div>
        </header>

        <div className="page-content">
          {activePage === 'Overview' && (
            <>
              <section className="page-heading">
                <div><p className="eyebrow">YOUR BUSINESS AT A GLANCE</p><h1>Good day, Store owner <span>✦</span></h1><p className="page-subtitle">Here’s what’s happening with your store today.</p></div>
                <button className="button button-primary" onClick={() => navigate('Billing')}><Icon name="plus" size={18} /> Create a bill</button>
              </section>

              <section className="stats-grid" aria-label="Store summary">
                <article className="stat-card"><div className="stat-top"><span className="stat-icon mint"><Icon name="box" /></span><span className="stat-hint">Across all products</span></div><div className="stat-value">{products.length}</div><div className="stat-caption">Products in inventory</div></article>
                <article className="stat-card"><div className="stat-top"><span className="stat-icon peach"><Icon name="receipt" /></span><span className="stat-hint">{todaysBills.length} bills today</span></div><div className="stat-value">{money.format(todaysSales)}</div><div className="stat-caption">Today’s sales</div></article>
                <article className="stat-card"><div className="stat-top"><span className="stat-icon lavender"><Icon name="trend" /></span><span className="stat-hint">At current prices</span></div><div className="stat-value">{money.format(inventoryValue)}</div><div className="stat-caption">Inventory value</div></article>
                <article className="stat-card"><div className="stat-top"><span className="stat-icon yellow"><Icon name="chart" /></span><span className="stat-hint">{outOfStockCount} out of stock</span></div><div className="stat-value">{lowStockProducts.length + outOfStockCount}</div><div className="stat-caption">Items to restock</div></article>
              </section>

              <section className="dashboard-grid">
                <article className="panel sales-panel">
                  <div className="panel-heading"><div><h2>Recent sales</h2><p>Completed bills at a glance</p></div><button className="text-button" onClick={() => navigate('Sales')}>View all <Icon name="arrow" size={15} /></button></div>
                  {latestBills.length === 0 ? (
                    <div className="empty-state compact"><span className="empty-icon"><Icon name="receipt" size={22} /></span><strong>No sales just yet</strong><p>Your completed bills will show up here.</p><button className="text-button" onClick={() => navigate('Billing')}>Create your first bill <Icon name="arrow" size={15} /></button></div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>DATE</th><th className="numeric">TOTAL</th></tr></thead>
                        <tbody>{latestBills.map((bill) => <tr key={bill.id}><td><button className="invoice-link" onClick={() => { setSelectedBill(bill); navigate('Sales') }}>{bill.id}</button></td><td>{bill.customer}</td><td>{new Date(bill.createdAt || bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td><td className="numeric amount-strong">{money.format(bill.total)}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </article>
                <article className="panel stock-panel">
                  <div className="panel-heading"><div><h2>Stock watch</h2><p>Products that may need attention</p></div><span className="alert-count">{lowStockProducts.length + outOfStockCount}</span></div>
                  {lowStockProducts.length + outOfStockCount === 0 ? <div className="stock-all-good"><span>✓</span><div><strong>Everything looks good</strong><p>No products need restocking.</p></div></div> : (
                    <div className="stock-list">{products.filter((product) => product.quantity <= 5).slice(0, 5).map((product) => <div className="stock-row" key={product.id}><span className={`product-dot ${product.category?.toLowerCase().replace(/[^a-z]/g, '-') || 'general'}`}><Icon name="box" size={17} /></span><div className="stock-product"><strong>{product.name}</strong><span>{product.category || 'General'}</span></div><span className={`stock-badge ${product.quantity === 0 ? 'out' : ''}`}>{product.quantity === 0 ? 'Out of stock' : `${product.quantity} left`}</span></div>)}</div>
                  )}
                  <button className="panel-footer-link" onClick={() => navigate('Inventory')}>Review inventory <Icon name="arrow" size={15} /></button>
                </article>
              </section>
              <section className="quick-actions"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>What would you like to do?</h2></div><button onClick={() => { setProductDialog({}); navigate('Inventory') }}><span className="quick-icon"><Icon name="plus" /></span><span><strong>Add a product</strong><small>Expand your inventory</small></span><Icon name="chevron" size={17} /></button><button onClick={() => navigate('Billing')}><span className="quick-icon warm"><Icon name="receipt" /></span><span><strong>Create a bill</strong><small>Checkout a customer</small></span><Icon name="chevron" size={17} /></button></section>
            </>
          )}

          {activePage === 'Inventory' && (
            <>
              <section className="page-heading">
                <div><p className="eyebrow">KEEP YOUR SHELVES IN CHECK</p><h1>Inventory</h1><p className="page-subtitle">Track products, prices and stock levels in one place.</p></div>
                <button className="button button-primary" onClick={() => setProductDialog({})}><Icon name="plus" size={18} /> Add product</button>
              </section>
              <section className="inventory-summary"><div><strong>{products.length}</strong><span>Total products</span></div><div><strong>{products.reduce((total, product) => total + product.quantity, 0)}</strong><span>Units in stock</span></div><div><strong>{money.format(inventoryValue)}</strong><span>Total stock value</span></div><div><strong className={lowStockProducts.length + outOfStockCount > 0 ? 'warning-text' : ''}>{lowStockProducts.length + outOfStockCount}</strong><span>Need restocking</span></div></section>
              <section className="panel inventory-panel">
                <div className="inventory-toolbar"><div><h2>All products</h2><p>Manage your products and stock levels.</p></div><div className="filters"><label className="search-field"><Icon name="search" size={18} /><input aria-label="Search products" placeholder="Search products or SKU" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div></div>
                {filteredProducts.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="box" size={23} /></span><strong>{products.length ? 'No matching products' : 'Your inventory is ready'}</strong><p>{products.length ? 'Try another search or category.' : 'Add your first product to start tracking stock.'}</p>{!products.length && <button className="button button-primary" onClick={() => setProductDialog({})}><Icon name="plus" size={17} /> Add your first product</button>}</div> : (
                  <div className="table-wrap">
                    <table className="data-table inventory-table">
                      <thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>PRICE</th><th>IN STOCK</th><th>STOCK VALUE</th><th><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>{filteredProducts.map((product) => <tr key={product.id}><td><div className="product-cell"><span className={`product-dot ${product.category?.toLowerCase().replace(/[^a-z]/g, '-') || 'general'}`}><Icon name="box" size={17} /></span><strong>{product.name}</strong></div></td><td className="muted-cell">{product.sku || '—'}</td><td><span className="category-chip">{product.category || 'General'}</span></td><td>{money.format(product.price)}</td><td><span className={`quantity-indicator ${product.quantity === 0 ? 'quantity-out' : product.quantity <= 5 ? 'quantity-low' : ''}`}><i />{product.quantity === 0 ? 'Out of stock' : `${product.quantity} units`}</span></td><td className="amount-strong">{money.format(product.price * product.quantity)}</td><td><div className="row-actions"><button aria-label={`Edit ${product.name}`} title="Edit product" onClick={() => setProductDialog(product)}><Icon name="edit" size={17} /></button><button aria-label={`Delete ${product.name}`} title="Delete product" onClick={() => deleteProduct(product)}><Icon name="trash" size={17} /></button></div></td></tr>)}</tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {activePage === 'Billing' && (
            <>
              <section className="page-heading billing-heading"><div><p className="eyebrow">A QUICK, FRIENDLY CHECKOUT</p><h1>Create a bill</h1><p className="page-subtitle">Add products to the order and you’re ready to check out.</p></div><span className="tax-note">GST added at 5%</span></section>
              <section className="billing-layout">
                <article className="panel bill-products">
                  <div className="inventory-toolbar"><div><h2>Choose products</h2><p>{products.length} products available</p></div><label className="search-field"><Icon name="search" size={18} /><input aria-label="Search products to bill" placeholder="Find a product" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
                  {filteredProducts.length === 0 ? <div className="empty-state compact"><strong>No products available</strong><p>Add products to your inventory before billing.</p><button className="text-button" onClick={() => navigate('Inventory')}>Go to inventory <Icon name="arrow" size={15} /></button></div> : (
                    <div className="bill-product-list">{filteredProducts.map((product) => { const quantityInCart = cart.find((item) => item.id === product.id)?.quantity || 0; const available = product.quantity - quantityInCart; return <div className={`bill-product ${available <= 0 ? 'unavailable' : ''}`} key={product.id}><span className={`product-dot ${product.category?.toLowerCase().replace(/[^a-z]/g, '-') || 'general'}`}><Icon name="box" size={18} /></span><div className="bill-product-info"><strong>{product.name}</strong><span>{product.sku || product.category || 'General'}</span></div><div className="bill-product-price"><strong>{money.format(product.price)}</strong><span>{available > 0 ? `${available} available` : 'Out of stock'}</span></div><button className="add-product-button" disabled={available <= 0} aria-label={`Add ${product.name} to bill`} onClick={() => addToCart(product)}><Icon name="plus" size={18} /></button></div> })}</div>
                  )}
                </article>
                <article className="panel order-panel">
                  <div className="order-heading"><div><p className="eyebrow">NEW CHECKOUT</p><h2>Current order</h2></div><span className="order-count">{cart.reduce((count, item) => count + item.quantity, 0)} items</span></div>
                  <label className="field-label" htmlFor="customer-name">Customer name <span>Optional</span></label>
                  <input id="customer-name" className="customer-input" placeholder="Walk-in customer" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
                  <div className="order-items">
                    {cart.length === 0 ? <div className="cart-empty"><span className="empty-icon"><Icon name="bag" size={21} /></span><strong>Your order is empty</strong><p>Select a product to get started.</p></div> : cart.map((item) => <div className="order-item" key={item.id}><div className="order-item-details"><strong>{item.name}</strong><span>{money.format(item.price)} each</span><div className="quantity-control"><button aria-label={`Decrease ${item.name} quantity`} onClick={() => changeCartQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button aria-label={`Increase ${item.name} quantity`} onClick={() => changeCartQuantity(item.id, 1)}>+</button></div></div><strong className="order-line-total">{money.format(item.price * item.quantity)}</strong></div>)}
                  </div>
                  <div className="order-totals"><div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><div><span>GST <small>5%</small></span><strong>{money.format(tax)}</strong></div><div className="order-grand-total"><span>Total due</span><strong>{money.format(grandTotal)}</strong></div></div>
                  <button className="button button-primary checkout-button" disabled={cart.length === 0} onClick={completeBill}>Complete bill <Icon name="arrow" size={17} /></button>
                  <p className="secure-note">Stock updates automatically when the bill is complete.</p>
                </article>
              </section>
            </>
          )}

          {activePage === 'Sales' && (
            <>
              <section className="page-heading"><div><p className="eyebrow">EVERY TRANSACTION, RIGHT HERE</p><h1>Sales & bills</h1><p className="page-subtitle">Review your completed customer orders.</p></div>{displayedBill && <button className="button button-secondary" onClick={printBill}><Icon name="print" size={17} /> Print selected bill</button>}</section>
              <section className="sales-summary"><div className="sales-summary-card"><span>ALL-TIME SALES</span><strong>{money.format(billHistory.reduce((total, bill) => total + bill.total, 0))}</strong></div><div className="sales-summary-card"><span>COMPLETED BILLS</span><strong>{billHistory.length}</strong></div><div className="sales-summary-card"><span>SALES TODAY</span><strong>{money.format(todaysSales)}</strong></div></section>
              <section className="sales-history-layout">
                <article className="panel history-panel"><div className="panel-heading"><div><h2>Bill history</h2><p>{billHistory.length} completed {billHistory.length === 1 ? 'bill' : 'bills'}</p></div></div>{billHistory.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="receipt" size={22} /></span><strong>No completed bills yet</strong><p>Create your first bill to see it in this list.</p><button className="text-button" onClick={() => navigate('Billing')}>Start a bill <Icon name="arrow" size={15} /></button></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>DATE</th><th>ITEMS</th><th className="numeric">TOTAL</th></tr></thead><tbody>{billHistory.map((bill) => <tr className={displayedBill?.id === bill.id ? 'selected-row' : ''} key={bill.id} onClick={() => setSelectedBill(bill)}><td><button className="invoice-link" onClick={() => setSelectedBill(bill)}>{bill.id}</button></td><td>{bill.customer}</td><td>{new Date(bill.createdAt || bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{bill.items.reduce((count, item) => count + item.quantity, 0)}</td><td className="numeric amount-strong">{money.format(bill.total)}</td></tr>)}</tbody></table></div>}</article>
                <article className="panel receipt-panel"><div className="panel-heading"><div><h2>Bill details</h2><p>{displayedBill ? displayedBill.id : 'Select a bill to preview'}</p></div>{displayedBill && <button aria-label="Print bill" className="icon-button" onClick={printBill}><Icon name="print" size={17} /></button>}</div>{displayedBill ? <div className="receipt-content"><div className="receipt-brand"><span className="brand-mark"><Icon name="box" size={20} /></span><div><strong>stockwise</strong><span>Thank you for shopping with us</span></div></div><div className="receipt-meta"><span>INVOICE<strong>{displayedBill.id}</strong></span><span>CUSTOMER<strong>{displayedBill.customer}</strong></span><span>DATE<strong>{new Date(displayedBill.createdAt || displayedBill.date).toLocaleString('en-IN')}</strong></span></div><div className="table-wrap"><table className="data-table receipt-table"><thead><tr><th>ITEM</th><th>QTY</th><th>PRICE</th><th className="numeric">TOTAL</th></tr></thead><tbody>{renderBillRows(displayedBill)}</tbody></table></div><div className="receipt-totals"><div><span>Subtotal</span><strong>{money.format(displayedBill.subtotal ?? displayedBill.total)}</strong></div><div><span>GST</span><strong>{money.format(displayedBill.tax ?? 0)}</strong></div><div className="order-grand-total"><span>Total paid</span><strong>{money.format(displayedBill.total)}</strong></div></div></div> : <div className="empty-state compact"><span className="empty-icon"><Icon name="receipt" size={22} /></span><strong>Your bill preview lives here</strong><p>Select a transaction to review its details.</p></div>}</article>
              </section>
            </>
          )}
        </div>
        <footer className="app-footer"><span>stockwise <span>·</span> Inventory made simple</span><span>All data stays in this browser</span></footer>
      </main>

      {productDialog && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProductDialog(null) }}>
          <section aria-labelledby="product-dialog-title" aria-modal="true" className="product-dialog" role="dialog">
            <div className="dialog-heading"><div><p className="eyebrow">{productDialog.id ? 'UPDATE YOUR CATALOG' : 'GROW YOUR CATALOG'}</p><h2 id="product-dialog-title">{productDialog.id ? 'Edit product' : 'Add a product'}</h2></div><button aria-label="Close dialog" className="icon-button" onClick={() => setProductDialog(null)}><Icon name="close" size={19} /></button></div>
            <form className="product-form" onSubmit={saveProduct}>
              <label>Product name<input autoFocus defaultValue={productDialog.name || ''} name="name" placeholder="e.g. Cotton tote bag" required /></label>
              <div className="form-row"><label>Category<input defaultValue={productDialog.category || ''} name="category" placeholder="e.g. Accessories" /></label><label>SKU <span>Optional</span><input defaultValue={productDialog.sku || ''} name="sku" placeholder="e.g. AC-1001" /></label></div>
              <div className="form-row"><label>Price (₹)<input defaultValue={productDialog.price ?? ''} min="0.01" name="price" placeholder="0.00" required step="0.01" type="number" /></label><label>Stock quantity<input defaultValue={productDialog.quantity ?? ''} min="0" name="quantity" placeholder="0" required step="1" type="number" /></label></div>
              <div className="dialog-actions"><button className="button button-secondary" onClick={() => setProductDialog(null)} type="button">Cancel</button><button className="button button-primary" type="submit">{productDialog.id ? 'Save changes' : 'Add product'}</button></div>
            </form>
          </section>
        </div>
      )}
      {notice && <div className="toast" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><Icon name="close" size={16} /></button></div>}
    </div>
  )
}

export default App

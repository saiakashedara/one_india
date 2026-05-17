import React, { useMemo, useState } from 'react';
import './shoppingPage.css';

const categories = [
  'All',
  'Mobiles',
  'Electronics',
  'Fashion',
  'Home',
  'Grocery',
  'Beauty',
  'Books',
];

const products = [
  {
    id: 1,
    name: 'OnePlus Nord CE 4 Lite 5G',
    category: 'Mobiles',
    price: 18999,
    mrp: 22999,
    rating: 4.4,
    reviews: 18342,
    delivery: 'Tomorrow',
    tag: 'Great Indian deal',
    image: 'OP',
    color: '#dbeafe',
    prime: true,
  },
  {
    id: 2,
    name: 'Noise Buds N1 Pro ANC',
    category: 'Electronics',
    price: 1799,
    mrp: 4999,
    rating: 4.2,
    reviews: 8421,
    delivery: 'Today',
    tag: 'Lightning deal',
    image: 'NB',
    color: '#dcfce7',
    prime: true,
  },
  {
    id: 3,
    name: 'Cotton Kurta Set',
    category: 'Fashion',
    price: 1299,
    mrp: 2499,
    rating: 4.1,
    reviews: 3120,
    delivery: '2 days',
    tag: 'Festive pick',
    image: 'FK',
    color: '#fef3c7',
    prime: false,
  },
  {
    id: 4,
    name: 'Smart LED TV 43 inch',
    category: 'Electronics',
    price: 23999,
    mrp: 34999,
    rating: 4.5,
    reviews: 21680,
    delivery: 'Tomorrow',
    tag: 'Exchange bonus',
    image: 'TV',
    color: '#e0e7ff',
    prime: true,
  },
  {
    id: 5,
    name: 'Stainless Steel Cookware Set',
    category: 'Home',
    price: 2199,
    mrp: 3999,
    rating: 4.3,
    reviews: 6551,
    delivery: 'Tomorrow',
    tag: 'Kitchen essential',
    image: 'HW',
    color: '#ffedd5',
    prime: true,
  },
  {
    id: 6,
    name: 'Monthly Grocery Basket',
    category: 'Grocery',
    price: 1599,
    mrp: 2110,
    rating: 4.6,
    reviews: 12503,
    delivery: 'Today',
    tag: 'Fresh saver',
    image: 'GB',
    color: '#d1fae5',
    prime: true,
  },
  {
    id: 7,
    name: 'Vitamin C Face Serum',
    category: 'Beauty',
    price: 549,
    mrp: 999,
    rating: 4.0,
    reviews: 2384,
    delivery: '2 days',
    tag: 'Top rated',
    image: 'VC',
    color: '#fce7f3',
    prime: false,
  },
  {
    id: 8,
    name: 'Atomic Habits Paperback',
    category: 'Books',
    price: 399,
    mrp: 799,
    rating: 4.7,
    reviews: 48290,
    delivery: 'Tomorrow',
    tag: 'Reader favorite',
    image: 'BK',
    color: '#ccfbf1',
    prime: true,
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const ShoppingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyFastDelivery, setOnlyFastDelivery] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pincode, setPincode] = useState('560001');

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(normalizedQuery) || product.category.toLowerCase().includes(normalizedQuery);
      const matchesDelivery = !onlyFastDelivery || product.delivery === 'Today' || product.delivery === 'Tomorrow';
      return matchesCategory && matchesSearch && matchesDelivery;
    });

    return [...visible].sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp;
      return b.reviews - a.reviews;
    });
  }, [query, selectedCategory, sortBy, onlyFastDelivery]);

  const cartItems = useMemo(
    () =>
      cart.map((entry) => ({
        ...entry,
        product: products.find((product) => product.id === entry.id),
      })),
    [cart]
  );

  const cartTotal = cartItems.reduce((total, entry) => total + entry.product.price * entry.quantity, 0);
  const cartMrp = cartItems.reduce((total, entry) => total + entry.product.mrp * entry.quantity, 0);
  const cartCount = cart.reduce((total, entry) => total + entry.quantity, 0);
  const walletRewards = Math.round(cartTotal * 0.02);

  const addToCart = (productId) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === productId);
      if (existing) {
        return currentCart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...currentCart, { id: productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, direction) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity + direction } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((currentWishlist) =>
      currentWishlist.includes(productId)
        ? currentWishlist.filter((itemId) => itemId !== productId)
        : [...currentWishlist, productId]
    );
  };

  return (
    <section className="shopping-page">
      <div className="shop-topbar">
        <div className="shop-brand">
          <span>OI</span>
          <div>
            <strong>OneIndia Shopping</strong>
            <p>Delivering to {pincode}</p>
          </div>
        </div>

        <div className="shop-search">
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} aria-label="Category">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, brands and categories"
            aria-label="Search products"
          />
          <button type="button">Search</button>
        </div>

        <div className="shop-cart-badge">
          <span>Cart</span>
          <strong>{cartCount}</strong>
        </div>
      </div>

      <div className="shopping-hero">
        <div>
          <p className="shop-kicker">OneIndia Super Sale</p>
          <h1>Everything you need, delivered with wallet rewards.</h1>
          <p>
            Shop mobile phones, electronics, fashion, home essentials, groceries, beauty and books with fast delivery,
            wishlists, ratings, exchange-style offers and secure checkout.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={() => setSelectedCategory('Mobiles')}>Mobiles</button>
            <button type="button" onClick={() => setSelectedCategory('Grocery')}>Daily needs</button>
            <button type="button" onClick={() => setOnlyFastDelivery(true)}>Fast delivery</button>
          </div>
        </div>
        <div className="deal-stack" aria-label="Featured deals">
          <article>
            <span>Deal of the day</span>
            <strong>Up to 60% off</strong>
            <p>Electronics, home and fashion picks refreshed daily.</p>
          </article>
          <article>
            <span>Wallet rewards</span>
            <strong>2% cashback</strong>
            <p>Earn points across shopping, travel and payments.</p>
          </article>
        </div>
      </div>

      <div className="category-strip" aria-label="Shop categories">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="shop-layout">
        <aside className="shop-filters">
          <h2>Filters</h2>
          <label>
            Delivery pincode
            <input value={pincode} maxLength="6" onChange={(event) => setPincode(event.target.value)} />
          </label>
          <label>
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="priceLow">Price: low to high</option>
              <option value="priceHigh">Price: high to low</option>
              <option value="rating">Customer rating</option>
              <option value="discount">Best discount</option>
            </select>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={onlyFastDelivery}
              onChange={(event) => setOnlyFastDelivery(event.target.checked)}
            />
            Today or tomorrow delivery
          </label>
          <div className="filter-note">
            <strong>Buyer tools</strong>
            <p>Wishlist, delivery promise, ratings, returns, wallet cashback and cart summary are ready on this page.</p>
          </div>
        </aside>

        <main className="products-panel">
          <div className="panel-heading">
            <div>
              <h2>{selectedCategory === 'All' ? 'Recommended for you' : selectedCategory}</h2>
              <p>{filteredProducts.length} products found</p>
            </div>
            <span>{cartCount} items in cart</span>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => {
              const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
              const wished = wishlist.includes(product.id);

              return (
                <article className="product-card" key={product.id}>
                  <button
                    type="button"
                    className={`wishlist-button ${wished ? 'saved' : ''}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {wished ? 'Saved' : 'Save'}
                  </button>
                  <div className="product-art" style={{ background: product.color }}>
                    <span>{product.image}</span>
                  </div>
                  <div className="product-info">
                    <span className="deal-pill">{product.tag}</span>
                    <h3>{product.name}</h3>
                    <div className="rating-row">
                      <strong>{product.rating}</strong>
                      <span>{product.reviews.toLocaleString('en-IN')} reviews</span>
                    </div>
                    <div className="price-row">
                      <strong>{formatCurrency(product.price)}</strong>
                      <span>{formatCurrency(product.mrp)}</span>
                      <em>{discount}% off</em>
                    </div>
                    <p className="delivery-line">
                      {product.prime ? 'OneIndia Prime' : 'Standard'} delivery by {product.delivery}
                    </p>
                  </div>
                  <div className="product-actions">
                    <button type="button" onClick={() => addToCart(product.id)}>Add to cart</button>
                    <button type="button" className="buy-button" onClick={() => addToCart(product.id)}>Buy now</button>
                  </div>
                </article>
              );
            })}
          </div>
        </main>

        <aside className="cart-panel">
          <h2>Checkout</h2>
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is ready for something good.</p>
          ) : (
            <div className="cart-items">
              {cartItems.map(({ product, quantity }) => (
                <article key={product.id} className="cart-item">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{formatCurrency(product.price)}</span>
                  </div>
                  <div className="quantity-control">
                    <button type="button" onClick={() => updateQuantity(product.id, -1)}>-</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, 1)}>+</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="price-summary">
            <div>
              <span>MRP total</span>
              <strong>{formatCurrency(cartMrp)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>-{formatCurrency(cartMrp - cartTotal)}</strong>
            </div>
            <div>
              <span>Wallet rewards</span>
              <strong>{formatCurrency(walletRewards)}</strong>
            </div>
            <div className="pay-row">
              <span>To pay</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
          </div>

          <button type="button" className="checkout-button" disabled={!cartItems.length}>
            Pay with OneIndia Wallet
          </button>
        </aside>
      </div>
    </section>
  );
};

export default ShoppingPage;

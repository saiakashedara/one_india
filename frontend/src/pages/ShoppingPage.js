import React, { useState } from 'react';
import './shoppingPage.css';

const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Grocery'];
const products = [
  { id: 101, name: 'Smartphone X1', category: 'Electronics', price: 15999, rating: 4.5, img: '📱' },
  { id: 102, name: 'Organic Daal 1kg', category: 'Grocery', price: 180, rating: 4.8, img: '📦' },
  { id: 103, name: 'Cotton T-Shirt', category: 'Fashion', price: 599, rating: 4.2, img: '👕' },
  { id: 104, name: 'Smart LED Bulb', category: 'Home', price: 349, rating: 4.4, img: '💡' },
];

const ShoppingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const formatCurrency = (amt) => `₹${amt.toLocaleString('en-IN')}`;

  return (
    <section className="shopping-page">
      <div className="shop-header">
        <div className="shop-info">
          <p className="kicker">OneIndia Marketplace</p>
          <h1>Everyday Essentials.</h1>
        </div>
        <div className="cart-badge">
          🛒 <span>{cartCount} Items</span>
        </div>
      </div>

      <div className="category-bar">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-img">{product.img}</div>
            <div className="product-details">
              <span className="cat-tag">{product.category}</span>
              <h3>{product.name}</h3>
              <div className="price-row">
                <strong>{formatCurrency(product.price)}</strong>
                <button className="wish-btn" title="Add to Wishlist">❤️</button>
              </div>
              <button 
                className="add-cart-btn"
                onClick={() => setCartCount(c => c + 1)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="shopping-footer-banner">
        <div className="bnpl-promo">
          <h3>Buy Now, Pay Later</h3>
          <p>Get instant credit up to ₹10,000 for your shopping needs. 0% interest for 15 days.</p>
          <button className="activate-btn">Activate BNPL</button>
        </div>
      </div>
    </section>
  );
};

export default ShoppingPage;

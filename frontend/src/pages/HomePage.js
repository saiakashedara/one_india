import React from 'react';
import '../styles/auth.css';
import './homePage.css';

const HomePage = () => {
  return (
    <div className="app-background">
      <section className="home-hero">
        <div className="home-hero-top">
          <div className="home-logo">
            <span className="logo-text">🇮🇳</span>
          </div>
          <div>
            <h1>OneIndia</h1>
            <p>Our aim is to connect every Indian with simple, trustworthy services built for everyday life.</p>
          </div>
        </div>

        <div className="home-aim">
          <div className="aim-card">
            <h3>Our Mission</h3>
            <p>To deliver seamless, local services across India with the spirit of unity, safety and convenience. We bring payments, travel, health, shopping and home support together in one digital platform.</p>
          </div>

          <div className="aim-card">
            <h3>What We Provide</h3>
            <p>OneIndia is designed to help users save time, avoid complexity and access trusted services from anywhere in the country.</p>
          </div>
        </div>
      </section>

      <section className="services-grid">
        <div className="service-tile">
          <div className="tile-badge"><span>💳</span><strong>Payments</strong></div>
          <ul>
            <li>Mobile wallet and fund transfers</li>
            <li>Bill payments and recharge</li>
            <li>Secure payment experience</li>
          </ul>
        </div>

        <div className="service-tile">
          <div className="tile-badge"><span>✈️</span><strong>Travel</strong></div>
          <ul>
            <li>Hotel discovery and room booking</li>
            <li>Trip planning and local stays</li>
            <li>Safe journeys across India</li>
          </ul>
        </div>

        <div className="service-tile">
          <div className="tile-badge"><span>❤️</span><strong>Health</strong></div>
          <ul>
            <li>Doctor and clinic search</li>
            <li>Hospital listings and appointments</li>
            <li>Health support when you need it</li>
          </ul>
        </div>

        <div className="service-tile">
          <div className="tile-badge"><span>🛍️</span><strong>Shopping</strong></div>
          <ul>
            <li>Easy product search and ordering</li>
            <li>Everyday essentials delivered</li>
            <li>Convenience for every home</li>
          </ul>
        </div>

        <div className="service-tile">
          <div className="tile-badge"><span>🏠</span><strong>Home Services</strong></div>
          <ul>
            <li>Cleaning, plumbing, electrical repairs</li>
            <li>Trusted service providers near you</li>
            <li>Quick home support on demand</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

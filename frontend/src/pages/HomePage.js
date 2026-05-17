import React from 'react';
import { Link } from 'react-router-dom';
import './homePage.css';

const serviceCards = [
  {
    title: 'Payments',
    path: '/services/payments',
    code: 'PA',
    tone: 'payments',
    summary: 'Wallet balance, add money, transfers and transaction history.',
    stats: ['Instant wallet', 'Secure transfers', 'Rewards'],
  },
  {
    title: 'Travel',
    path: '/services/travel',
    code: 'TR',
    tone: 'travel',
    summary: 'Flights, trains, buses, hotels and city distance estimates.',
    stats: ['Route distance', 'Fare estimate', 'Bookings'],
  },
  {
    title: 'Health',
    path: '/services/health',
    code: 'HE',
    tone: 'health',
    summary: 'Find doctors, hospitals, clinics and book appointments.',
    stats: ['Specialties', 'Slots', 'Records'],
  },
  {
    title: 'Shopping',
    path: '/services/shopping',
    code: 'SH',
    tone: 'shopping',
    summary: 'Search products, filter deals, wishlist, cart and checkout.',
    stats: ['Categories', 'Fast delivery', 'Wallet pay'],
  },
  {
    title: 'Home Services',
    path: '/services/home-services',
    code: 'HS',
    tone: 'services',
    summary: 'Cleaning, plumbing, electrical and repair professionals.',
    stats: ['Verified pros', 'Slots', 'Transparent fee'],
  },
];

const HomePage = () => {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">OneIndia Super App</p>
          <h1>All daily services in one colorful, simple place.</h1>
          <p>
            Use payments, travel, health, shopping and home services after login. Every card below opens a complete
            working module with search, booking, checkout or wallet actions.
          </p>
          <div className="home-actions">
            <Link to="/services/payments">Open wallet</Link>
            <Link to="/services/shopping">Start shopping</Link>
          </div>
        </div>

        <div className="home-command-card">
          <span>Today on OneIndia</span>
          <strong>5 services</strong>
          <p>Payments, Travel, Health, Shopping and Home Services are ready from this home screen.</p>
        </div>
      </div>

      <div className="home-highlights">
        <article>
          <span>Wallet</span>
          <strong>Pay everywhere</strong>
          <p>Add money, transfer and track your history.</p>
        </article>
        <article>
          <span>Bookings</span>
          <strong>Plan faster</strong>
          <p>Book travel, doctors and home professionals.</p>
        </article>
        <article>
          <span>Commerce</span>
          <strong>Shop smarter</strong>
          <p>Browse deals, cart items and checkout clearly.</p>
        </article>
      </div>

      <div className="home-section-heading">
        <div>
          <h2>Your service hub</h2>
          <p>Choose a module and continue from a focused page.</p>
        </div>
        <span>Login required</span>
      </div>

      <div className="home-services-grid">
        {serviceCards.map((service) => (
          <Link to={service.path} className={`home-service-card ${service.tone}`} key={service.title}>
            <div className="service-card-top">
              <span>{service.code}</span>
              <strong>{service.title}</strong>
            </div>
            <p>{service.summary}</p>
            <div className="service-chip-row">
              {service.stats.map((stat) => (
                <em key={stat}>{stat}</em>
              ))}
            </div>
            <div className="open-service">Open {service.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomePage;

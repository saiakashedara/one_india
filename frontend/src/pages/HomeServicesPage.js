import React, { useState } from 'react';
import './homeServices.css';

const services = [
  { id: 1, name: 'Deep Cleaning', icon: '🧹', price: 999, duration: '4 hrs' },
  { id: 2, name: 'Plumbing Repair', icon: '🔧', price: 249, duration: '1 hr' },
  { id: 3, name: 'AC Servicing', icon: '❄️', price: 499, duration: '2 hrs' },
  { id: 4, name: 'Electrician', icon: '⚡', price: 199, duration: '1 hr' },
];

const professionals = [
  { name: 'Ramesh Kumar', rating: 4.8, jobs: 120, verified: true },
  { name: 'Suresh Singh', rating: 4.7, jobs: 85, verified: true },
];

const HomeServicesPage = () => {
  const [bookingStatus, setBookingStatus] = useState(null);

  return (
    <section className="home-services">
      <div className="services-hero">
        <h1>Trusted help at your doorstep.</h1>
        <p>Verified professionals for all your home needs.</p>
      </div>

      <div className="service-options-grid">
        {services.map(s => (
          <div key={s.id} className="service-option-card">
            <span className="srv-icon">{s.icon}</span>
            <h3>{s.name}</h3>
            <p>Starts from ₹{s.price}</p>
            <button onClick={() => setBookingStatus(`Booking ${s.name}...`)}>Book Now</button>
          </div>
        ))}
      </div>

      <div className="pro-network">
        <h2>Top Professionals Near You</h2>
        <div className="pro-list">
          {professionals.map(pro => (
            <div key={pro.name} className="pro-card">
              <div className="pro-info">
                <strong>{pro.name} {pro.verified && '✅'}</strong>
                <span>⭐ {pro.rating} ({pro.jobs} jobs)</span>
              </div>
              <button className="chat-btn">💬 Chat</button>
            </div>
          ))}
        </div>
      </div>

      {bookingStatus && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <h3>{bookingStatus}</h3>
            <p>Scheduling your verified professional. Payment will be deducted from your OneIndia Wallet.</p>
            <button onClick={() => setBookingStatus(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeServicesPage;

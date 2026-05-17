import React, { useMemo, useState } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import './travelPage.css';

const cityData = {
  Delhi: { lat: 28.6139, lon: 77.209, region: 'North' },
  Mumbai: { lat: 19.076, lon: 72.8777, region: 'West' },
  Bengaluru: { lat: 12.9716, lon: 77.5946, region: 'South' },
  Chennai: { lat: 13.0827, lon: 80.2707, region: 'South' },
  Kolkata: { lat: 22.5726, lon: 88.3639, region: 'East' },
  Hyderabad: { lat: 17.385, lon: 78.4867, region: 'South' },
  Pune: { lat: 18.5204, lon: 73.8567, region: 'West' },
  Jaipur: { lat: 26.9124, lon: 75.7873, region: 'North' },
  Ahmedabad: { lat: 23.0225, lon: 72.5714, region: 'West' },
  Kochi: { lat: 9.9312, lon: 76.2673, region: 'South' },
  Lucknow: { lat: 26.8467, lon: 80.9462, region: 'North' },
  Goa: { lat: 15.2993, lon: 74.124, region: 'West' },
};

const serviceTabs = [
  { id: 'flights', label: 'Flights', icon: 'FL' },
  { id: 'trains', label: 'Trains', icon: 'TR' },
  { id: 'bus', label: 'Bus', icon: 'BU' },
  { id: 'hotels', label: 'Hotels', icon: 'HT' },
  { id: 'cabs', label: 'Cabs', icon: 'CB' },
];

const today = new Date().toISOString().slice(0, 10);

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const getDistance = (from, to) => {
  if (from === to) return 0;

  const origin = cityData[from];
  const destination = cityData[to];
  const radius = 6371;
  const latDiff = ((destination.lat - origin.lat) * Math.PI) / 180;
  const lonDiff = ((destination.lon - origin.lon) * Math.PI) / 180;
  const startLat = (origin.lat * Math.PI) / 180;
  const endLat = (destination.lat * Math.PI) / 180;
  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(radius * c);
};

const getDuration = (distance, speed) => {
  if (!distance) return '0 hr';
  const hours = distance / speed;
  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);
  return `${fullHours}h ${minutes}m`;
};

const buildOptions = (distance) => ({
  flights: [
    {
      name: 'OneIndia SmartFly',
      meta: 'Non-stop economy',
      time: getDuration(distance, 710),
      price: Math.max(1999, distance * 4.8),
      perks: ['Web check-in', 'Wallet cashback', 'Free date change'],
    },
    {
      name: 'Budget Air Connect',
      meta: '1 stop saver fare',
      time: getDuration(distance * 1.16, 680),
      price: Math.max(1599, distance * 3.9),
      perks: ['Lowest fare', 'Cab add-on', 'Travel insurance'],
    },
  ],
  trains: [
    {
      name: 'Vande Bharat Plus',
      meta: 'Chair car',
      time: getDuration(distance * 1.18, 88),
      price: Math.max(450, distance * 1.35),
      perks: ['Live running status', 'PNR tracking', 'Meal preference'],
    },
    {
      name: 'Rajdhani Express',
      meta: '3A sleeper',
      time: getDuration(distance * 1.24, 74),
      price: Math.max(650, distance * 1.1),
      perks: ['Tatkal alerts', 'Auto-upgrade', 'Platform info'],
    },
  ],
  bus: [
    {
      name: 'Premium AC Sleeper',
      meta: 'Overnight route',
      time: getDuration(distance * 1.28, 58),
      price: Math.max(399, distance * 1.25),
      perks: ['Live bus tracking', 'Boarding points', 'Free cancellation'],
    },
    {
      name: 'Volvo Multi-Axle',
      meta: 'Semi-sleeper',
      time: getDuration(distance * 1.22, 62),
      price: Math.max(349, distance * 1.05),
      perks: ['Reserved seat', 'Rest stop info', 'Wallet payment'],
    },
  ],
  cabs: [
    {
      name: 'Intercity Sedan',
      meta: 'AC, 4 seats',
      time: getDuration(distance * 1.2, 55),
      price: Math.max(1299, distance * 13),
      perks: ['Doorstep pickup', 'Toll estimate', 'Driver details'],
    },
    {
      name: 'SUV Family Ride',
      meta: 'AC, 6 seats',
      time: getDuration(distance * 1.2, 52),
      price: Math.max(1899, distance * 17),
      perks: ['Extra luggage', 'Round-trip option', 'Safety checks'],
    },
  ],
});

const hotelOptions = [
  { name: 'OneIndia Comfort Stay', area: 'City centre', price: 2199, rating: '4.3', tags: ['Free breakfast', 'Couple friendly'] },
  { name: 'Business Hub Rooms', area: 'Near transit station', price: 2899, rating: '4.5', tags: ['Pay at hotel', 'Wi-Fi'] },
  { name: 'Premium Heritage Inn', area: 'Tourist district', price: 3999, rating: '4.7', tags: ['Airport cab', 'Early check-in'] },
];

const TravelPage = () => {
  const cityNames = Object.keys(cityData);
  const [activeTab, setActiveTab] = useState('flights');
  const [fromCity, setFromCity] = useState('Delhi');
  const [toCity, setToCity] = useState('Mumbai');
  const [travelDate, setTravelDate] = useState(today);
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [hotelCity, setHotelCity] = useState('Mumbai');
  const [rooms, setRooms] = useState(1);
  const [bookings, setBookings] = usePersistentState('oneindia.travel.bookings', []);

  const distance = useMemo(() => getDistance(fromCity, toCity), [fromCity, toCity]);
  const travelOptions = useMemo(() => buildOptions(distance), [distance]);
  const routeProblem = fromCity === toCity;
  const selectedOptions = travelOptions[activeTab] || [];
  const selectedCity = activeTab === 'hotels' ? hotelCity : toCity;

  const swapCities = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  const saveBooking = (name, amount) => {
    setBookings((currentBookings) => [
      {
        id: Date.now(),
        service: activeTab,
        name,
        route: activeTab === 'hotels' ? hotelCity : `${fromCity} to ${toCity}`,
        date: travelDate,
        amount,
      },
      ...currentBookings,
    ]);
  };

  return (
    <section className="travel-page">
      <div className="travel-hero">
        <div>
          <p className="travel-kicker">OneIndia Travel</p>
          <h1>Book trips across India</h1>
          <p>
            Flights, trains, buses, hotels and intercity cabs with route distance,
            quick fare estimates and wallet-ready checkout.
          </p>
        </div>
        <div className="travel-route-card" aria-label="Selected route distance">
          <span>{fromCity}</span>
          <strong>{distance} km</strong>
          <span>{toCity}</span>
        </div>
      </div>

      <div className="travel-tabs" role="tablist" aria-label="Travel services">
        {serviceTabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="travel-search-panel">
        {activeTab === 'hotels' ? (
          <div className="travel-form-grid hotel-grid">
            <label>
              Destination
              <select value={hotelCity} onChange={(event) => setHotelCity(event.target.value)}>
                {cityNames.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Check-in
              <input type="date" value={travelDate} min={today} onChange={(event) => setTravelDate(event.target.value)} />
            </label>
            <label>
              Check-out
              <input type="date" value={returnDate} min={travelDate} onChange={(event) => setReturnDate(event.target.value)} />
            </label>
            <label>
              Rooms
              <input type="number" min="1" max="6" value={rooms} onChange={(event) => setRooms(Number(event.target.value))} />
            </label>
          </div>
        ) : (
          <div className="travel-form-grid">
            <label>
              From
              <select value={fromCity} onChange={(event) => setFromCity(event.target.value)}>
                {cityNames.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <button className="swap-button" type="button" onClick={swapCities} aria-label="Swap cities">
              ⇄
            </button>
            <label>
              To
              <select value={toCity} onChange={(event) => setToCity(event.target.value)}>
                {cityNames.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Departure
              <input type="date" value={travelDate} min={today} onChange={(event) => setTravelDate(event.target.value)} />
            </label>
            <label>
              Travellers
              <input
                type="number"
                min="1"
                max="9"
                value={passengers}
                onChange={(event) => setPassengers(Number(event.target.value))}
              />
            </label>
          </div>
        )}

        {routeProblem && activeTab !== 'hotels' && (
          <p className="route-warning">Choose two different cities to see route options.</p>
        )}
      </div>

      <div className="travel-summary-grid">
        <article>
          <span>Distance</span>
          <strong>{activeTab === 'hotels' ? 'Local stay' : `${distance} km`}</strong>
          <p>{activeTab === 'hotels' ? `${selectedCity} hotel search` : `${fromCity} to ${toCity}`}</p>
        </article>
        <article>
          <span>Region</span>
          <strong>{cityData[selectedCity].region}</strong>
          <p>{selectedCity} travel marketplace</p>
        </article>
        <article>
          <span>Wallet</span>
          <strong>Instant pay</strong>
          <p>Cashback, insurance and rewards ready</p>
        </article>
      </div>

      {activeTab === 'hotels' ? (
        <div className="travel-results">
          <div className="section-heading">
            <h2>Hotels in {hotelCity}</h2>
            <p>{rooms} room search for {travelDate}</p>
          </div>
          <div className="result-grid">
            {hotelOptions.map((hotel) => (
              <article className="travel-result-card" key={hotel.name}>
                <div>
                  <span className="result-pill">{hotel.rating} rating</span>
                  <h3>{hotel.name}</h3>
                  <p>{hotel.area}</p>
                </div>
                <ul>
                  {hotel.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="result-footer">
                  <strong>{formatCurrency(hotel.price * rooms)}</strong>
                  <button type="button" onClick={() => saveBooking(hotel.name, hotel.price * rooms)}>Book</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="travel-results">
          <div className="section-heading">
            <h2>{serviceTabs.find((tab) => tab.id === activeTab).label} from {fromCity} to {toCity}</h2>
            <p>{passengers} traveller search for {travelDate}</p>
          </div>
          <div className="result-grid">
            {selectedOptions.map((option) => (
              <article className="travel-result-card" key={option.name}>
                <div>
                  <span className="result-pill">{option.time}</span>
                  <h3>{option.name}</h3>
                  <p>{option.meta}</p>
                </div>
                <ul>
                  {option.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <div className="result-footer">
                  <strong>{formatCurrency(option.price * passengers)}</strong>
                  <button type="button" disabled={routeProblem} onClick={() => saveBooking(option.name, option.price * passengers)}>Book</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="travel-results">
          <div className="section-heading">
            <h2>Saved travel bookings</h2>
            <p>{bookings.length} saved after refresh</p>
          </div>
          <div className="result-grid">
            {bookings.map((booking) => (
              <article className="travel-result-card" key={booking.id}>
                <div>
                  <span className="result-pill">{booking.service}</span>
                  <h3>{booking.name}</h3>
                  <p>{booking.route} - {booking.date}</p>
                </div>
                <div className="result-footer">
                  <strong>{formatCurrency(booking.amount)}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default TravelPage;

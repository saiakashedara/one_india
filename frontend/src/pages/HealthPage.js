import React, { useMemo, useState } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import './healthPage.css';

const specialties = [
  'All',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Gynecology',
  'Dentistry',
  'General Medicine',
];

const providers = [
  {
    id: 1,
    type: 'Doctor',
    name: 'Dr. Asha Menon',
    specialty: 'Cardiology',
    location: 'Indiranagar',
    city: 'Bengaluru',
    rating: 4.8,
    experience: 14,
    fee: 799,
    nextSlot: 'Today 6:30 PM',
    modes: ['Clinic', 'Video'],
    tags: ['Heart health', 'ECG review', 'Insurance accepted'],
  },
  {
    id: 2,
    type: 'Doctor',
    name: 'Dr. Kabir Sharma',
    specialty: 'Dermatology',
    location: 'Andheri West',
    city: 'Mumbai',
    rating: 4.6,
    experience: 9,
    fee: 599,
    nextSlot: 'Tomorrow 11:00 AM',
    modes: ['Clinic', 'Video'],
    tags: ['Acne care', 'Skin allergy', 'Hair consult'],
  },
  {
    id: 3,
    type: 'Doctor',
    name: 'Dr. Meera Kapoor',
    specialty: 'Pediatrics',
    location: 'Saket',
    city: 'Delhi',
    rating: 4.7,
    experience: 12,
    fee: 699,
    nextSlot: 'Today 4:00 PM',
    modes: ['Clinic'],
    tags: ['Child fever', 'Vaccination', 'Growth tracking'],
  },
  {
    id: 4,
    type: 'Doctor',
    name: 'Dr. Farhan Ali',
    specialty: 'Orthopedics',
    location: 'Banjara Hills',
    city: 'Hyderabad',
    rating: 4.5,
    experience: 16,
    fee: 749,
    nextSlot: 'Tomorrow 9:30 AM',
    modes: ['Clinic', 'Video'],
    tags: ['Joint pain', 'Sports injury', 'X-ray review'],
  },
  {
    id: 5,
    type: 'Hospital',
    name: 'OneIndia Multispeciality Hospital',
    specialty: 'General Medicine',
    location: 'Koramangala',
    city: 'Bengaluru',
    rating: 4.4,
    experience: 24,
    fee: 499,
    nextSlot: 'Open 24/7',
    modes: ['Emergency', 'OPD'],
    tags: ['ICU', 'Diagnostics', 'Pharmacy'],
  },
  {
    id: 6,
    type: 'Clinic',
    name: 'SmileFirst Dental Clinic',
    specialty: 'Dentistry',
    location: 'Viman Nagar',
    city: 'Pune',
    rating: 4.6,
    experience: 8,
    fee: 399,
    nextSlot: 'Today 7:15 PM',
    modes: ['Clinic'],
    tags: ['Cleaning', 'Root canal', 'Aligners'],
  },
  {
    id: 7,
    type: 'Doctor',
    name: 'Dr. Nandita Rao',
    specialty: 'Gynecology',
    location: 'Anna Nagar',
    city: 'Chennai',
    rating: 4.9,
    experience: 18,
    fee: 899,
    nextSlot: 'Tomorrow 5:00 PM',
    modes: ['Clinic', 'Video'],
    tags: ['Pregnancy care', 'PCOS', 'Wellness'],
  },
];

const medicalRecords = [
  { title: 'Blood Test Report', date: '12 May 2026', status: 'Reviewed', type: 'Lab' },
  { title: 'Cardiology Prescription', date: '29 Apr 2026', status: 'Active', type: 'Rx' },
  { title: 'Vaccination Certificate', date: '02 Mar 2026', status: 'Saved', type: 'Vax' },
];

const appointmentSlots = ['Today 4:00 PM', 'Today 6:30 PM', 'Tomorrow 9:30 AM', 'Tomorrow 11:00 AM', '18 May 5:00 PM'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const HealthPage = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [careType, setCareType] = useState('All');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All cities');
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);
  const [selectedSlot, setSelectedSlot] = useState(appointmentSlots[1]);
  const [visitMode, setVisitMode] = useState('Clinic');
  const [appointments, setAppointments] = usePersistentState('oneindia.health.appointments', []);
  const [records, setRecords] = usePersistentState('oneindia.health.records', medicalRecords);

  const cities = useMemo(() => ['All cities', ...new Set(providers.map((provider) => provider.city))], []);

  const filteredProviders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesSpecialty = selectedSpecialty === 'All' || provider.specialty === selectedSpecialty;
      const matchesType = careType === 'All' || provider.type === careType;
      const matchesCity = city === 'All cities' || provider.city === city;
      const matchesSearch =
        provider.name.toLowerCase().includes(normalizedQuery) ||
        provider.specialty.toLowerCase().includes(normalizedQuery) ||
        provider.location.toLowerCase().includes(normalizedQuery);

      return matchesSpecialty && matchesType && matchesCity && matchesSearch;
    });
  }, [careType, city, query, selectedSpecialty]);

  const activeProvider = selectedProvider || filteredProviders[0] || providers[0];
  const appointmentTotal = activeProvider.fee + 49;

  const confirmAppointment = () => {
    setAppointments((currentAppointments) => [
      {
        id: Date.now(),
        provider: activeProvider.name,
        specialty: activeProvider.specialty,
        slot: selectedSlot,
        mode: visitMode,
        total: appointmentTotal,
      },
      ...currentAppointments,
    ]);
  };

  return (
    <section className="health-page">
      <div className="health-hero">
        <div>
          <p className="health-kicker">OneIndia Health</p>
          <h1>Find care, book appointments, keep records ready.</h1>
          <p>
            Search doctors by specialty, discover hospitals and clinics, choose appointment slots and manage your
            medical records in one connected health service.
          </p>
        </div>
        <div className="health-emergency-card">
          <span>Emergency support</span>
          <strong>24/7</strong>
          <p>Hospitals, ambulance help, pharmacy and diagnostics access.</p>
        </div>
      </div>

      <div className="health-search-panel">
        <div className="health-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search doctor, specialty, hospital or clinic"
            aria-label="Search health services"
          />
          <select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Select city">
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={careType} onChange={(event) => setCareType(event.target.value)} aria-label="Care type">
            <option value="All">All care</option>
            <option value="Doctor">Doctors</option>
            <option value="Hospital">Hospitals</option>
            <option value="Clinic">Clinics</option>
          </select>
        </div>
      </div>

      <div className="specialty-strip" aria-label="Find doctors by specialty">
        {specialties.map((specialty) => (
          <button
            type="button"
            key={specialty}
            className={selectedSpecialty === specialty ? 'active' : ''}
            onClick={() => setSelectedSpecialty(specialty)}
          >
            {specialty}
          </button>
        ))}
      </div>

      <div className="health-layout">
        <main className="provider-panel">
          <div className="health-section-heading">
            <div>
              <h2>Doctors, hospitals and clinics</h2>
              <p>{filteredProviders.length} care options available</p>
            </div>
            <span>Verified partners</span>
          </div>

          <div className="provider-grid">
            {filteredProviders.map((provider) => (
              <article
                key={provider.id}
                className={`provider-card ${activeProvider.id === provider.id ? 'selected' : ''}`}
              >
                <div className="provider-top">
                  <div className="provider-avatar">{provider.type.slice(0, 2)}</div>
                  <div>
                    <span className="provider-type">{provider.type}</span>
                    <h3>{provider.name}</h3>
                    <p>{provider.specialty} · {provider.location}, {provider.city}</p>
                  </div>
                </div>

                <div className="provider-stats">
                  <span>{provider.rating} rating</span>
                  <span>{provider.experience}+ yrs</span>
                  <span>{formatCurrency(provider.fee)}</span>
                </div>

                <ul className="provider-tags">
                  {provider.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>

                <div className="provider-footer">
                  <span>{provider.nextSlot}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider(provider);
                      setSelectedSlot(provider.nextSlot.includes('Open') ? appointmentSlots[0] : provider.nextSlot);
                      setVisitMode(provider.modes[0]);
                    }}
                  >
                    Book
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="appointment-panel">
          <h2>Book appointment</h2>
          <div className="appointment-doctor">
            <div className="provider-avatar">{activeProvider.type.slice(0, 2)}</div>
            <div>
              <strong>{activeProvider.name}</strong>
              <span>{activeProvider.specialty}</span>
            </div>
          </div>

          <label>
            Visit mode
            <select value={visitMode} onChange={(event) => setVisitMode(event.target.value)}>
              {activeProvider.modes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <div className="slot-grid" aria-label="Appointment slots">
            {appointmentSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={selectedSlot === slot ? 'active' : ''}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="appointment-summary">
            <div>
              <span>Consultation</span>
              <strong>{formatCurrency(activeProvider.fee)}</strong>
            </div>
            <div>
              <span>Platform care fee</span>
              <strong>{formatCurrency(49)}</strong>
            </div>
            <div className="payable-row">
              <span>Total</span>
              <strong>{formatCurrency(appointmentTotal)}</strong>
            </div>
          </div>

          <button type="button" className="confirm-appointment" onClick={confirmAppointment}>
            Confirm appointment
          </button>
        </aside>
      </div>

      {appointments.length > 0 && (
        <div className="records-panel">
          <div className="health-section-heading">
            <div>
              <h2>Saved appointments</h2>
              <p>Your confirmed appointments stay saved after refresh.</p>
            </div>
            <span>{appointments.length} booked</span>
          </div>
          <div className="records-grid">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="record-card">
                <span>Appt</span>
                <div>
                  <h3>{appointment.provider}</h3>
                  <p>{appointment.slot} - {appointment.mode}</p>
                </div>
                <strong>{formatCurrency(appointment.total)}</strong>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="records-panel">
        <div className="health-section-heading">
          <div>
            <h2>Medical records</h2>
            <p>Reports, prescriptions and certificates saved for quick access.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setRecords((currentRecords) => [
                {
                  title: 'Uploaded Health Record',
                  date: 'Today',
                  status: 'Saved',
                  type: 'File',
                },
                ...currentRecords,
              ])
            }
          >
            Upload record
          </button>
        </div>
        <div className="records-grid">
          {records.map((record) => (
            <article key={record.title} className="record-card">
              <span>{record.type}</span>
              <div>
                <h3>{record.title}</h3>
                <p>{record.date}</p>
              </div>
              <strong>{record.status}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthPage;

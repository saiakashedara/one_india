import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import PaymentsPage from './pages/PaymentsPage';
import TravelPage from './pages/TravelPage';
import OtherServicesPage from './pages/OtherServicesPage';
import HealthPage from './pages/HealthPage';
import ShoppingPage from './pages/ShoppingPage';
import HomeServicesPage from './pages/HomeServicesPage';
import SideMenu from './components/SideMenu';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = React.useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
            <div style={{ display: 'flex' }}>
              <SideMenu />
              <main className="main-with-side">
                <HomePage />
              </main>
            </div>
          } />

          <Route path="/services/payments" element={
            <div style={{ display: 'flex' }}>
              <SideMenu />
              <main className="main-with-side">
                <PaymentsPage />
              </main>
            </div>
          } />

          <Route path="/services/travel" element={
            <div style={{ display: 'flex' }}>
              <SideMenu />
              <main className="main-with-side">
                <TravelPage />
              </main>
            </div>
          } />

          <Route path="/services/health" element={
            <div style={{ display: 'flex' }}>
              <SideMenu />
              <main className="main-with-side">
                <HealthPage />
              </main>
            </div>
          } />

          <Route path="/services/shopping" element={
            <div style={{ display: 'flex' }}>
              <SideMenu />
              <main className="main-with-side">
                <ShoppingPage />
              </main>
            </div>
          } />

          <Route path="/services/home-services" element={
            <div style={{ display: 'flex' }}>
              <SideMenu />
              <main className="main-with-side">
                <HomeServicesPage />
              </main>
            </div>
          } />

          <Route path="/services/others" element={
            <div style={{ display: 'flex' }}>
              <SideMenu />
              <main className="main-with-side">
                <OtherServicesPage />
              </main>
            </div>
          } />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

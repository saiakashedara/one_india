import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PaymentsPage from './pages/PaymentsPage';
import TravelPage from './pages/TravelPage';
import HealthPage from './pages/HealthPage';
import ShoppingPage from './pages/ShoppingPage';
import HomeServicesPage from './pages/HomeServicesPage';
import SideMenu from './components/SideMenu';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = React.useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppShell({ children }) {
  return (
    <PrivateRoute>
      <div style={{ display: 'flex' }}>
        <SideMenu />
        <main className="main-with-side">
          {children}
        </main>
      </div>
    </PrivateRoute>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
            <AppShell>
              <HomePage />
            </AppShell>
          } />

          <Route path="/services/payments" element={
            <AppShell>
              <PaymentsPage />
            </AppShell>
          } />

          <Route path="/services/travel" element={
            <AppShell>
              <TravelPage />
            </AppShell>
          } />

          <Route path="/services/health" element={
            <AppShell>
              <HealthPage />
            </AppShell>
          } />

          <Route path="/services/shopping" element={
            <AppShell>
              <ShoppingPage />
            </AppShell>
          } />

          <Route path="/services/home-services" element={
            <AppShell>
              <HomeServicesPage />
            </AppShell>
          } />

          <Route path="/services/others" element={<Navigate to="/" />} />
          <Route path="/dashboard" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

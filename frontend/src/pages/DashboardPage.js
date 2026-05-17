import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usersAPI, paymentsAPI } from '../services/api';
import '../styles/auth.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, wRes] = await Promise.all([
          usersAPI.getProfile(),
          paymentsAPI.getWallet()
        ]);
        if (!mounted) return;
        setProfile(pRes.data?.user || pRes.data || pRes);
        setWallet(wRes.data?.wallet || wRes.data || wRes);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="dashboard-container">
      <div className="auth-card">
        <h1>Welcome to OneIndia</h1>
        <p>{profile ? `Hello, ${profile.firstName || profile.phone || 'test'}!` : user ? `Hello, ${user.firstName || user.phone || 'test'}!` : 'Hello, test!'}</p>
        <p>This is your dashboard. You can manage your account, payments, and services from here.</p>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div style={{ marginTop: 12 }}>
              <strong>Profile</strong>
              <div>Phone: {profile?.phone || '-'}</div>
              <div>Email: {profile?.email || '-'}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <strong>Wallet</strong>
              <div>Balance: {wallet?.balance != null ? `${wallet.balance} ${wallet.currency || 'INR'}` : 'N/A'}</div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button onClick={() => alert('Add money - not implemented')}>Add Money</button>
              <button onClick={() => alert('Transfer - not implemented')}>Transfer</button>
              <button onClick={() => { logout(); window.location.href = '/login'; }}>Logout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

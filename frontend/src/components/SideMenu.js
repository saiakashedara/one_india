import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './sideMenu.css';

const navItems = [
  { to: '/', label: 'Home', code: 'HO', tone: 'home' },
  { to: '/services/payments', label: 'Payments', code: 'PA', tone: 'payments' },
  { to: '/services/travel', label: 'Travel', code: 'TR', tone: 'travel' },
  { to: '/services/health', label: 'Health', code: 'HE', tone: 'health' },
  { to: '/services/shopping', label: 'Shopping', code: 'SH', tone: 'shopping' },
  { to: '/services/home-services', label: 'Home Services', code: 'HS', tone: 'services' },
];

const SideMenu = () => {
  const { logout } = useAuth();

  return (
    <aside className="side-menu">
      <div className="side-menu-inner">
        <div className="side-brand">
          <span>OI</span>
          <div>
            <strong>OneIndia</strong>
            <p>Super app</p>
          </div>
        </div>

        <nav aria-label="OneIndia services">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `${item.tone} ${isActive ? 'active' : ''}`}>
                  <span>{item.code}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button type="button" className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SideMenu;

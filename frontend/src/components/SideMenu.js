import React from 'react';
import { Link } from 'react-router-dom';
import './sideMenu.css';

const SideMenu = () => {
  return (
    <aside className="side-menu">
      <div className="side-menu-inner">
        <h3>Services</h3>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services/payments">Payments</Link></li>
            <li><Link to="/services/travel">Travel</Link></li>
            <li><Link to="/services/health">Health</Link></li>
            <li><Link to="/services/shopping">Shopping</Link></li>
            <li><Link to="/services/home-services">Home Services</Link></li>
            <li><Link to="/services/others">Other Services</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default SideMenu;

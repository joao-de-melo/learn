import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Learn</h2>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/kids" className={({ isActive }) => isActive ? 'active' : ''}>
                Kids
              </NavLink>
            </li>
            <li>
              <NavLink to="/games" className={({ isActive }) => isActive ? 'active' : ''}>
                Games
              </NavLink>
            </li>
            <li>
              <a href="#logout" className="logout" onClick={handleLogout}>
                Logout ({user?.name})
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

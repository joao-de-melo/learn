import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
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
                {t('dashboard')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/kids" className={({ isActive }) => isActive ? 'active' : ''}>
                {t('kids')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/games" className={({ isActive }) => isActive ? 'active' : ''}>
                {t('games')}
              </NavLink>
            </li>
            <li>
              <a href="#logout" className="logout" onClick={handleLogout}>
                {t('logout')} ({user?.name || user?.email})
              </a>
            </li>
          </ul>
        </nav>

        <div className="language-switcher">
          <span className="language-label">{t('language')}</span>
          <div className="language-buttons">
            <button
              className={`lang-btn ${language === 'pt' ? 'active' : ''}`}
              onClick={() => setLanguage('pt')}
              title="Português"
            >
              PT
            </button>
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              title="English"
            >
              EN
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

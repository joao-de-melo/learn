import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { getIcon } from '../components/IconDisplay';
import { useLanguage } from '../i18n';

export default function Dashboard() {
  const { t } = useLanguage();
  const [kids, setKids] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getKids(), api.getGames()])
      .then(([kidsData, gamesData]) => {
        setKids(kidsData);
        setGames(gamesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const AVATARS = {
    bear: '\uD83D\uDC3B',
    robot: '\uD83E\uDD16',
    star: '\u2B50',
    heart: '\u2764\uFE0F',
    flower: '\uD83C\uDF38',
  };

  const calculateAge = (birthYear) => {
    if (!birthYear) return null;
    return new Date().getFullYear() - parseInt(birthYear);
  };

  if (loading) {
    return (
      <Layout>
        <p>{t('loading')}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('dashboard')}</h1>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>{t('kids')}</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>
            {kids.length}
          </p>
          <Link to="/kids" className="btn btn-secondary" style={{ marginTop: '16px', display: 'inline-block' }}>
            {t('manageKids')}
          </Link>
        </div>

        <div className="card">
          <h3>{t('games')}</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>
            {games.length}
          </p>
          <Link to="/games" className="btn btn-secondary" style={{ marginTop: '16px', display: 'inline-block' }}>
            {t('manageGames')}
          </Link>
        </div>
      </div>

      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('recentKids')}</h2>
      {kids.length === 0 ? (
        <div className="card">
          <p>{t('noKidsYetDashboard')} <Link to="/kids">{t('addFirstKid')}</Link></p>
        </div>
      ) : (
        <div className="card-grid">
          {kids.slice(0, 3).map(kid => (
            <Link to={`/kids/${kid.id}`} className="card card-link" key={kid.id}>
              <div className="kid-card">
                <div className="kid-avatar">
                  {AVATARS[kid.avatar] || AVATARS.bear}
                </div>
                <div className="kid-info">
                  <h3>{kid.name}</h3>
                  <p>{kid.birthYear ? `${calculateAge(kid.birthYear)} ${t('yearsOld')}` : ''}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('recentGames')}</h2>
      {games.length === 0 ? (
        <div className="card">
          <p>{t('noGamesYetDashboard')} <Link to="/games">{t('createFirstGame')}</Link></p>
        </div>
      ) : (
        <div className="card-grid">
          {games.slice(0, 3).map(game => (
            <Link to={`/games/${game.id}`} className="card card-link" key={game.id}>
              <h3>{game.name}</h3>
              <p>{game.description || t('noDescription')}</p>
              <div className="card-meta">
                <span>{t('challengesCount', { count: game.challengeCount })}</span>
                <span>{t('assignmentsCount', { count: game.assignmentCount })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

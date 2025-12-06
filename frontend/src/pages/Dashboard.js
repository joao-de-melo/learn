import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { getIcon } from '../components/IconDisplay';

export default function Dashboard() {
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

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Kids</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>
            {kids.length}
          </p>
          <Link to="/kids" className="btn btn-secondary" style={{ marginTop: '16px', display: 'inline-block' }}>
            Manage Kids
          </Link>
        </div>

        <div className="card">
          <h3>Games</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>
            {games.length}
          </p>
          <Link to="/games" className="btn btn-secondary" style={{ marginTop: '16px', display: 'inline-block' }}>
            Manage Games
          </Link>
        </div>
      </div>

      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Recent Kids</h2>
      {kids.length === 0 ? (
        <div className="card">
          <p>No kids added yet. <Link to="/kids">Add your first kid</Link></p>
        </div>
      ) : (
        <div className="card-grid">
          {kids.slice(0, 3).map(kid => (
            <div className="card" key={kid.id}>
              <div className="kid-card">
                <div className="kid-avatar">
                  {AVATARS[kid.avatar] || AVATARS.bear}
                </div>
                <div className="kid-info">
                  <h3>{kid.name}</h3>
                  <p>{kid.age ? `${kid.age} years old` : 'Age not set'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Recent Games</h2>
      {games.length === 0 ? (
        <div className="card">
          <p>No games created yet. <Link to="/games">Create your first game</Link></p>
        </div>
      ) : (
        <div className="card-grid">
          {games.slice(0, 3).map(game => (
            <div className="card" key={game.id}>
              <h3>{game.name}</h3>
              <p>{game.description || 'No description'}</p>
              <div className="card-meta">
                <span>{game.level_count} levels</span>
                <span>{game.assignment_count} assignments</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useLanguage } from '../i18n';

export default function Games() {
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    api.getGames()
      .then(setGames)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('deleteGameConfirm'))) {
      await api.deleteGame(id);
      loadGames();
    }
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
        <h1>{t('games')}</h1>
        <Link to="/games/create" className="btn btn-primary">
          {t('createGame')}
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="card">
          <p>{t('noGamesYet')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('game')}</th>
                <th>{t('challenges')}</th>
                <th>{t('questions')}</th>
                <th>{t('assigned')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {games.map(game => (
                <tr key={game.id}>
                  <td>
                    <strong>{game.name}</strong>
                    {game.description && (
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        {game.description}
                      </div>
                    )}
                  </td>
                  <td>{game.challengeCount}</td>
                  <td>{game.totalQuestions}</td>
                  <td>
                    {game.assignmentCount > 0 ? (
                      <span className="badge success">{t('kidsCount', { count: game.assignmentCount })}</span>
                    ) : (
                      <span className="badge neutral">{t('none')}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/games/${game.id}`} className="btn btn-primary btn-sm">
                        {t('view')}
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(game.id)}>
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

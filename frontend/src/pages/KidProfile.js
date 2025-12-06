import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useLanguage } from '../i18n';

const AVATARS = {
  bear: '\uD83D\uDC3B',
  robot: '\uD83E\uDD16',
  star: '\u2B50',
  heart: '\u2764\uFE0F',
  flower: '\uD83C\uDF38',
  car: '\uD83D\uDE97',
};

export default function KidProfile() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, [id]);

  const loadMetrics = async () => {
    try {
      const metrics = await api.getKidMetrics(id);
      setData(metrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/kids')}>
          {t('backToKids')}
        </button>
      </Layout>
    );
  }

  const { kid, overallStats, challengeStats, assignments } = data;

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/kids')}>
            {t('back')}
          </button>
          <div className="kid-avatar" style={{ width: '64px', height: '64px', fontSize: '32px' }}>
            {AVATARS[kid.avatar] || AVATARS.bear}
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>{kid.name}</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {kid.birthYear ? `${calculateAge(kid.birthYear)} ${t('yearsOld')}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{overallStats.totalAttempts}</div>
          <div className="stat-label">{t('totalAttempts')}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{overallStats.successRate}%</div>
          <div className="stat-label">{t('successRate')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallStats.correctAttempts}</div>
          <div className="stat-label">{t('correctAnswers')}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{overallStats.totalChallengeRepeats}</div>
          <div className="stat-label">{t('challengeRepeats')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallStats.gamesAssigned}</div>
          <div className="stat-label">{t('gamesAssigned')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallStats.challengesAttempted}</div>
          <div className="stat-label">{t('challengesTried')}</div>
        </div>
      </div>

      {/* Challenge Performance */}
      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('challengePerformance')}</h2>
      {challengeStats.length === 0 ? (
        <div className="card">
          <p>{t('noChallengesAttempted')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('challenge')}</th>
                <th>{t('attempts')}</th>
                <th>{t('correct')}</th>
                <th>{t('successRate')}</th>
                <th>{t('repeats')}</th>
                <th>{t('lastPlayed')}</th>
              </tr>
            </thead>
            <tbody>
              {challengeStats.map(stat => {
                const successRate = stat.totalAttempts > 0
                  ? Math.round((stat.correctAttempts / stat.totalAttempts) * 100)
                  : 0;

                return (
                  <tr key={stat.challengeTypeId}>
                    <td>
                      <strong>{stat.name}</strong>
                    </td>
                    <td>{stat.totalAttempts}</td>
                    <td>{stat.correctAttempts}</td>
                    <td>
                      <div className="progress-bar-small">
                        <div
                          className={`progress-fill ${successRate >= 70 ? 'success' : successRate >= 40 ? 'warning' : 'danger'}`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                      <span className="progress-text">{successRate}%</span>
                    </td>
                    <td>
                      {stat.challengeRepeats > 0 && (
                        <span className="badge warning">{stat.challengeRepeats}</span>
                      )}
                      {stat.challengeRepeats === 0 && '-'}
                    </td>
                    <td>
                      {stat.lastAttemptAt
                        ? new Date(stat.lastAttemptAt).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assigned Games */}
      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>{t('assignedGames')}</h2>
      {assignments.length === 0 ? (
        <div className="card">
          <p>{t('noGamesAssigned')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('game')}</th>
                <th>{t('status')}</th>
                <th>{t('assignedDate')}</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td><strong>{assignment.gameName}</strong></td>
                  <td>
                    <span className={`badge ${assignment.isActive ? 'success' : 'neutral'}`}>
                      {assignment.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td>
                    {assignment.createdAt
                      ? new Date(assignment.createdAt).toLocaleDateString()
                      : '-'}
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

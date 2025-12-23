import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GameEditor from '../components/GameEditor';
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

export default function GameDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [gameData, kidsData] = await Promise.all([
        api.getGame(id),
        api.getKids(),
      ]);
      setGame(gameData);
      setKids(kidsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (kidId) => {
    try {
      await api.createAssignment(game.id, kidId);
      loadData();
      setShowAssignModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (window.confirm(t('removeAssignmentConfirm'))) {
      await api.deleteAssignment(assignmentId);
      loadData();
    }
  };

  const copyPlayLink = (token) => {
    const url = `${window.location.origin}/play/${token}`;
    navigator.clipboard.writeText(url);
    alert(t('playLinkCopied'));
  };

  const handleSaveEdit = async (gameData) => {
    await api.updateGame(id, gameData);
    await loadData();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <p>{t('loading')}</p>
      </Layout>
    );
  }

  if (error && !game) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/games')}>
          {t('backToGames')}
        </button>
      </Layout>
    );
  }

  // Edit mode - show full game editor
  if (isEditing) {
    return (
      <Layout>
        <div className="page-header">
          <h1>{t('editGame')}</h1>
        </div>

        <GameEditor
          initialData={game}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
          saveButtonText={t('saveChanges')}
        />
      </Layout>
    );
  }

  // View mode
  const totalQuestions = (game.challenges || []).reduce((sum, c) => sum + c.questionCount, 0);

  const filteredAssignments = game.assignments.filter(a => {
    if (statusFilter === 'active') return a.isActive;
    if (statusFilter === 'completed') return !a.isActive && a.completedAt;
    return true;
  });

  const activeCount = game.assignments.filter(a => a.isActive).length;
  const completedCount = game.assignments.filter(a => !a.isActive && a.completedAt).length;

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/games')}>
          {t('back')}
        </button>
        <h1>{game.name}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Game Info Card */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="game-info">
          <div className="game-info-header">
            <div className="game-info-main">
              {game.description && (
                <p className="game-description">{game.description}</p>
              )}
              <div className="game-settings">
                <span className="game-setting">
                  <strong>{t('gameLanguage')}:</strong> {game.language === 'en' ? t('english') : t('portuguese')}
                </span>
                <span className="game-setting">
                  <strong>{t('enableHelp')}:</strong> {game.helpEnabled ? t('yes') : t('no')}
                </span>
                {game.helpEnabled && (
                  <span className="game-setting">
                    <strong>{t('enableVoice')}:</strong> {game.voiceEnabled ? t('yes') : t('no')}
                  </span>
                )}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
              {t('editGame')}
            </button>
          </div>

          <div className="game-stats">
            <div className="game-stat">
              <span className="game-stat-value">{(game.challenges || []).length}</span>
              <span className="game-stat-label">{t('challenges')}</span>
            </div>
            <div className="game-stat">
              <span className="game-stat-value">{totalQuestions}</span>
              <span className="game-stat-label">{t('questions')}</span>
            </div>
            <div className="game-stat">
              <span className="game-stat-value">{game.assignments.length}</span>
              <span className="game-stat-label">{t('assignments')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Section */}
      <h2 style={{ marginBottom: '16px' }}>{t('challenges')}</h2>
      {(game.challenges || []).length === 0 ? (
        <div className="card" style={{ marginBottom: '32px' }}>
          <p>{t('noChallengesInGame')}</p>
        </div>
      ) : (
        <div className="table-container" style={{ marginBottom: '32px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>{t('challenge')}</th>
                <th>{t('category')}</th>
                <th>{t('questions')}</th>
              </tr>
            </thead>
            <tbody>
              {(game.challenges || []).map((challenge, index) => {
                const challengeKey = challenge.renderer || challenge.challengeTypeId;
                const categoryKey = challenge.categoryId;
                return (
                  <tr key={challenge.challengeTypeId}>
                    <td style={{ fontWeight: 'bold', color: '#6b7280' }}>{index + 1}</td>
                    <td>
                      <strong>{t(`challenge_${challengeKey}`) || challenge.name}</strong>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        {t(`challenge_${challengeKey}_desc`) || challenge.description}
                      </div>
                    </td>
                    <td>{t(`category_${categoryKey}`) || challenge.categoryName}</td>
                    <td>{challenge.questionCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignments Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>{t('assignments')}</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAssignModal(true)}>
          + {t('assignToKid')}
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: '16px' }}>
        <button
          className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          {t('active')}
          {activeCount > 0 && <span className="filter-tab-count">{activeCount}</span>}
        </button>
        <button
          className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          {t('completed')}
          {completedCount > 0 && <span className="filter-tab-count">{completedCount}</span>}
        </button>
        <button
          className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          {t('all')}
          <span className="filter-tab-count">{game.assignments.length}</span>
        </button>
      </div>

      {game.assignments.length === 0 ? (
        <div className="card">
          <p>{t('noAssignmentsYet')}</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card">
          <p>{statusFilter === 'active' ? t('noActiveAssignments') : t('noCompletedAssignments')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('kid')}</th>
                <th>{t('status')}</th>
                <th>{t('playLink')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>
                        {AVATARS[assignment.kidAvatar] || AVATARS.bear}
                      </span>
                      <div>
                        <strong>{assignment.kidName}</strong>
                        {assignment.completedAt && (
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {t('completedOn')} {new Date(assignment.completedAt._seconds ? assignment.completedAt._seconds * 1000 : assignment.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${assignment.isActive ? 'success' : 'completed'}`}>
                      {assignment.isActive ? t('active') : t('completed')}
                    </span>
                  </td>
                  <td>
                    <code style={{
                      background: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      /play/{assignment.playToken.substring(0, 8)}...
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {assignment.isActive && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => copyPlayLink(assignment.playToken)}
                          >
                            {t('copy')}
                          </button>
                          <a
                            href={`/play/${assignment.playToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                          >
                            {t('open')}
                          </a>
                        </>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{t('assignGameToKid')}</h2>

            {kids.length === 0 ? (
              <p style={{ color: '#6b7280' }}>{t('noKidsYet')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {kids.map(kid => (
                  <button
                    key={kid.id}
                    className="btn btn-secondary"
                    onClick={() => handleAssign(kid.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      justifyContent: 'flex-start',
                      padding: '12px 16px'
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>{AVATARS[kid.avatar] || AVATARS.bear}</span>
                    <span style={{ fontSize: '16px' }}>{kid.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LevelPreview from '../components/LevelPreview';
import api from '../services/api';

const AVATARS = {
  bear: '\uD83D\uDC3B',
  robot: '\uD83E\uDD16',
  star: '\u2B50',
  heart: '\u2764\uFE0F',
  flower: '\uD83C\uDF38',
  car: '\uD83D\uDE97',
};

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [previewLevelId, setPreviewLevelId] = useState(null);
  const [error, setError] = useState('');

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
    if (window.confirm('Remove this assignment?')) {
      await api.deleteAssignment(assignmentId);
      loadData();
    }
  };

  const copyPlayLink = (token) => {
    const url = `${window.location.origin}/play/${token}`;
    navigator.clipboard.writeText(url);
    alert('Play link copied to clipboard!');
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  if (error && !game) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/games')}>
          Back to Games
        </button>
      </Layout>
    );
  }

  const assignedKidIds = game.assignments.map(a => a.kid_id);
  const unassignedKids = kids.filter(k => !assignedKidIds.includes(k.id));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/games')}
            style={{ marginBottom: '8px' }}
          >
            Back to Games
          </button>
          <h1>{game.name}</h1>
          {game.description && <p style={{ color: '#6b7280' }}>{game.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
          Assign to Kid
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <h2 style={{ marginBottom: '20px' }}>Levels ({game.levels.length})</h2>
      {game.levels.length === 0 ? (
        <div className="card">
          <p>No levels added to this game.</p>
        </div>
      ) : (
        <div className="card-grid">
          {game.levels.map(level => (
            <div className="card" key={level.id}>
              <h3>{level.name}</h3>
              <p>{level.description}</p>
              <div className="card-meta">
                <span>{level.category_name}</span>
                <span>Ages {level.min_age}-{level.max_age}</span>
                <span>{level.challenge_count} challenges</span>
              </div>
              <div className="card-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setPreviewLevelId(level.id)}
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>
        Assignments ({game.assignments.length})
      </h2>
      {game.assignments.length === 0 ? (
        <div className="card">
          <p>No kids assigned yet. Click "Assign to Kid" to create a play link.</p>
        </div>
      ) : (
        <div className="card-grid">
          {game.assignments.map(assignment => (
            <div className="card" key={assignment.id}>
              <div className="assignment-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="kid-avatar" style={{ width: '48px', height: '48px', fontSize: '24px' }}>
                    {AVATARS[assignment.kid_avatar] || AVATARS.bear}
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>{assignment.kid_name}</h3>
                    <span
                      style={{
                        background: assignment.is_active ? '#dcfce7' : '#fee2e2',
                        color: assignment.is_active ? '#166534' : '#991b1b',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {assignment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="play-link" style={{ marginTop: '16px' }}>
                /play/{assignment.play_token.substring(0, 8)}...
              </div>
              <div className="card-actions" style={{ marginTop: '16px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => copyPlayLink(assignment.play_token)}
                >
                  Copy Link
                </button>
                <a
                  href={`/play/${assignment.play_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Open
                </a>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemoveAssignment(assignment.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Assign Game to Kid</h2>

            {unassignedKids.length === 0 ? (
              <p>All kids have already been assigned to this game.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {unassignedKids.map(kid => (
                  <button
                    key={kid.id}
                    className="btn btn-secondary"
                    onClick={() => handleAssign(kid.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start' }}
                  >
                    <span style={{ fontSize: '24px' }}>{AVATARS[kid.avatar] || AVATARS.bear}</span>
                    <span>{kid.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {previewLevelId && (
        <LevelPreview levelId={previewLevelId} onClose={() => setPreviewLevelId(null)} />
      )}
    </Layout>
  );
}

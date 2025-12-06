import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LevelPreview from '../components/LevelPreview';
import api from '../services/api';

export default function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [previewLevelId, setPreviewLevelId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadGames();
    api.getCategories().then(setCategories);
  }, []);

  const loadGames = () => {
    api.getGames()
      .then(setGames)
      .finally(() => setLoading(false));
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '' });
    setSelectedLevels([]);
    setError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const toggleLevel = (levelId) => {
    setSelectedLevels(prev =>
      prev.includes(levelId)
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedLevels.length === 0) {
      setError('Please select at least one level');
      return;
    }

    try {
      await api.createGame({
        name: formData.name,
        description: formData.description,
        level_ids: selectedLevels,
      });
      loadGames();
      closeCreateModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      await api.deleteGame(id);
      loadGames();
    }
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
        <h1>Games</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          Create Game
        </button>
      </div>

      {games.length === 0 ? (
        <div className="card">
          <p>No games created yet. Click "Create Game" to get started.</p>
        </div>
      ) : (
        <div className="card-grid">
          {games.map(game => (
            <div className="card" key={game.id}>
              <h3>{game.name}</h3>
              <p>{game.description || 'No description'}</p>
              <div className="card-meta">
                <span>{game.level_count} levels</span>
                <span>{game.assignment_count} assignments</span>
              </div>
              <div className="card-actions">
                <Link to={`/games/${game.id}`} className="btn btn-secondary">
                  View / Assign
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(game.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <h2>Create Game</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Game Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Math Fun for Emma"
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Numbers and counting practice"
                />
              </div>

              <div className="level-browser">
                <h3>Select Levels ({selectedLevels.length} selected)</h3>

                {categories.map(category => (
                  <div className="category-section" key={category.id}>
                    <h3>{category.name}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>{category.description}</p>

                    <div className="level-list">
                      {category.levels.map(level => (
                        <div
                          key={level.id}
                          className={`level-item ${selectedLevels.includes(level.id) ? 'selected' : ''}`}
                        >
                          <h4>{level.name}</h4>
                          <p>{level.description}</p>
                          <div className="level-meta">
                            <span>Ages {level.min_age}-{level.max_age}</span>
                            <span>{level.challenge_count} challenges</span>
                          </div>
                          <div className="level-actions">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setPreviewLevelId(level.id)}
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              className={`btn ${selectedLevels.includes(level.id) ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => toggleLevel(level.id)}
                            >
                              {selectedLevels.includes(level.id) ? 'Remove' : 'Add'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeCreateModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewLevelId && (
        <LevelPreview levelId={previewLevelId} onClose={() => setPreviewLevelId(null)} />
      )}
    </Layout>
  );
}

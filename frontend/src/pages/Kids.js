import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const AVATARS = {
  bear: '\uD83D\uDC3B',
  robot: '\uD83E\uDD16',
  star: '\u2B50',
  heart: '\u2764\uFE0F',
  flower: '\uD83C\uDF38',
  car: '\uD83D\uDE97',
};

export default function Kids() {
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKid, setEditingKid] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', avatar: 'bear' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadKids();
  }, []);

  const loadKids = () => {
    api.getKids()
      .then(setKids)
      .finally(() => setLoading(false));
  };

  const openModal = (kid = null) => {
    if (kid) {
      setEditingKid(kid);
      setFormData({ name: kid.name, age: kid.age || '', avatar: kid.avatar });
    } else {
      setEditingKid(null);
      setFormData({ name: '', age: '', avatar: 'bear' });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingKid(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingKid) {
        await api.updateKid(editingKid.id, {
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          avatar: formData.avatar,
        });
      } else {
        await api.createKid({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          avatar: formData.avatar,
        });
      }
      loadKids();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this kid?')) {
      await api.deleteKid(id);
      loadKids();
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
        <h1>Kids</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Add Kid
        </button>
      </div>

      {kids.length === 0 ? (
        <div className="card">
          <p>No kids added yet. Click "Add Kid" to get started.</p>
        </div>
      ) : (
        <div className="card-grid">
          {kids.map(kid => (
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
              <div className="card-actions" style={{ marginTop: '16px' }}>
                <button className="btn btn-secondary" onClick={() => openModal(kid)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(kid.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingKid ? 'Edit Kid' : 'Add Kid'}</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age (optional)</label>
                <input
                  type="number"
                  min="1"
                  max="18"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Avatar</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {Object.entries(AVATARS).map(([key, emoji]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: key })}
                      style={{
                        fontSize: '32px',
                        padding: '8px',
                        border: formData.avatar === key ? '3px solid #667eea' : '2px solid #e0e0e0',
                        borderRadius: '8px',
                        background: formData.avatar === key ? '#f0f4ff' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingKid ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

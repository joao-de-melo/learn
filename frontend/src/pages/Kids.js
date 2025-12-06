import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export default function Kids() {
  const { t } = useLanguage();
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKid, setEditingKid] = useState(null);
  const [formData, setFormData] = useState({ name: '', birthYear: '', avatar: 'bear' });
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
      setFormData({ name: kid.name, birthYear: kid.birthYear || '', avatar: kid.avatar });
    } else {
      setEditingKid(null);
      setFormData({ name: '', birthYear: '', avatar: 'bear' });
    }
    setError('');
    setShowModal(true);
  };

  const calculateAge = (birthYear) => {
    if (!birthYear) return null;
    return new Date().getFullYear() - parseInt(birthYear);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingKid(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const birthYear = formData.birthYear ? parseInt(formData.birthYear) : null;

      if (editingKid) {
        await api.updateKid(editingKid.id, {
          name: formData.name,
          birthYear,
          avatar: formData.avatar,
        });
      } else {
        await api.createKid({
          name: formData.name,
          birthYear,
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
    if (window.confirm(t('deleteKidConfirm'))) {
      await api.deleteKid(id);
      loadKids();
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
        <h1>{t('kids')}</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          {t('addKid')}
        </button>
      </div>

      {kids.length === 0 ? (
        <div className="card">
          <p>{t('noKidsYet')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('kid')}</th>
                <th>{t('age')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {kids.map(kid => (
                <tr key={kid.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="kid-avatar" style={{ width: '48px', height: '48px', fontSize: '24px' }}>
                        {AVATARS[kid.avatar] || AVATARS.bear}
                      </div>
                      <strong>{kid.name}</strong>
                    </div>
                  </td>
                  <td>
                    {kid.birthYear ? `${calculateAge(kid.birthYear)} ${t('yearsOld')}` : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/kids/${kid.id}`} className="btn btn-primary btn-sm">
                        {t('viewStats')}
                      </Link>
                      <button className="btn btn-secondary btn-sm" onClick={() => openModal(kid)}>
                        {t('edit')}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(kid.id)}>
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingKid ? t('editKid') : t('addKid')}</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('birthYearOptional')}</label>
                <input
                  type="number"
                  min="2005"
                  max={new Date().getFullYear()}
                  placeholder={`e.g. ${new Date().getFullYear() - 8}`}
                  value={formData.birthYear}
                  onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                />
                {formData.birthYear && (
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    {t('age')}: {calculateAge(formData.birthYear)} {t('yearsOld')}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>{t('avatar')}</label>
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
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingKid ? t('save') : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

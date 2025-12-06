import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ChallengePreview from '../components/ChallengePreview';
import { useLanguage } from '../i18n';
import api from '../services/api';

// Default configs and labels for each challenge type
// Labels use translation keys that will be resolved with t()
const CHALLENGE_CONFIGS = {
  counting: {
    defaults: { maxNumber: 5, questionCount: 5 },
    fields: [
      { key: 'maxNumber', labelKey: 'countUpTo', type: 'number', min: 1, max: 20 }
    ]
  },
  visual_addition: {
    defaults: { maxSum: 5, questionCount: 5 },
    fields: [
      { key: 'maxSum', labelKey: 'maximumSum', type: 'number', min: 2, max: 20 }
    ]
  },
  visual_subtraction: {
    defaults: { maxNumber: 5, questionCount: 5 },
    fields: [
      { key: 'maxNumber', labelKey: 'maximumNumber', type: 'number', min: 2, max: 20 }
    ]
  },
  number_to_quantity: {
    defaults: { maxNumber: 5, questionCount: 5 },
    fields: [
      { key: 'maxNumber', labelKey: 'maximumNumber', type: 'number', min: 1, max: 20 }
    ]
  },
  letter_recognition: {
    defaults: { letters: ['A', 'B', 'C', 'D', 'E'], questionCount: 5 },
    fields: [
      { key: 'letters', labelKey: 'lettersToPractice', type: 'letters' }
    ]
  },
  word_recognition: {
    defaults: { words: ['cat', 'dog', 'ball'], questionCount: 5 },
    fields: [
      { key: 'words', labelKey: 'wordsToPractice', type: 'text', placeholder: 'cat, dog, ball' }
    ]
  },
  pattern: {
    defaults: { patternTypes: ['colors'], questionCount: 5 },
    fields: [
      { key: 'patternTypes', labelKey: 'patternTypes', type: 'multiselect', options: ['colors', 'shapes', 'numbers'] }
    ]
  },
  odd_one_out: {
    defaults: { categories: ['fruits', 'animals'], questionCount: 5 },
    fields: [
      { key: 'categories', labelKey: 'categoriesField', type: 'multiselect', options: ['fruits', 'animals', 'shapes'] }
    ]
  },
  matching: {
    defaults: { pairCount: 4, questionCount: 5 },
    fields: [
      { key: 'pairCount', labelKey: 'numberOfPairs', type: 'number', min: 2, max: 8 }
    ]
  },
  memory_match: {
    defaults: { gridSize: 4, questionCount: 5 },
    fields: [
      { key: 'gridSize', labelKey: 'gridSize', type: 'select', options: [{ value: 4, label: '2x2' }, { value: 6, label: '2x3' }, { value: 8, label: '2x4' }] }
    ]
  },
  sequence_recall: {
    defaults: { maxLength: 4, questionCount: 5 },
    fields: [
      { key: 'maxLength', labelKey: 'maxSequenceLength', type: 'number', min: 2, max: 8 }
    ]
  }
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function CreateGame() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  // selectedChallenges: { [challengeTypeId]: { questionCount, ...config } }
  const [selectedChallenges, setSelectedChallenges] = useState({});
  const [previewChallengeId, setPreviewChallengeId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', language: 'pt', voiceEnabled: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLevelsByCategory()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const toggleChallenge = (challengeTypeId) => {
    setSelectedChallenges(prev => {
      if (prev[challengeTypeId]) {
        const { [challengeTypeId]: removed, ...rest } = prev;
        return rest;
      } else {
        const config = CHALLENGE_CONFIGS[challengeTypeId]?.defaults || { questionCount: 5 };
        return { ...prev, [challengeTypeId]: { ...config } };
      }
    });
  };

  const updateConfig = (challengeTypeId, key, value) => {
    setSelectedChallenges(prev => ({
      ...prev,
      [challengeTypeId]: { ...prev[challengeTypeId], [key]: value }
    }));
  };

  const getTotalQuestions = () => {
    return Object.values(selectedChallenges).reduce((sum, c) => sum + (c.questionCount || 0), 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const challengeIds = Object.keys(selectedChallenges);
    if (challengeIds.length === 0) {
      setError(t('selectAtLeastOneChallenge'));
      return;
    }

    try {
      const challenges = challengeIds.map(id => ({
        challengeTypeId: id,
        ...selectedChallenges[id]
      }));

      await api.createGame({
        name: formData.name,
        description: formData.description,
        language: formData.language,
        voiceEnabled: formData.voiceEnabled,
        challenges,
      });
      navigate('/games');
    } catch (err) {
      setError(err.message);
    }
  };

  const renderConfigField = (challengeTypeId, field, config) => {
    const value = config[field.key];
    const label = t(field.labelKey);

    switch (field.type) {
      case 'number':
        return (
          <div key={field.key} className="config-field">
            <label>{label}:</label>
            <div className="number-input">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => updateConfig(challengeTypeId, field.key, Math.max(field.min, (value || field.min) - 1))}
              >
                -
              </button>
              <span className="number-value">{value}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => updateConfig(challengeTypeId, field.key, Math.min(field.max, (value || field.min) + 1))}
              >
                +
              </button>
            </div>
          </div>
        );

      case 'letters':
        return (
          <div key={field.key} className="config-field">
            <label>{label}:</label>
            <div className="letter-grid">
              {ALPHABET.map(letter => (
                <button
                  key={letter}
                  type="button"
                  className={`letter-btn ${(value || []).includes(letter) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = value || [];
                    const updated = current.includes(letter)
                      ? current.filter(l => l !== letter)
                      : [...current, letter].sort();
                    updateConfig(challengeTypeId, field.key, updated);
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.key} className="config-field">
            <label>{label}:</label>
            <div className="option-buttons">
              {field.options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`btn btn-sm ${(value || []).includes(opt) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const current = value || [];
                    const updated = current.includes(opt)
                      ? current.filter(o => o !== opt)
                      : [...current, opt];
                    updateConfig(challengeTypeId, field.key, updated);
                  }}
                >
                  {t(opt)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="config-field">
            <label>{label}:</label>
            <div className="option-buttons">
              {field.options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`btn btn-sm ${value === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => updateConfig(challengeTypeId, field.key, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={field.key} className="config-field">
            <label>{label}:</label>
            <input
              type="text"
              value={Array.isArray(value) ? value.join(', ') : value || ''}
              placeholder={field.placeholder}
              onChange={(e) => {
                const words = e.target.value.split(',').map(w => w.trim()).filter(Boolean);
                updateConfig(challengeTypeId, field.key, words);
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>{t('loading')}</p>
      </Layout>
    );
  }

  const selectedCount = Object.keys(selectedChallenges).length;

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('createGame')}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleCreate}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label>{t('gameName')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Math Fun for Emma"
            />
          </div>

          <div className="form-group">
            <label>{t('gameDescription')}</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Numbers and counting practice"
            />
          </div>

          <div className="form-group">
            <label>{t('gameLanguage')}</label>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
              {t('gameLanguageHelp')}
            </p>
            <div className="language-buttons" style={{ justifyContent: 'flex-start' }}>
              <button
                type="button"
                className={`lang-btn ${formData.language === 'pt' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, language: 'pt' })}
                style={{ flex: 'none', padding: '12px 24px' }}
              >
                {t('portuguese')}
              </button>
              <button
                type="button"
                className={`lang-btn ${formData.language === 'en' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, language: 'en' })}
                style={{ flex: 'none', padding: '12px 24px' }}
              >
                {t('english')}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.voiceEnabled}
                onChange={(e) => setFormData({ ...formData, voiceEnabled: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>{t('enableVoice')}</span>
            </label>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
              {t('enableVoiceHelp')}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="level-browser">
            <h3>{t('selectChallengesTitle', { count: selectedCount, total: getTotalQuestions() })}</h3>

            {categories.map(category => (
              <div className="category-section" key={category.id}>
                <h3>{t(`category_${category.id}`) || category.name}</h3>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>{t(`category_${category.id}_desc`) || category.description}</p>

                <div className="level-list">
                  {(category.challengeTypes || []).map(challengeType => {
                    // Use the renderer as the key since it matches our translation keys
                    const challengeKey = challengeType.renderer || challengeType.id;
                    const isSelected = !!selectedChallenges[challengeType.id];
                    const config = selectedChallenges[challengeType.id] || {};
                    const configDef = CHALLENGE_CONFIGS[challengeKey];

                    return (
                      <div
                        key={challengeType.id}
                        className={`level-item ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="challenge-header">
                          <div>
                            <h4>{t(`challenge_${challengeKey}`) || challengeType.name}</h4>
                            <p>{t(`challenge_${challengeKey}_desc`) || challengeType.description}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setPreviewChallengeId(challengeType.id)}
                            >
                              {t('preview')}
                            </button>
                            <button
                              type="button"
                              className={`btn ${isSelected ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => toggleChallenge(challengeType.id)}
                            >
                              {isSelected ? t('remove') : t('add')}
                            </button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="challenge-config">
                            {/* Question count */}
                            <div className="config-field">
                              <label>{t('numberOfQuestions')}</label>
                              <div className="number-input">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => updateConfig(challengeType.id, 'questionCount', Math.max(1, (config.questionCount || 5) - 1))}
                                >
                                  -
                                </button>
                                <span className="number-value">{config.questionCount || 5}</span>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => updateConfig(challengeType.id, 'questionCount', Math.min(20, (config.questionCount || 5) + 1))}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Challenge-specific config */}
                            {configDef?.fields.map(field => renderConfigField(challengeType.id, field, config))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/games')}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary">
            {t('createGame')}
          </button>
        </div>
      </form>

      {previewChallengeId && (
        <ChallengePreview
          challengeTypeId={previewChallengeId}
          categories={categories}
          onClose={() => setPreviewChallengeId(null)}
        />
      )}
    </Layout>
  );
}

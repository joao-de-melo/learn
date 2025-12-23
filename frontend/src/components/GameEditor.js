import React, { useState, useEffect } from 'react';
import ChallengePreview from './ChallengePreview';
import { useLanguage } from '../i18n';
import api from '../services/api';

// Default configs and labels for each challenge type
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
    defaults: { categories: ['fruits', 'animals'], questionCount: 5, showLabels: false },
    fields: [
      { key: 'categories', labelKey: 'categoriesField', type: 'multiselect', options: ['fruits', 'animals', 'shapes'] },
      { key: 'showLabels', labelKey: 'showLabels', type: 'checkbox' }
    ]
  },
  voice_to_quantity: {
    defaults: { maxNumber: 5, questionCount: 5 },
    fields: [
      { key: 'maxNumber', labelKey: 'maximumNumber', type: 'number', min: 1, max: 20 }
    ]
  },
  voice_to_number: {
    defaults: { maxNumber: 10, questionCount: 5 },
    fields: [
      { key: 'maxNumber', labelKey: 'maximumNumber', type: 'number', min: 1, max: 100 }
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
  },
  icon_search: {
    defaults: { gridSize: 36, targetCount: 2, symbolSet: 'colorful', questionCount: 5 },
    fields: [
      { key: 'symbolSet', labelKey: 'symbolSet', type: 'select', options: [
        { value: 'colorful', labelKey: 'symbolSetColorful' },
        { value: 'arrows', labelKey: 'symbolSetArrows' },
        { value: 'circles', labelKey: 'symbolSetCircles' },
        { value: 'letters', labelKey: 'symbolSetLetters' },
        { value: 'shapes', labelKey: 'symbolSetShapes' },
        { value: 'math', labelKey: 'symbolSetMath' }
      ]},
      { key: 'gridSize', labelKey: 'gridSize', type: 'select', options: [
        { value: 25, label: '5x5' },
        { value: 36, label: '6x6' },
        { value: 49, label: '7x7' },
        { value: 64, label: '8x8' },
        { value: 81, label: '9x9' },
        { value: 100, label: '10x10' }
      ]},
      { key: 'targetCount', labelKey: 'targetCount', type: 'number', min: 1, max: 3 }
    ]
  }
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GameEditor({
  initialData = null,
  onSave,
  onCancel,
  saveButtonText,
  title
}) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  // selectedChallenges is now an ARRAY to preserve order: [{ challengeTypeId, ...config }]
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [previewChallengeId, setPreviewChallengeId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'pt',
    helpEnabled: false,
    voiceEnabled: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    api.getLevelsByCategory()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  // Initialize from initial data (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        language: initialData.language || 'pt',
        helpEnabled: initialData.helpEnabled || false,
        voiceEnabled: initialData.voiceEnabled || false
      });
      // Convert challenges to array format
      if (initialData.challenges) {
        setSelectedChallenges(initialData.challenges.map(c => ({
          challengeTypeId: c.challengeTypeId,
          questionCount: c.questionCount || 5,
          ...c
        })));
      }
    }
  }, [initialData]);

  const isSelected = (challengeTypeId) => {
    return selectedChallenges.some(c => c.challengeTypeId === challengeTypeId);
  };

  const getConfig = (challengeTypeId) => {
    return selectedChallenges.find(c => c.challengeTypeId === challengeTypeId) || {};
  };

  const toggleChallenge = (challengeTypeId, renderer) => {
    if (isSelected(challengeTypeId)) {
      setSelectedChallenges(prev => prev.filter(c => c.challengeTypeId !== challengeTypeId));
    } else {
      const configDef = CHALLENGE_CONFIGS[renderer];
      const defaults = configDef?.defaults || { questionCount: 5 };
      setSelectedChallenges(prev => [...prev, { challengeTypeId, ...defaults }]);
    }
  };

  const updateConfig = (challengeTypeId, key, value) => {
    setSelectedChallenges(prev => prev.map(c =>
      c.challengeTypeId === challengeTypeId
        ? { ...c, [key]: value }
        : c
    ));
  };

  const moveChallenge = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= selectedChallenges.length) return;
    setSelectedChallenges(prev => {
      const newList = [...prev];
      const [moved] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, moved);
      return newList;
    });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveChallenge(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getTotalQuestions = () => {
    return selectedChallenges.reduce((sum, c) => sum + (c.questionCount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError(t('gameNameRequired'));
      return;
    }

    if (selectedChallenges.length === 0) {
      setError(t('selectAtLeastOneChallenge'));
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        language: formData.language,
        helpEnabled: formData.helpEnabled,
        voiceEnabled: formData.helpEnabled && formData.voiceEnabled,
        challenges: selectedChallenges,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
                  {opt.labelKey ? t(opt.labelKey) : opt.label}
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

      case 'checkbox':
        return (
          <div key={field.key} className="config-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => updateConfig(challengeTypeId, field.key, e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>{label}</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Get challenge name from categories or translation
  const getChallengeName = (challengeTypeId) => {
    for (const cat of categories) {
      const ct = (cat.challengeTypes || []).find(c => c.id === challengeTypeId);
      if (ct) {
        const challengeKey = ct.renderer || ct.id;
        return t(`challenge_${challengeKey}`) || ct.name;
      }
    }
    return challengeTypeId;
  };

  if (loading) {
    return <p>{t('loading')}</p>;
  }

  const selectedCount = selectedChallenges.length;

  return (
    <>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Game Settings Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label>{t('gameName')} *</label>
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
                checked={formData.helpEnabled}
                onChange={(e) => setFormData({ ...formData, helpEnabled: e.target.checked, voiceEnabled: e.target.checked ? formData.voiceEnabled : false })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>{t('enableHelp')}</span>
            </label>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
              {t('enableHelpDescription')}
            </p>
          </div>

          {formData.helpEnabled && (
            <div className="form-group" style={{ marginLeft: '32px' }}>
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
          )}
        </div>

        {/* Selected Challenges - Reorderable List */}
        {selectedChallenges.length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>{t('selectedChallenges')} ({selectedCount})</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              {t('dragToReorder')}
            </p>
            <div className="selected-challenges-list">
              {selectedChallenges.map((challenge, index) => {
                // Find challenge info from categories
                let challengeInfo = null;
                let categoryInfo = null;
                for (const cat of categories) {
                  const ct = (cat.challengeTypes || []).find(c => c.id === challenge.challengeTypeId);
                  if (ct) {
                    challengeInfo = ct;
                    categoryInfo = cat;
                    break;
                  }
                }
                const challengeKey = challengeInfo?.renderer || challenge.challengeTypeId;
                const configDef = CHALLENGE_CONFIGS[challengeKey];

                return (
                  <div
                    key={challenge.challengeTypeId}
                    className={`selected-challenge-item ${draggedIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="challenge-order-controls">
                      <span className="drag-handle">⋮⋮</span>
                      <span className="challenge-number">{index + 1}</span>
                      <div className="order-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => moveChallenge(index, index - 1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => moveChallenge(index, index + 1)}
                          disabled={index === selectedChallenges.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                    </div>

                    <div className="challenge-content">
                      <div className="challenge-header">
                        <div>
                          <h4>{t(`challenge_${challengeKey}`) || challengeInfo?.name || challenge.challengeTypeId}</h4>
                          <p>{t(`challenge_${challengeKey}_desc`) || challengeInfo?.description}</p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => toggleChallenge(challenge.challengeTypeId, challengeKey)}
                        >
                          {t('remove')}
                        </button>
                      </div>

                      <div className="challenge-config">
                        {/* Question count */}
                        <div className="config-field">
                          <label>{t('numberOfQuestions')}</label>
                          <div className="number-input">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => updateConfig(challenge.challengeTypeId, 'questionCount', Math.max(1, (challenge.questionCount || 5) - 1))}
                            >
                              -
                            </button>
                            <span className="number-value">{challenge.questionCount || 5}</span>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => updateConfig(challenge.challengeTypeId, 'questionCount', Math.min(20, (challenge.questionCount || 5) + 1))}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Challenge-specific config */}
                        {configDef?.fields.map(field => renderConfigField(challenge.challengeTypeId, field, challenge))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
              <strong>{t('total')}: {getTotalQuestions()} {t('questions')}</strong>
            </div>
          </div>
        )}

        {/* Available Challenges */}
        <div className="card">
          <div className="level-browser">
            <h3>{t('availableChallenges')}</h3>

            {categories.map(category => (
              <div className="category-section" key={category.id}>
                <h3>{t(`category_${category.id}`) || category.name}</h3>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>{t(`category_${category.id}_desc`) || category.description}</p>

                <div className="level-list">
                  {(category.challengeTypes || []).map(challengeType => {
                    const challengeKey = challengeType.renderer || challengeType.id;
                    const selected = isSelected(challengeType.id);

                    return (
                      <div
                        key={challengeType.id}
                        className={`level-item ${selected ? 'selected' : ''}`}
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
                              className={`btn ${selected ? 'btn-secondary' : 'btn-success'}`}
                              onClick={() => toggleChallenge(challengeType.id, challengeKey)}
                              disabled={selected}
                            >
                              {selected ? t('added') : t('add')}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t('saving') : saveButtonText}
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
    </>
  );
}

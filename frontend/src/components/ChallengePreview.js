import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChallengeRenderer, { generatePreviewQuestions } from '../challenges';

export default function ChallengePreview({ challengeTypeId, categories, onClose }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Find challenge type info from categories
    let challengeType = null;
    let category = null;
    for (const cat of categories) {
      const ct = (cat.challengeTypes || []).find(c => c.id === challengeTypeId);
      if (ct) {
        challengeType = ct;
        category = cat;
        break;
      }
    }

    if (!challengeType) {
      setError('Challenge type not found');
      setLoading(false);
      return;
    }

    // Get sample questions from the first level (if available)
    const levels = challengeType.levels || [];

    if (levels.length > 0) {
      // Fetch preview from first level
      api.getLevelPreview(levels[0].id)
        .then(levelPreview => {
          setPreview({
            name: challengeType.name,
            description: challengeType.description,
            categoryName: category.name,
            levelCount: levels.length,
            totalQuestions: levels.reduce((sum, l) => sum + (l.questions || []).length, 0),
            previewQuestions: levelPreview.previewQuestions || []
          });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      // No levels available - use client-side preview generator
      const previewQuestions = generatePreviewQuestions(challengeTypeId);
      if (previewQuestions.length === 0) {
        setError('Preview not available for this challenge');
        setLoading(false);
        return;
      }

      setPreview({
        name: challengeType.name,
        description: challengeType.description,
        categoryName: category.name,
        levelCount: 0,
        totalQuestions: 0,
        previewQuestions
      });
      setLoading(false);
    }
  }, [challengeTypeId, categories]);

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal modal-large" onClick={e => e.stopPropagation()}>
          <p>Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="error-message">{error}</div>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <h2>{preview.name}</h2>
        <p style={{ color: '#6b7280', marginBottom: '8px' }}>{preview.description}</p>
        <div className="level-meta" style={{ marginBottom: '20px' }}>
          <span>{preview.categoryName}</span>
          {preview.levelCount > 0 && (
            <>
              <span>|</span>
              <span>{preview.levelCount} difficulty levels</span>
              <span>|</span>
              <span>{preview.totalQuestions} questions available</span>
            </>
          )}
        </div>

        <div className="preview-container">
          <h3 style={{ marginBottom: '16px' }}>Sample Questions</h3>
          {(preview.previewQuestions || []).map((question, i) => (
            <div key={i} className="preview-challenge">
              <ChallengeRenderer
                challenge={question}
                onAnswer={() => Promise.resolve({ isCorrect: true })}
                isPreview={true}
              />
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

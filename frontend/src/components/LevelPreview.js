import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChallengeRenderer from '../challenges';

export default function LevelPreview({ levelId, onClose }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLevelPreview(levelId)
      .then(setPreview)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [levelId]);

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
          <span>Ages {preview.minAge}-{preview.maxAge}</span>
          <span>|</span>
          <span>{preview.totalQuestions} questions</span>
          <span>|</span>
          <span>{preview.categoryName}</span>
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
          {preview.totalQuestions > 3 && (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px' }}>
              ...and {preview.totalQuestions - 3} more questions
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { usePlayLanguage } from '../i18n';

// Base wrapper for all challenge types
// Handles common logic: answer submission, feedback display, auto-advance

export default function BaseChallenge({
  challenge,
  onAnswer,
  onComplete,
  isPreview = false,
  language = 'pt',
  children
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t } = usePlayLanguage(language);

  const handleSelect = async (answer) => {
    if (result || submitting || isPreview) return;

    setSelectedAnswer(answer);
    setSubmitting(true);

    try {
      const response = await onAnswer(answer);
      setResult(response);

      // Auto-advance after showing feedback
      setTimeout(() => {
        if (onComplete) {
          onComplete(response.isCorrect);
        }
      }, response.isCorrect ? 1000 : 1500);
    } finally {
      setSubmitting(false);
    }
  };

  // Pass down these props to the challenge renderer
  const challengeProps = {
    challenge,
    selectedAnswer,
    result,
    isPreview,
    isDisabled: result !== null || submitting || isPreview,
    onSelect: handleSelect,
    correctAnswer: challenge.answerData?.correct,
    t,
    language,
  };

  return (
    <div className={`challenge-display ${result ? (result.isCorrect ? 'result-correct' : 'result-incorrect') : ''}`}>
      {typeof children === 'function' ? children(challengeProps) : children}

      {result && !isPreview && (
        <div className={`feedback-overlay ${result.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            {result.isCorrect ? (
              <>
                <span className="feedback-icon">⭐</span>
                <span className="feedback-text">{t('greatJob')}</span>
              </>
            ) : (
              <>
                <span className="feedback-icon">❌</span>
                <span className="feedback-text">{t('wrong')}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for option buttons
export function OptionButton({
  value,
  isSelected,
  isCorrect,
  showResult,
  isDisabled,
  onClick,
  children,
  className = ''
}) {
  let stateClass = '';
  if (showResult) {
    if (isCorrect) {
      stateClass = 'correct';
    } else if (isSelected) {
      stateClass = 'incorrect';
    }
  }

  return (
    <button
      className={`answer-btn ${stateClass} ${className}`}
      onClick={() => onClick(value)}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}

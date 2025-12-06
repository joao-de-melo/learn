import React, { useState } from 'react';

// Base wrapper for all challenge types
// Handles common logic: answer submission, feedback display, disabled state

export default function BaseChallenge({
  challenge,
  onAnswer,
  isPreview = false,
  children
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (answer) => {
    if (result || submitting || isPreview) return;

    setSelectedAnswer(answer);
    setSubmitting(true);

    try {
      const response = await onAnswer(answer);
      setResult(response);
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
    correctAnswer: challenge.answer_data.correct,
  };

  return (
    <div className="challenge-display">
      {typeof children === 'function' ? children(challengeProps) : children}

      {result && !isPreview && (
        <div className={`feedback ${result.is_correct ? 'correct' : 'incorrect'}`}>
          {result.is_correct ? 'Correct! Great job!' : 'Not quite. Try again next time!'}
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

import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { getIcon } from '../../components/IconDisplay';

export const challengeType = 'pattern';

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const samples = [
    { pattern: ['star', 'heart', 'star', 'heart'], correct: 'star', options: ['star', 'heart', 'sun', 'moon'] },
    { pattern: ['apple', 'apple', 'banana', 'apple', 'apple'], correct: 'banana', options: ['apple', 'banana', 'cherry', 'grape'] },
  ];

  return samples.map(({ pattern, correct, options }) => ({
    question_type: challengeType,
    questionData: { pattern },
    answerData: { correct, options },
  }));
}

function PatternRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  return (
    <>
      <h2>{t('whatComesNext')}</h2>

      <div className="visual-display">
        {questionData.pattern.map((item, i) => (
          <span key={i} style={{ fontSize: '48px' }}>{getIcon(item)}</span>
        ))}
        <span style={{ fontSize: '48px', marginLeft: '16px' }}>?</span>
      </div>

      <div className="answer-options">
        {answerData.options.map((opt, i) => (
          <OptionButton
            key={i}
            value={opt}
            isSelected={selectedAnswer === opt}
            isCorrect={opt === correctAnswer}
            showResult={result !== null || isPreview}
            isDisabled={isDisabled}
            onClick={onSelect}
          >
            <span style={{ fontSize: '32px' }}>{getIcon(opt)}</span>
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function PatternChallenge({
  challenge,
  onAnswer,
  onComplete,
  isPreview,
  language,
  voiceEnabled = false,
  showHelpOnStart = false,
  challengeName
}) {
  return (
    <BaseChallenge
      challenge={challenge}
      onAnswer={onAnswer}
      onComplete={onComplete}
      isPreview={isPreview}
      language={language}
      voiceEnabled={voiceEnabled}
      showHelpOnStart={showHelpOnStart}
      challengeTypeId={challengeType}
      challengeName={challengeName}
    >
      {(props) => <PatternRenderer {...props} />}
    </BaseChallenge>
  );
}

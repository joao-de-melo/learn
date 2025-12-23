import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { getIcon } from '../../components/IconDisplay';

export const challengeType = 'odd_one_out';

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const samples = [
    { items: ['apple', 'apple', 'banana', 'apple'], correct: 2 },
    { items: ['star', 'star', 'star', 'heart'], correct: 3 },
  ];

  return samples.map(({ items, correct }) => ({
    question_type: challengeType,
    questionData: { items },
    answerData: { correct },
  }));
}

function getLabelFontSize(word) {
  const len = word.length;
  if (len <= 4) return '16px';
  if (len <= 6) return '14px';
  if (len <= 8) return '12px';
  return '10px';
}

function OddOneOutRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData } = challenge;
  const showLabels = questionData.showLabels || false;

  return (
    <>
      <h2>{t('whichOneIsDifferent')}</h2>

      <div className="answer-options" style={{ marginTop: '30px' }}>
        {questionData.items.map((item, i) => (
          <OptionButton
            key={i}
            value={i}
            isSelected={selectedAnswer === i}
            isCorrect={i === correctAnswer}
            showResult={result !== null || isPreview}
            isDisabled={isDisabled}
            onClick={onSelect}
            className="visual"
          >
            <span style={{ fontSize: '48px' }}>{getIcon(item)}</span>
            {showLabels && (
              <span style={{
                display: 'block',
                fontSize: getLabelFontSize(item),
                marginTop: '4px',
                textTransform: 'capitalize'
              }}>
                {t(`item_${item}`) || item}
              </span>
            )}
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function OddOneOutChallenge({
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
      {(props) => <OddOneOutRenderer {...props} />}
    </BaseChallenge>
  );
}

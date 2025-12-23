import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';

export const challengeType = 'matching';

// Matching pairs: show one item, select its match
const MATCH_PAIRS = {
  // Animals and their sounds/homes
  animals: [
    { item: '🐶', match: '🦴', label: 'dog-bone' },
    { item: '🐱', match: '🐟', label: 'cat-fish' },
    { item: '🐰', match: '🥕', label: 'rabbit-carrot' },
    { item: '🐦', match: '🪺', label: 'bird-nest' },
    { item: '🐻', match: '🍯', label: 'bear-honey' },
    { item: '🐭', match: '🧀', label: 'mouse-cheese' },
  ],
  // Colors - match same colors
  colors: [
    { item: '🔴', match: '❤️', label: 'red' },
    { item: '🟡', match: '⭐', label: 'yellow' },
    { item: '🟢', match: '🌲', label: 'green' },
    { item: '🔵', match: '💎', label: 'blue' },
    { item: '🟠', match: '🍊', label: 'orange' },
    { item: '🟣', match: '🍇', label: 'purple' },
  ],
  // Opposites
  opposites: [
    { item: '☀️', match: '🌙', label: 'sun-moon' },
    { item: '🔥', match: '❄️', label: 'hot-cold' },
    { item: '⬆️', match: '⬇️', label: 'up-down' },
    { item: '😊', match: '😢', label: 'happy-sad' },
    { item: '🌞', match: '🌧️', label: 'sunny-rainy' },
  ],
};

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const samples = [
    { item: '🐶', correct: '🦴', options: ['🦴', '🥕', '🧀', '🍯'] },
    { item: '🔴', correct: '❤️', options: ['💎', '❤️', '⭐', '🌲'] },
  ];

  return samples.map(({ item, correct, options }) => ({
    question_type: challengeType,
    questionData: { item },
    answerData: { correct, options },
  }));
}

function MatchingRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  return (
    <>
      <h2>{t('findTheMatch')}</h2>

      <div className="visual-display">
        <span style={{ fontSize: '100px' }}>
          {questionData.item}
        </span>
      </div>

      <div className="answer-options image-options">
        {answerData.options.map((opt, i) => (
          <OptionButton
            key={i}
            value={opt}
            isSelected={selectedAnswer === opt}
            isCorrect={opt === correctAnswer}
            showResult={result !== null || isPreview}
            isDisabled={isDisabled}
            onClick={onSelect}
            className="image-option"
          >
            <span style={{ fontSize: '64px' }}>{opt}</span>
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function MatchingChallenge({
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
      {(props) => <MatchingRenderer {...props} />}
    </BaseChallenge>
  );
}

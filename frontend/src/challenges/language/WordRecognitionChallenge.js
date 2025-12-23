import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';

export const challengeType = 'word_recognition';

// Word-to-emoji mappings for visual recognition
const WORD_IMAGES = {
  // Animals
  cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐟', bear: '🐻',
  rabbit: '🐰', mouse: '🐭', cow: '🐄', pig: '🐷', horse: '🐴',
  // Food
  apple: '🍎', banana: '🍌', orange: '🍊', grape: '🍇', strawberry: '🍓',
  bread: '🍞', cheese: '🧀', egg: '🥚', milk: '🥛', cake: '🎂',
  // Objects
  ball: '⚽', car: '🚗', house: '🏠', book: '📖', star: '⭐',
  sun: '☀️', moon: '🌙', tree: '🌳', flower: '🌸', heart: '❤️',
};

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const samples = [
    { word: 'cat', correct: 'cat', options: ['cat', 'dog', 'bird', 'fish'] },
    { word: 'apple', correct: 'apple', options: ['banana', 'apple', 'orange', 'grape'] },
  ];

  return samples.map(({ word, correct, options }) => ({
    question_type: challengeType,
    questionData: { word },
    answerData: { correct, options },
  }));
}

function WordRecognitionRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  return (
    <>
      <h2>{t('findTheWord')}</h2>

      <div className="visual-display">
        <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#4F46E5', textTransform: 'uppercase' }}>
          {questionData.word}
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
            <span style={{ fontSize: '64px' }}>{WORD_IMAGES[opt] || '❓'}</span>
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function WordRecognitionChallenge({
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
      {(props) => <WordRecognitionRenderer {...props} />}
    </BaseChallenge>
  );
}

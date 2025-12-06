import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';

export const challengeType = 'letter_recognition';

function LetterRecognitionRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview }) {
  const { question_data, answer_data } = challenge;

  return (
    <>
      <h2>{question_data.text}</h2>

      <div className="visual-display">
        <span style={{ fontSize: '120px', fontWeight: 'bold', color: '#4F46E5' }}>
          {question_data.target}
        </span>
      </div>

      <div className="answer-options">
        {answer_data.options.map((opt, i) => (
          <OptionButton
            key={i}
            value={opt}
            isSelected={selectedAnswer === opt}
            isCorrect={opt === correctAnswer}
            showResult={result !== null || isPreview}
            isDisabled={isDisabled}
            onClick={onSelect}
          >
            {opt}
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function LetterRecognitionChallenge({ challenge, onAnswer, isPreview }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} isPreview={isPreview}>
      {(props) => <LetterRecognitionRenderer {...props} />}
    </BaseChallenge>
  );
}

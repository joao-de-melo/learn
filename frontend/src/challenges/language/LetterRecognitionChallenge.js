import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';

export const challengeType = 'letter_recognition';

function LetterRecognitionRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  return (
    <>
      <h2>{t('findTheLetter', { letter: questionData.target })}</h2>

      <div className="visual-display">
        <span style={{ fontSize: '120px', fontWeight: 'bold', color: '#4F46E5' }}>
          {questionData.target}
        </span>
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
            {opt}
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function LetterRecognitionChallenge({ challenge, onAnswer, onComplete, isPreview, language }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} onComplete={onComplete} isPreview={isPreview} language={language}>
      {(props) => <LetterRecognitionRenderer {...props} />}
    </BaseChallenge>
  );
}

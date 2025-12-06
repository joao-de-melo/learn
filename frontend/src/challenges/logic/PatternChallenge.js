import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { getIcon } from '../../components/IconDisplay';

export const challengeType = 'pattern';

function PatternRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview }) {
  const { question_data, answer_data } = challenge;

  return (
    <>
      <h2>{question_data.text}</h2>

      <div className="visual-display">
        {question_data.pattern.map((item, i) => (
          <span key={i} style={{ fontSize: '48px' }}>{getIcon(item)}</span>
        ))}
        <span style={{ fontSize: '48px', marginLeft: '16px' }}>?</span>
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
            <span style={{ fontSize: '32px' }}>{getIcon(opt)}</span>
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function PatternChallenge({ challenge, onAnswer, isPreview }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} isPreview={isPreview}>
      {(props) => <PatternRenderer {...props} />}
    </BaseChallenge>
  );
}

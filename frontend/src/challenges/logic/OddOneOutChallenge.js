import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { getIcon } from '../../components/IconDisplay';

export const challengeType = 'odd_one_out';

function OddOneOutRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview }) {
  const { question_data } = challenge;

  return (
    <>
      <h2>{question_data.text}</h2>

      <div className="answer-options" style={{ marginTop: '30px' }}>
        {question_data.items.map((item, i) => (
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
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function OddOneOutChallenge({ challenge, onAnswer, isPreview }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} isPreview={isPreview}>
      {(props) => <OddOneOutRenderer {...props} />}
    </BaseChallenge>
  );
}

import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay } from '../../components/IconDisplay';

export const challengeType = 'counting';

function CountingRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview }) {
  const { question_data, answer_data } = challenge;

  return (
    <>
      <h2>{question_data.text}</h2>

      <div className="visual-display">
        <IconDisplay icons={question_data.icons} size="large" />
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

export default function CountingChallenge({ challenge, onAnswer, isPreview }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} isPreview={isPreview}>
      {(props) => <CountingRenderer {...props} />}
    </BaseChallenge>
  );
}

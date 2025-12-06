import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay } from '../../components/IconDisplay';

export const challengeType = 'visual_addition';

function VisualAdditionRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview }) {
  const { question_data, answer_data } = challenge;

  return (
    <>
      <h2>{question_data.text}</h2>

      <div className="visual-display">
        <div className="visual-group">
          <IconDisplay icons={question_data.left} size="large" />
        </div>
        <span className="operator">+</span>
        <div className="visual-group">
          <IconDisplay icons={question_data.right} size="large" />
        </div>
        <span className="operator">=</span>
        <span className="operator">?</span>
      </div>

      <div className="answer-options">
        {answer_data.options.map((opt, i) => (
          <OptionButton
            key={i}
            value={opt.value}
            isSelected={selectedAnswer === opt.value}
            isCorrect={opt.value === correctAnswer}
            showResult={result !== null || isPreview}
            isDisabled={isDisabled}
            onClick={onSelect}
            className="visual"
          >
            <IconDisplay icons={opt.icons} size="normal" />
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function VisualAdditionChallenge({ challenge, onAnswer, isPreview }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} isPreview={isPreview}>
      {(props) => <VisualAdditionRenderer {...props} />}
    </BaseChallenge>
  );
}

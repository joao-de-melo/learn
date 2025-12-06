import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { getIcon } from '../../components/IconDisplay';

export const challengeType = 'odd_one_out';

function OddOneOutRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData } = challenge;

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
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function OddOneOutChallenge({ challenge, onAnswer, onComplete, isPreview, language }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} onComplete={onComplete} isPreview={isPreview} language={language}>
      {(props) => <OddOneOutRenderer {...props} />}
    </BaseChallenge>
  );
}

import React, { useMemo } from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay, getRandomIcon } from '../../components/IconDisplay';

export const challengeType = 'number_to_quantity';

function NumberToQuantityRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  // Generate random icon once per question (memoized so it doesn't change on re-render)
  const iconType = useMemo(() => {
    return questionData.iconType || getRandomIcon();
  }, [questionData.iconType]);

  return (
    <>
      <h2>{t('selectTheCorrectQuantity')}</h2>

      <div className="visual-display">
        <span className="target-number">{questionData.targetNumber}</span>
      </div>

      <div className="answer-options visual-options">
        {answerData.options.map((opt, i) => {
          const icons = Array(opt.count).fill(iconType);
          return (
            <OptionButton
              key={i}
              value={opt.value}
              isSelected={selectedAnswer === opt.value}
              isCorrect={opt.value === correctAnswer}
              showResult={result !== null || isPreview}
              isDisabled={isDisabled}
              onClick={onSelect}
              className="visual-option"
            >
              <IconDisplay icons={icons} size="medium" />
            </OptionButton>
          );
        })}
      </div>
    </>
  );
}

export default function NumberToQuantityChallenge({ challenge, onAnswer, onComplete, isPreview, language }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} onComplete={onComplete} isPreview={isPreview} language={language}>
      {(props) => <NumberToQuantityRenderer {...props} />}
    </BaseChallenge>
  );
}

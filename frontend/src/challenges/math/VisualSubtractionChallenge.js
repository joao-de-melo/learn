import React, { useMemo } from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay, getRandomIcon } from '../../components/IconDisplay';

export const challengeType = 'visual_subtraction';

function VisualSubtractionRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  // Generate random icon once per question (memoized so it doesn't change on re-render)
  const iconType = useMemo(() => {
    return questionData.iconType || getRandomIcon();
  }, [questionData.iconType]);

  // Icons to show (startCount with some crossed out)
  const startIcons = useMemo(() => {
    return Array(questionData.startCount).fill(iconType);
  }, [questionData.startCount, iconType]);

  const removeCount = questionData.removeCount;

  return (
    <>
      <h2>{t('howManyAreLeft')}</h2>

      <div className="visual-display">
        <div className="visual-group subtraction">
          <IconDisplay icons={startIcons} size="large" crossedOut={removeCount} />
        </div>
        <span className="operator">-</span>
        <span className="operator-number">{removeCount}</span>
        <span className="operator">=</span>
        <span className="operator">?</span>
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

export default function VisualSubtractionChallenge({ challenge, onAnswer, onComplete, isPreview, language }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} onComplete={onComplete} isPreview={isPreview} language={language}>
      {(props) => <VisualSubtractionRenderer {...props} />}
    </BaseChallenge>
  );
}

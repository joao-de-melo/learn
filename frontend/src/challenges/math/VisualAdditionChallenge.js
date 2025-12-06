import React, { useMemo } from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay, getRandomIcon } from '../../components/IconDisplay';

export const challengeType = 'visual_addition';

function VisualAdditionRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  // Generate random icon once per question (memoized so it doesn't change on re-render)
  const iconType = useMemo(() => {
    return questionData.iconType || getRandomIcon();
  }, [questionData.iconType]);

  // Support both old format (left/right arrays) and new format (leftCount/rightCount + iconType)
  const leftIcons = useMemo(() => {
    if (questionData.left) {
      return questionData.left;
    }
    return Array(questionData.leftCount).fill(iconType);
  }, [questionData.left, questionData.leftCount, iconType]);

  const rightIcons = useMemo(() => {
    if (questionData.right) {
      return questionData.right;
    }
    return Array(questionData.rightCount).fill(iconType);
  }, [questionData.right, questionData.rightCount, iconType]);

  // Generate icons for answer options
  const getOptionIcons = (opt) => {
    if (opt.icons) {
      return opt.icons;
    }
    return Array(opt.count).fill(iconType);
  };

  return (
    <>
      <h2>{t('howManyInTotal')}</h2>

      <div className="visual-display">
        <div className="visual-group">
          <IconDisplay icons={leftIcons} size="large" />
        </div>
        <span className="operator">+</span>
        <div className="visual-group">
          <IconDisplay icons={rightIcons} size="large" />
        </div>
        <span className="operator">=</span>
        <span className="operator">?</span>
      </div>

      <div className="answer-options">
        {answerData.options.map((opt, i) => (
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
            <IconDisplay icons={getOptionIcons(opt)} size="normal" />
          </OptionButton>
        ))}
      </div>
    </>
  );
}

export default function VisualAdditionChallenge({ challenge, onAnswer, onComplete, isPreview, language }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} onComplete={onComplete} isPreview={isPreview} language={language}>
      {(props) => <VisualAdditionRenderer {...props} />}
    </BaseChallenge>
  );
}

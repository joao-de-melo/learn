import React, { useMemo } from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay, getRandomIcon } from '../../components/IconDisplay';

export const challengeType = 'number_to_quantity';

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const iconType = getRandomIcon();
  const samples = [
    { targetNumber: 4, correct: 4 },
    { targetNumber: 3, correct: 3 },
  ];

  return samples.map(({ targetNumber, correct }) => {
    const options = [correct - 1, correct, correct + 1, correct + 2].map(count => ({
      value: count,
      count,
    }));
    return {
      question_type: challengeType,
      questionData: { targetNumber, iconType },
      answerData: { correct, options },
    };
  });
}

function NumberToQuantityRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  // Generate random icon once per question (memoized so it doesn't change on re-render)
  const iconType = useMemo(() => {
    return questionData.iconType || getRandomIcon();
  }, [questionData.iconType]);

  return (
    <>
      <p className="challenge-instruction">{t('selectTheCorrectQuantity')}</p>

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

export default function NumberToQuantityChallenge({
  challenge,
  onAnswer,
  onComplete,
  isPreview,
  language,
  voiceEnabled = false,
  showHelpOnStart = false,
  challengeName
}) {
  return (
    <BaseChallenge
      challenge={challenge}
      onAnswer={onAnswer}
      onComplete={onComplete}
      isPreview={isPreview}
      language={language}
      voiceEnabled={voiceEnabled}
      showHelpOnStart={showHelpOnStart}
      challengeTypeId={challengeType}
      challengeName={challengeName}
    >
      {(props) => <NumberToQuantityRenderer {...props} />}
    </BaseChallenge>
  );
}

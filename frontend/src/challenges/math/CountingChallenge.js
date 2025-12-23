import React, { useMemo } from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay, getRandomIcon } from '../../components/IconDisplay';

export const challengeType = 'counting';

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const samples = [
    { count: 3, correct: 3, options: [2, 3, 4, 5] },
    { count: 5, correct: 5, options: [3, 4, 5, 6] },
  ];

  return samples.map(({ count, correct, options }) => ({
    question_type: challengeType,
    questionData: { count, iconType: getRandomIcon() },
    answerData: { correct, options },
  }));
}

function CountingRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t }) {
  const { questionData, answerData } = challenge;

  // Generate random icon once per question (memoized so it doesn't change on re-render)
  const iconType = useMemo(() => {
    return questionData.iconType || getRandomIcon();
  }, [questionData.iconType]);

  // Support both old format (icons array) and new format (count + iconType)
  const icons = useMemo(() => {
    if (questionData.icons) {
      return questionData.icons;
    }
    return Array(questionData.count).fill(iconType);
  }, [questionData.icons, questionData.count, iconType]);

  return (
    <>
      <h2>{t('howManyDoYouSee')}</h2>

      <div className="visual-display">
        <IconDisplay icons={icons} size="large" />
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

export default function CountingChallenge({
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
      {(props) => <CountingRenderer {...props} />}
    </BaseChallenge>
  );
}

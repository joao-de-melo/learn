import React, { useMemo, useEffect, useState, useCallback } from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay, getRandomIcon } from '../../components/IconDisplay';
import voiceService from '../../services/voiceService';

export const challengeType = 'voice_to_quantity';

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const iconType = getRandomIcon();
  const samples = [
    { targetNumber: 3, correct: 3 },
    { targetNumber: 5, correct: 5 },
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

function VoiceToQuantityRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t, language, onChallengeReady }) {
  const { questionData, answerData } = challenge;
  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get the icon name for display
  const iconName = useMemo(() => {
    return questionData.iconType || 'star';
  }, [questionData.iconType]);

  // Build the voice text (e.g., "3 stars" or "duas flores" in Portuguese)
  const voiceText = useMemo(() => {
    const count = questionData.targetNumber;
    const iconKey = `voiceIcon_${iconName}`;
    // Get translated icon name (plural form for count > 1)
    let iconWord = t(iconKey);
    if (iconWord === iconKey) {
      // Fallback to icon name if no translation
      iconWord = iconName;
    }
    // Handle pluralization for Portuguese and English
    if (count > 1) {
      const pluralKey = `voiceIcon_${iconName}_plural`;
      const plural = t(pluralKey);
      if (plural !== pluralKey) {
        iconWord = plural;
      }
    }

    // Handle Portuguese gender agreement for numbers 1 and 2
    // "um/uma" for 1, "dois/duas" for 2
    let numberWord = count.toString();
    if (language === 'pt') {
      const genderKey = `voiceIcon_${iconName}_gender`;
      const gender = t(genderKey);
      const isFeminine = gender === 'f';

      if (count === 1) {
        numberWord = isFeminine ? 'uma' : 'um';
      } else if (count === 2) {
        numberWord = isFeminine ? 'duas' : 'dois';
      }
    }

    return `${numberWord} ${iconWord}`;
  }, [questionData.targetNumber, iconName, t, language]);

  // Play the voice prompt
  const playVoice = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    voiceService.speak(voiceText, language).then(() => {
      setIsPlaying(false);
      setHasPlayedVoice(true);
    });
  }, [voiceText, language, isPlaying]);

  // Auto-play voice when challenge is ready (after help is dismissed)
  useEffect(() => {
    if (!isDisabled && !hasPlayedVoice && !isPreview) {
      // Small delay to ensure help overlay is fully dismissed
      const timer = setTimeout(() => {
        playVoice();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isDisabled, hasPlayedVoice, isPreview, playVoice]);

  // Stop voice when component unmounts or result is shown
  useEffect(() => {
    return () => voiceService.stop();
  }, []);

  // Stop voice when answer is submitted
  useEffect(() => {
    if (result) {
      voiceService.stop();
    }
  }, [result]);

  return (
    <>
      <p className="challenge-instruction">{t('listenAndSelectQuantity')}</p>

      <div className="visual-display voice-challenge-display">
        <button
          className={`play-voice-btn ${isPlaying ? 'playing' : ''}`}
          onClick={playVoice}
          disabled={isDisabled || isPlaying}
          aria-label={t('playAgain')}
        >
          <span className="play-icon">{isPlaying ? '🔊' : '🔈'}</span>
          <span className="play-text">{t('playAgain')}</span>
        </button>
      </div>

      <div className="answer-options visual-options">
        {answerData.options.map((opt, i) => {
          const icons = Array(opt.count).fill(iconName);
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

export default function VoiceToQuantityChallenge({
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
      {(props) => <VoiceToQuantityRenderer {...props} />}
    </BaseChallenge>
  );
}

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import voiceService from '../../services/voiceService';

export const challengeType = 'voice_to_number';

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const samples = [
    { targetNumber: 7, correct: 7 },
    { targetNumber: 4, correct: 4 },
  ];

  return samples.map(({ targetNumber, correct }) => ({
    question_type: challengeType,
    questionData: { targetNumber },
    answerData: { correct, options: [correct - 2, correct - 1, correct, correct + 1] },
  }));
}

function VoiceToNumberRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview, t, language }) {
  const { questionData, answerData } = challenge;
  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Build the voice text - just the number
  const voiceText = useMemo(() => {
    return String(questionData.targetNumber);
  }, [questionData.targetNumber]);

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

  // Stop voice when component unmounts
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
      <p className="challenge-instruction">{t('listenAndSelectNumber')}</p>

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

export default function VoiceToNumberChallenge({
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
      {(props) => <VoiceToNumberRenderer {...props} />}
    </BaseChallenge>
  );
}

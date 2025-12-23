import React, { useState, useEffect } from 'react';
import { usePlayLanguage } from '../i18n';
import voiceService from '../services/voiceService';

// Base wrapper for all challenge types
// Handles common logic: help page (optional), answer submission, feedback display, auto-advance

export default function BaseChallenge({
  challenge,
  onAnswer,
  onComplete,
  isPreview = false,
  language = 'pt',
  voiceEnabled = false,
  showHelpOnStart = false,
  challengeTypeId,
  challengeName,
  children
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showingHelp, setShowingHelp] = useState(showHelpOnStart && !isPreview);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);
  const { t } = usePlayLanguage(language);

  // Cleanup voice when component unmounts or help is dismissed
  useEffect(() => {
    return () => voiceService.stop();
  }, []);

  // Play voice help - called when user clicks the play button
  const playVoiceHelp = () => {
    if (voiceEnabled && challengeTypeId && !isSpeaking) {
      const helpKey = `help_${challengeTypeId}`;
      const helpText = t(helpKey);
      const voiceKey = `voice_${challengeTypeId}`;
      const textToSpeak = (helpText && helpText !== helpKey) ? helpText : t(voiceKey);

      if (textToSpeak && textToSpeak !== voiceKey) {
        setIsSpeaking(true);
        setHasPlayedVoice(true);
        voiceService.speak(textToSpeak, language).then(() => {
          setIsSpeaking(false);
        });
      }
    }
  };

  const handleStartChallenge = () => {
    voiceService.stop();
    setShowingHelp(false);
  };

  const handleSelect = async (answer) => {
    if (result || submitting || isPreview) return;

    setSelectedAnswer(answer);
    setSubmitting(true);

    try {
      const response = await onAnswer(answer);
      setResult(response);

      // Auto-advance after showing feedback
      setTimeout(() => {
        if (onComplete) {
          onComplete(response.isCorrect);
        }
      }, response.isCorrect ? 1000 : 1500);
    } finally {
      setSubmitting(false);
    }
  };

  // Pass down these props to the challenge renderer
  // When showing help, disable all interactions
  const challengeProps = {
    challenge,
    selectedAnswer,
    result,
    isPreview,
    isDisabled: showingHelp || result !== null || submitting || isPreview,
    onSelect: handleSelect,
    correctAnswer: challenge.answerData?.correct,
    t,
    language,
  };

  // Get help text for overlay
  const helpKey = `help_${challengeTypeId}`;
  const helpText = t(helpKey);
  const hasHelp = helpText && helpText !== helpKey;

  return (
    <div className={`challenge-display ${result ? (result.isCorrect ? 'result-correct' : 'result-incorrect') : ''} ${showingHelp ? 'showing-help' : ''}`}>
      {typeof children === 'function' ? children(challengeProps) : children}

      {/* Help overlay - shows on top of the challenge */}
      {showingHelp && (
        <div className="help-overlay">
          <div className="help-overlay-content">
            <p className="help-instruction">
              {hasHelp ? helpText : t(`challenge_${challengeTypeId}_desc`)}
            </p>
            <div className="help-buttons">
              {/* Voice enabled: show Listen button first, then Start after voice plays */}
              {voiceEnabled && !hasPlayedVoice && (
                <button
                  className={`btn btn-primary btn-large help-listen-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={playVoiceHelp}
                  disabled={isSpeaking}
                >
                  <span className="btn-play-icon">{isSpeaking ? '🔊' : '🔈'}</span>
                  {isSpeaking ? t('listening') : t('listenHelp')}
                </button>
              )}
              {/* Show Start button: when no voice, or after voice has played */}
              {(!voiceEnabled || hasPlayedVoice) && (
                <button
                  className="btn btn-primary btn-large help-start-btn"
                  onClick={handleStartChallenge}
                >
                  <span className="btn-play-icon">▶</span>
                  {t('startChallenge')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {result && !isPreview && (
        <div className={`feedback-overlay ${result.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            {result.isCorrect ? (
              <>
                <span className="feedback-icon">⭐</span>
                <span className="feedback-text">{t('greatJob')}</span>
              </>
            ) : (
              <>
                <span className="feedback-icon">❌</span>
                <span className="feedback-text">{t('wrong')}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for option buttons
export function OptionButton({
  value,
  isSelected,
  isCorrect,
  showResult,
  isDisabled,
  onClick,
  children,
  className = ''
}) {
  let stateClass = '';
  if (showResult) {
    if (isCorrect) {
      stateClass = 'correct';
    } else if (isSelected) {
      stateClass = 'incorrect';
    }
  }

  return (
    <button
      className={`answer-btn ${stateClass} ${className}`}
      onClick={() => onClick(value)}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { usePlayLanguage } from '../../i18n';
import voiceService from '../../services/voiceService';

export const challengeType = 'sequence_recall';

// Colors/shapes for the sequence
const SEQUENCE_ITEMS = [
  { id: 0, color: '#EF4444', emoji: '🔴' }, // Red
  { id: 1, color: '#3B82F6', emoji: '🔵' }, // Blue
  { id: 2, color: '#22C55E', emoji: '🟢' }, // Green
  { id: 3, color: '#EAB308', emoji: '🟡' }, // Yellow
];

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  return [{
    question_type: challengeType,
    questionData: { sequence: [0, 1, 2], maxLength: 4 },
    answerData: { sequence: [0, 1, 2] },
  }];
}

export default function SequenceRecallChallenge({
  challenge,
  onAnswer,
  onComplete,
  isPreview,
  language,
  voiceEnabled = false,
  showHelpOnStart = false,
  challengeName
}) {
  const { t } = usePlayLanguage(language);
  const { questionData } = challenge;

  const [phase, setPhase] = useState('help'); // 'help', 'showing', 'input', 'feedback'
  const [sequence, setSequence] = useState(questionData.sequence || []);
  const [userInput, setUserInput] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showingHelp, setShowingHelp] = useState(showHelpOnStart && !isPreview);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => voiceService.stop();
  }, []);

  // Start showing sequence after help is dismissed
  useEffect(() => {
    if (!showingHelp && phase === 'help' && !isPreview) {
      setPhase('showing');
    }
  }, [showingHelp, phase, isPreview]);

  // Show the sequence to the user
  const showSequence = useCallback(async () => {
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setHighlightedId(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setHighlightedId(null);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    setPhase('input');
  }, [sequence]);

  // Start showing sequence when in showing phase
  useEffect(() => {
    if (phase === 'showing') {
      showSequence();
    }
  }, [phase, showSequence]);

  const playVoiceHelp = () => {
    if (voiceEnabled && !isSpeaking) {
      const helpText = t('help_sequence_recall');
      if (helpText && helpText !== 'help_sequence_recall') {
        setIsSpeaking(true);
        setHasPlayedVoice(true);
        voiceService.speak(helpText, language).then(() => {
          setIsSpeaking(false);
        });
      }
    }
  };

  const handleStartChallenge = () => {
    voiceService.stop();
    setShowingHelp(false);
  };

  const handleItemClick = (itemId) => {
    if (phase !== 'input' || isPreview) return;

    const newInput = [...userInput, itemId];
    setUserInput(newInput);

    // Flash the clicked item
    setHighlightedId(itemId);
    setTimeout(() => setHighlightedId(null), 200);

    // Check if user completed the sequence
    if (newInput.length === sequence.length) {
      const correct = newInput.every((id, idx) => id === sequence[idx]);
      setIsCorrect(correct);
      setPhase('feedback');

      // Report result
      setTimeout(() => {
        if (onAnswer) {
          onAnswer(correct ? 1 : 0);
        }
        setTimeout(() => {
          if (onComplete) {
            onComplete(correct);
          }
        }, 1000);
      }, 500);
    } else {
      // Check if wrong so far
      const correctSoFar = newInput.every((id, idx) => id === sequence[idx]);
      if (!correctSoFar) {
        setIsCorrect(false);
        setPhase('feedback');

        setTimeout(() => {
          if (onAnswer) {
            onAnswer(0);
          }
          setTimeout(() => {
            if (onComplete) {
              onComplete(false);
            }
          }, 1000);
        }, 500);
      }
    }
  };

  // Get help text
  const helpKey = 'help_sequence_recall';
  const helpText = t(helpKey);
  const hasHelp = helpText && helpText !== helpKey;

  // In preview mode, just show the sequence items
  if (isPreview) {
    return (
      <div className="challenge-display">
        <h2>{t('repeatTheSequence')}</h2>
        <div className="sequence-display" style={{ marginBottom: '20px' }}>
          {sequence.map((id, idx) => (
            <span key={idx} style={{ fontSize: '40px', margin: '0 8px' }}>
              {SEQUENCE_ITEMS[id]?.emoji}
            </span>
          ))}
        </div>
        <div className="sequence-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          maxWidth: '300px',
          margin: '0 auto',
        }}>
          {SEQUENCE_ITEMS.map(item => (
            <button
              key={item.id}
              disabled
              style={{
                aspectRatio: '1',
                fontSize: '50px',
                border: '3px solid #e5e7eb',
                borderRadius: '16px',
                background: item.color,
                opacity: 0.7,
              }}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`challenge-display ${isCorrect === true ? 'result-correct' : isCorrect === false ? 'result-incorrect' : ''} ${showingHelp ? 'showing-help' : ''}`}>
      <h2>{t('repeatTheSequence')}</h2>

      {phase === 'showing' && (
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '16px' }}>
          {t('watchTheSequence')}
        </p>
      )}

      {phase === 'input' && (
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '16px' }}>
          {t('yourTurn')} ({userInput.length}/{sequence.length})
        </p>
      )}

      <div className="sequence-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        maxWidth: '300px',
        margin: '0 auto',
        padding: '20px',
      }}>
        {SEQUENCE_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            disabled={phase !== 'input'}
            style={{
              aspectRatio: '1',
              fontSize: '50px',
              border: highlightedId === item.id ? '4px solid #000' : '3px solid #e5e7eb',
              borderRadius: '16px',
              background: item.color,
              opacity: highlightedId === item.id ? 1 : 0.7,
              transform: highlightedId === item.id ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.15s ease',
              cursor: phase === 'input' ? 'pointer' : 'default',
            }}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      {/* Help overlay */}
      {showingHelp && (
        <div className="help-overlay">
          <div className="help-overlay-content">
            <p className="help-instruction">
              {hasHelp ? helpText : t('challenge_sequence_recall_desc')}
            </p>
            <div className="help-buttons">
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

      {/* Feedback overlay */}
      {phase === 'feedback' && (
        <div className={`feedback-overlay ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            {isCorrect ? (
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

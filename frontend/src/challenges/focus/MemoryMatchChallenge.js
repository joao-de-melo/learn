import React, { useState, useEffect } from 'react';
import { usePlayLanguage } from '../../i18n';
import voiceService from '../../services/voiceService';

export const challengeType = 'memory_match';

// Icons for memory cards
const MEMORY_ICONS = ['🐶', '🐱', '🐰', '🐻', '🦁', '🐸', '🐵', '🦊', '🐼', '🐨'];

// Generate sample questions for preview (no backend needed)
export function generatePreview() {
  const icons = MEMORY_ICONS.slice(0, 2);
  const cards = [...icons, ...icons].map((icon, index) => ({
    id: index,
    icon,
    isFlipped: true, // Show all cards in preview
    isMatched: false,
  }));

  return [{
    question_type: challengeType,
    questionData: { cards, gridSize: 4 },
    answerData: { pairs: icons.length },
  }];
}

export default function MemoryMatchChallenge({
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

  // Initialize cards from challenge data or create new ones
  const [cards, setCards] = useState(() => {
    if (questionData.cards) {
      return questionData.cards.map(c => ({ ...c, isFlipped: isPreview, isMatched: false }));
    }
    // Fallback: create cards from gridSize
    const numPairs = Math.floor((questionData.gridSize || 4) / 2);
    const icons = MEMORY_ICONS.slice(0, numPairs);
    return [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: isPreview,
        isMatched: false,
      }));
  });

  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showingHelp, setShowingHelp] = useState(showHelpOnStart && !isPreview);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const totalPairs = Math.floor(cards.length / 2);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => voiceService.stop();
  }, []);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0 && !isPreview && !gameComplete) {
      setGameComplete(true);
      // Report success after a short delay
      setTimeout(() => {
        if (onAnswer) {
          onAnswer(moves);
        }
        setTimeout(() => {
          if (onComplete) {
            onComplete(true);
          }
        }, 1000);
      }, 500);
    }
  }, [matchedPairs, totalPairs, moves, onAnswer, onComplete, isPreview, gameComplete]);

  const playVoiceHelp = () => {
    if (voiceEnabled && !isSpeaking) {
      const helpText = t('help_memory_match');
      if (helpText && helpText !== 'help_memory_match') {
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

  const handleCardClick = (cardId) => {
    if (isPreview || isChecking || showingHelp) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Flip the card
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when two cards are flipped
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      const firstCard = newCards.find(c => c.id === first);
      const secondCard = newCards.find(c => c.id === second);

      if (firstCard.icon === secondCard.icon) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchedPairs(m => m + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  // Get help text
  const helpKey = 'help_memory_match';
  const helpText = t(helpKey);
  const hasHelp = helpText && helpText !== helpKey;

  // Calculate grid columns based on card count
  const gridCols = cards.length <= 4 ? 2 : cards.length <= 6 ? 3 : 4;

  return (
    <div className={`challenge-display ${gameComplete ? 'result-correct' : ''} ${showingHelp ? 'showing-help' : ''}`}>
      <h2>{t('findThePairs')}</h2>

      <div className="memory-stats">
        <span>{t('pairs')}: {matchedPairs}/{totalPairs}</span>
        <span>{t('moves')}: {moves}</span>
      </div>

      <div
        className="memory-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: '12px',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        {cards.map(card => (
          <button
            key={card.id}
            className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
            disabled={isPreview || isChecking || card.isFlipped || card.isMatched || showingHelp}
            style={{
              aspectRatio: '1',
              fontSize: '40px',
              border: '3px solid #e5e7eb',
              borderRadius: '12px',
              background: card.isFlipped || card.isMatched ? '#fff' : '#4F46E5',
              cursor: card.isFlipped || card.isMatched || isPreview ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: card.isMatched ? 0.6 : 1,
            }}
          >
            {card.isFlipped || card.isMatched ? card.icon : '❓'}
          </button>
        ))}
      </div>

      {/* Help overlay */}
      {showingHelp && (
        <div className="help-overlay">
          <div className="help-overlay-content">
            <p className="help-instruction">
              {hasHelp ? helpText : t('challenge_memory_match_desc')}
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

      {/* Completion feedback */}
      {gameComplete && !isPreview && (
        <div className="feedback-overlay correct">
          <div className="feedback-content">
            <span className="feedback-icon">⭐</span>
            <span className="feedback-text">{t('greatJob')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

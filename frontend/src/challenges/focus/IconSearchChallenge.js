import React, { useState, useEffect, useMemo } from 'react';
import { usePlayLanguage } from '../../i18n';
import voiceService from '../../services/voiceService';

export const challengeType = 'icon_search';

// Symbol sets - each set contains visually similar symbols for discrimination challenge
const SYMBOL_SETS = {
  // Colorful distinct emojis (easy mode)
  colorful: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
    '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
    '🐌', '🐞', '🐜', '🦟', '🦗', '🐢', '🐍', '🦎', '🦖', '🦕',
    '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭',
    '⭐', '🌟', '💫', '✨', '⚡', '🔥', '💧', '🌈', '☀️', '🌙',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💝'
  ],

  // Arrows pointing different directions (hard - very similar)
  arrows: [
    '↑', '↓', '←', '→', '↖', '↗', '↘', '↙',
    '⬆', '⬇', '⬅', '➡', '↕', '↔',
    '▲', '▼', '◀', '▶', '△', '▽', '◁', '▷',
    '⇧', '⇩', '⇦', '⇨', '⇡', '⇣', '⇠', '⇢',
    '↰', '↱', '↲', '↳', '↴', '↵',
    '⤴', '⤵', '↩', '↪', '⤶', '⤷',
    '➤', '➜', '➔', '➙', '➛', '➝', '➞', '➟',
    '⇐', '⇑', '⇒', '⇓', '⇔', '⇕'
  ],

  // Circles and round shapes (hard - subtle differences)
  circles: [
    '○', '◯', '◎', '●', '◐', '◑', '◒', '◓',
    '◔', '◕', '⊙', '⊚', '⊛', '⦿', '◌', '◍',
    '◉', '⊕', '⊖', '⊗', '⊘', '⊜', '⊝',
    '⬤', '⚫', '⚪', '🔴', '🔵', '⭕', '🔘',
    '◦', '•', '∘', '°', '⁰', 'º',
    'O', 'Q', 'G', 'C', 'D', '0', 'Ø', 'Θ',
    '⊃', '⊂', '⊇', '⊆', '∩', '∪'
  ],

  // Similar letters and characters (hard - confusable)
  letters: [
    'O', 'Q', 'G', 'C', 'D', '0', 'Ø', 'Θ',
    'I', 'l', '1', '|', '!', 'i', 'j', 'L',
    'b', 'd', 'p', 'q', '6', '9',
    'n', 'u', 'm', 'w', 'ω', 'ɯ',
    'E', 'F', 'f', 't', 'T', '†', '‡',
    'V', 'W', 'M', 'N', 'v', 'w',
    'S', '5', '$', 's', 'Z', '2', 'z',
    'A', '4', 'Λ', 'Δ', 'a', 'α',
    'B', '8', 'ß', 'β', 'R', 'P',
    'K', 'X', 'x', 'k', '×', '+', '*'
  ],

  // Geometric shapes (medium - similar but distinguishable)
  shapes: [
    '■', '□', '▢', '▣', '▤', '▥', '▦', '▧', '▨', '▩',
    '◆', '◇', '◈', '⬥', '⬦', '⬧', '⬨',
    '▲', '△', '▴', '▵', '▼', '▽', '▾', '▿',
    '◀', '◁', '▶', '▷', '◂', '◃', '▸', '▹',
    '★', '☆', '✦', '✧', '✩', '✪', '✫', '✬',
    '♠', '♤', '♣', '♧', '♥', '♡', '♦', '♢',
    '⬟', '⬡', '⬢', '⬣', '⎔', '⏣', '⏢',
    '╳', '╋', '╬', '┼', '╪', '╫'
  ],

  // Math and technical symbols (hard)
  math: [
    '+', '×', '÷', '−', '±', '∓', '∗', '∙',
    '=', '≠', '≈', '≡', '≢', '≃', '≄', '≅',
    '<', '>', '≤', '≥', '≪', '≫', '≮', '≯',
    '∧', '∨', '⊻', '⊼', '⊽', '∩', '∪',
    '∈', '∉', '∋', '∌', '⊂', '⊃', '⊆', '⊇',
    '∀', '∃', '∄', '∅', '∆', '∇', '∂', '∫',
    '√', '∛', '∜', '∝', '∞', '∟', '∠', '∡',
    'π', 'Σ', 'Π', 'Ω', 'μ', 'φ', 'ψ', 'λ'
  ]
};

// Legacy alias
const ICON_POOL = SYMBOL_SETS.colorful;

// Generate sample questions for preview (no backend needed)
export function generatePreview(config = {}) {
  const { symbolSet = 'arrows', gridSize = 36, targetCount = 2 } = config;
  const gridCols = Math.ceil(Math.sqrt(gridSize));

  // Get symbols from the selected set
  const symbols = SYMBOL_SETS[symbolSet] || SYMBOL_SETS.colorful;
  const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5);
  const targetIcons = shuffledSymbols.slice(0, targetCount);
  const fillerIcons = shuffledSymbols.slice(targetCount, targetCount + 15);

  // Create grid with targets placed randomly
  const grid = [];
  const targetPositions = [];

  // Place targets first
  for (let i = 0; i < targetCount; i++) {
    let pos;
    do {
      pos = Math.floor(Math.random() * gridSize);
    } while (targetPositions.includes(pos));
    targetPositions.push(pos);
  }

  // Fill the grid
  for (let i = 0; i < gridSize; i++) {
    const targetIndex = targetPositions.indexOf(i);
    if (targetIndex !== -1) {
      grid.push({ id: i, icon: targetIcons[targetIndex], isTarget: true });
    } else {
      grid.push({
        id: i,
        icon: fillerIcons[Math.floor(Math.random() * fillerIcons.length)],
        isTarget: false
      });
    }
  }

  return [{
    question_type: challengeType,
    questionData: {
      grid,
      targetIcons,
      gridCols,
      symbolSet
    },
    answerData: {
      targetPositions
    },
  }];
}

export default function IconSearchChallenge({
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
  const { questionData, answerData } = challenge;
  const { grid, targetIcons, gridCols = 6, symbolSet = 'colorful' } = questionData;
  const { targetPositions } = answerData;

  // Check if using monochrome symbols (need different styling)
  const isMonochrome = symbolSet !== 'colorful';

  const [selectedPositions, setSelectedPositions] = useState([]);
  const [showingHelp, setShowingHelp] = useState(showHelpOnStart && !isPreview);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => voiceService.stop();
  }, []);

  const playVoiceHelp = () => {
    if (voiceEnabled && !isSpeaking) {
      const helpText = t('help_icon_search');
      if (helpText && helpText !== 'help_icon_search') {
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

  const handleCellClick = (cellId) => {
    if (isPreview || submitted || showingHelp) return;

    setSelectedPositions(prev => {
      if (prev.includes(cellId)) {
        // Deselect if already selected
        return prev.filter(id => id !== cellId);
      } else {
        // Select if under target count
        if (prev.length < targetIcons.length) {
          return [...prev, cellId];
        }
        return prev;
      }
    });
  };

  const handleSubmit = () => {
    if (isPreview || submitted) return;

    // Check if all selected positions are targets
    const sortedSelected = [...selectedPositions].sort((a, b) => a - b);
    const sortedTargets = [...targetPositions].sort((a, b) => a - b);

    const correct = sortedSelected.length === sortedTargets.length &&
      sortedSelected.every((pos, idx) => pos === sortedTargets[idx]);

    setIsCorrect(correct);
    setSubmitted(true);

    if (onAnswer) {
      onAnswer(correct ? 1 : 0);
    }

    setTimeout(() => {
      if (onComplete) {
        onComplete(correct);
      }
    }, correct ? 1000 : 1500);
  };

  // Get help text
  const helpKey = 'help_icon_search';
  const helpText = t(helpKey);
  const hasHelp = helpText && helpText !== helpKey;

  // Calculate if can submit
  const canSubmit = selectedPositions.length === targetIcons.length;

  // Memoize the target icons display to show which ones have been found
  const targetStatus = useMemo(() => {
    return targetIcons.map((icon, idx) => {
      const targetPos = targetPositions[idx];
      const isFound = selectedPositions.includes(targetPos);
      return { icon, isFound };
    });
  }, [targetIcons, targetPositions, selectedPositions]);

  return (
    <div className={`challenge-display icon-search-challenge ${submitted ? (isCorrect ? 'result-correct' : 'result-incorrect') : ''} ${showingHelp ? 'showing-help' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100vh',
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header - Target icons to find */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '8px 12px',
        background: isMonochrome
          ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        marginBottom: '8px',
        flexShrink: 0,
      }}>
        <span style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
        }}>
          {t('findTheseIcons')}:
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {targetStatus.map((target, idx) => (
            <div
              key={idx}
              style={{
                fontSize: isMonochrome ? '24px' : '28px',
                fontFamily: isMonochrome ? 'monospace, sans-serif' : 'inherit',
                fontWeight: isMonochrome ? 'bold' : 'normal',
                background: 'white',
                borderRadius: '8px',
                padding: isMonochrome ? '6px 10px' : '4px 8px',
                minWidth: isMonochrome ? '40px' : 'auto',
                textAlign: 'center',
                opacity: target.isFound ? 0.5 : 1,
                textDecoration: target.isFound ? 'line-through' : 'none',
                transition: 'all 0.3s ease',
                color: '#1f2937',
              }}
            >
              {target.icon}
              {target.isFound && (
                <span style={{ marginLeft: '4px', fontSize: '16px', color: '#10b981' }}>✓</span>
              )}
            </div>
          ))}
        </div>
        <span style={{
          color: 'white',
          fontSize: '14px',
          background: 'rgba(255,255,255,0.2)',
          padding: '4px 8px',
          borderRadius: '8px',
        }}>
          {selectedPositions.length}/{targetIcons.length}
        </span>
      </div>

      {/* Grid - takes remaining space */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: '4px',
            width: '100%',
            maxWidth: '500px',
            aspectRatio: '1',
            maxHeight: '100%',
          }}
        >
          {grid.map(cell => {
            const isSelected = selectedPositions.includes(cell.id);
            const showAsCorrect = submitted && cell.isTarget;
            const showAsWrong = submitted && isSelected && !cell.isTarget;
            const showAsMissed = submitted && !isSelected && cell.isTarget;

            // Calculate font size based on grid size and symbol type
            const baseFontSize = gridCols > 8 ? 18 : gridCols > 6 ? 22 : 26;
            const fontSize = isMonochrome ? baseFontSize + 2 : baseFontSize;

            return (
              <button
                key={cell.id}
                onClick={() => handleCellClick(cell.id)}
                disabled={isPreview || submitted || showingHelp}
                style={{
                  aspectRatio: '1',
                  fontSize: `${fontSize}px`,
                  fontFamily: isMonochrome ? 'monospace, sans-serif' : 'inherit',
                  fontWeight: isMonochrome ? 'bold' : 'normal',
                  color: '#1f2937',
                  border: isSelected
                    ? `3px solid ${isMonochrome ? '#1f2937' : '#4F46E5'}`
                    : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: showAsCorrect ? '#86efac'
                    : showAsWrong ? '#fca5a5'
                    : showAsMissed ? '#fde047'
                    : isSelected ? (isMonochrome ? '#d1d5db' : '#c7d2fe')
                    : '#fff',
                  cursor: (isPreview || submitted || showingHelp) ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  outline: 'none',
                  boxShadow: isSelected
                    ? `0 0 0 2px ${isMonochrome ? 'rgba(31, 41, 55, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`
                    : 'none',
                }}
              >
                {cell.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit button - fixed at bottom */}
      {!isPreview && !submitted && (
        <div style={{
          padding: '12px',
          flexShrink: 0,
        }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || showingHelp}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              background: canSubmit
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: canSubmit ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            {canSubmit ? t('submitAnswer') : `${t('select')} ${targetIcons.length - selectedPositions.length} ${t('more')}`}
          </button>
        </div>
      )}

      {/* Help overlay */}
      {showingHelp && (
        <div className="help-overlay">
          <div className="help-overlay-content">
            <p className="help-instruction">
              {hasHelp ? helpText : t('challenge_icon_search_desc')}
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
      {submitted && (
        <div className={`feedback-overlay ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            <span className="feedback-icon">{isCorrect ? '⭐' : '❌'}</span>
            <span className="feedback-text">{isCorrect ? t('greatJob') : t('tryAgain')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

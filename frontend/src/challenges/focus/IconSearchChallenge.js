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
  const { symbolSet = 'arrows', gridCols = 6, gridRows = 8, targetCount = 1, uniqueSymbols = 6 } = config;
  const totalCells = gridCols * gridRows;

  // Get symbols from the selected set
  const symbols = SYMBOL_SETS[symbolSet] || SYMBOL_SETS.colorful;
  const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5);
  // Use the configured number of unique symbols
  const uniqueSymbolCount = Math.min(symbols.length, Math.max(targetCount + 1, uniqueSymbols));
  const availableSymbols = shuffledSymbols.slice(0, uniqueSymbolCount);

  const targetIcons = availableSymbols.slice(0, targetCount);
  const fillerSymbols = availableSymbols.slice(targetCount);

  // Each target appears multiple times (~15% of grid)
  const targetOccurrences = Math.max(2, Math.floor(totalCells * 0.15 / targetCount));

  // Generate target positions
  const targetPositions = [];
  const usedPositions = new Set();

  for (let t = 0; t < targetCount; t++) {
    for (let i = 0; i < targetOccurrences; i++) {
      let pos;
      let attempts = 0;
      do {
        pos = Math.floor(Math.random() * totalCells);
        attempts++;
      } while (usedPositions.has(pos) && attempts < 100);
      if (!usedPositions.has(pos)) {
        usedPositions.add(pos);
        targetPositions.push(pos);
      }
    }
  }

  // Build the grid
  const grid = [];
  for (let i = 0; i < totalCells; i++) {
    if (usedPositions.has(i)) {
      const targetIdx = Math.floor(targetPositions.indexOf(i) / targetOccurrences);
      grid.push({ id: i, icon: targetIcons[Math.min(targetIdx, targetIcons.length - 1)], isTarget: true });
    } else {
      grid.push({
        id: i,
        icon: fillerSymbols[Math.floor(Math.random() * fillerSymbols.length)],
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
      gridRows,
      symbolSet,
      targetTotal: targetPositions.length
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
  const { grid, targetIcons, gridCols = 6, gridRows = 8, symbolSet = 'colorful', targetTotal } = questionData;
  const { targetPositions } = answerData;

  // Check if using monochrome symbols (need different styling)
  const isMonochrome = symbolSet !== 'colorful';

  // Total targets to find (use targetTotal from backend or count from positions)
  const totalTargets = targetTotal || targetPositions.length;

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
        // Allow selecting any cell (no limit)
        return [...prev, cellId];
      }
    });
  };

  const handleSubmit = () => {
    if (isPreview || submitted) return;

    // Check if all targets were found and no wrong selections
    const targetSet = new Set(targetPositions);
    const selectedSet = new Set(selectedPositions);

    // All selected must be targets (no wrong selections)
    const allSelectedAreTargets = selectedPositions.every(pos => targetSet.has(pos));
    // All targets must be selected
    const allTargetsFound = targetPositions.every(pos => selectedSet.has(pos));

    const correct = allSelectedAreTargets && allTargetsFound;

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

  // Can submit as long as at least 1 is selected
  const canSubmit = selectedPositions.length >= 1;

  // Count how many correct targets are selected
  const correctlySelected = selectedPositions.filter(pos => targetPositions.includes(pos)).length;


  return (
    <div className={`challenge-display icon-search-challenge ${submitted ? (isCorrect ? 'result-correct' : 'result-incorrect') : ''} ${showingHelp ? 'showing-help' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '12px',
        boxSizing: 'border-box',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
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
          {t('findAll')}:
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {targetIcons.map((icon, idx) => (
            <div
              key={idx}
              style={{
                fontSize: isMonochrome ? '28px' : '32px',
                fontFamily: isMonochrome ? 'monospace, sans-serif' : 'inherit',
                fontWeight: isMonochrome ? 'bold' : 'normal',
                background: 'white',
                borderRadius: '8px',
                padding: isMonochrome ? '6px 12px' : '4px 10px',
                minWidth: isMonochrome ? '44px' : 'auto',
                textAlign: 'center',
                color: '#1f2937',
              }}
            >
              {icon}
            </div>
          ))}
        </div>
        <span style={{
          color: 'white',
          fontSize: '14px',
          background: correctlySelected === totalTargets ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.2)',
          padding: '4px 8px',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
        }}>
          {correctlySelected}/{totalTargets}
        </span>
      </div>

      {/* Grid - takes remaining space */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        gap: '4px',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {grid.map(cell => {
          const isSelected = selectedPositions.includes(cell.id);
          const showAsCorrect = submitted && cell.isTarget;
          const showAsWrong = submitted && isSelected && !cell.isTarget;
          const showAsMissed = submitted && !isSelected && cell.isTarget;

          return (
            <button
              key={cell.id}
              onClick={() => handleCellClick(cell.id)}
              disabled={isPreview || submitted || showingHelp}
              style={{
                fontSize: 'clamp(14px, 3vw, 28px)',
                fontFamily: isMonochrome ? 'monospace, sans-serif' : 'inherit',
                fontWeight: isMonochrome ? 'bold' : 'normal',
                color: '#1f2937',
                border: isSelected
                  ? `3px solid ${isMonochrome ? '#1f2937' : '#4F46E5'}`
                  : '2px solid #e5e7eb',
                borderRadius: '6px',
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
                padding: '2px',
                margin: 0,
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
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
            {t('submitAnswer')}
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

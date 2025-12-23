import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ChallengeRenderer from '../challenges';
import { usePlayLanguage } from '../i18n';
import voiceService from '../services/voiceService';

const AVATARS = {
  bear: '\uD83D\uDC3B',
  robot: '\uD83E\uDD16',
  star: '\u2B50',
  heart: '\u2764\uFE0F',
  flower: '\uD83C\uDF38',
  car: '\uD83D\uDE97',
};

export default function Play() {
  const { token } = useParams();
  const [gameData, setGameData] = useState(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [challengeData, setChallengeData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameComplete, setGameComplete] = useState(false);
  const [challengeKey, setChallengeKey] = useState(0);

  // Track wrong answers in current challenge to repeat if needed
  const [hadWrongAnswer, setHadWrongAnswer] = useState(false);

  // Show help page before challenge starts (only when voice is enabled and it's a new challenge)
  // This is now handled within the challenge component itself
  const [showHelpOnStart, setShowHelpOnStart] = useState(false);

  // Get translations based on game language
  const { t } = usePlayLanguage(gameData?.language);

  useEffect(() => {
    loadGameData();
    // Stop any speech when component unmounts
    return () => voiceService.stop();
  }, [token]);

  const loadGameData = async () => {
    try {
      const data = await api.getPlayData(token);
      setGameData(data);

      if (data.challenges && data.challenges.length > 0) {
        // Load first challenge
        const challengeData = await api.getPlayChallenge(token, data.challenges[0].challengeTypeId);
        setChallengeData(challengeData);
        setCurrentQuestionIndex(0);
        setHadWrongAnswer(false);

        // Show help page if help is enabled (now handled within the challenge)
        if (data.helpEnabled) {
          setShowHelpOnStart(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChallenge = async (challengeTypeId, isNewChallenge = true) => {
    try {
      const data = await api.getPlayChallenge(token, challengeTypeId);
      setChallengeData(data);
      setCurrentQuestionIndex(0);
      setHadWrongAnswer(false);

      // Show help page for new challenges when help is enabled (now handled within the challenge)
      setShowHelpOnStart(isNewChallenge && gameData?.helpEnabled);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnswer = async (answer) => {
    const question = challengeData.questions[currentQuestionIndex];
    const challenge = gameData.challenges[currentChallengeIndex];
    const result = await api.submitAnswer(
      token,
      challenge.challengeTypeId,
      currentQuestionIndex,
      answer,
      question,
      sessionId
    );
    return result;
  };

  // Generate a session ID for this play session
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  const handleQuestionComplete = async (wasCorrect) => {
    if (!wasCorrect) {
      setHadWrongAnswer(true);
    }

    // More questions in current challenge?
    if (currentQuestionIndex < challengeData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setChallengeKey(prev => prev + 1);
      return;
    }

    // Challenge finished - check if we need to repeat
    if (hadWrongAnswer || !wasCorrect) {
      // Record the repeat for metrics
      const challenge = gameData.challenges[currentChallengeIndex];
      try {
        await api.recordChallengeRepeat(token, challenge.challengeTypeId);
      } catch (e) {
        // Non-critical, continue
      }
      // Repeat the challenge with new questions (don't speak again)
      await loadChallenge(challenge.challengeTypeId, false);
      setChallengeKey(prev => prev + 1);
      return;
    }

    // Challenge passed! Move to next
    if (currentChallengeIndex < gameData.challenges.length - 1) {
      const nextIndex = currentChallengeIndex + 1;
      setCurrentChallengeIndex(nextIndex);
      await loadChallenge(gameData.challenges[nextIndex].challengeTypeId);
      setChallengeKey(prev => prev + 1);
      return;
    }

    // All challenges complete!
    setGameComplete(true);

    // Mark the assignment as completed
    try {
      await api.completeGame(token);
    } catch (e) {
      // Non-critical, game completion is shown regardless
      console.error('Failed to mark game as complete:', e);
    }
  };

  if (loading) {
    return (
      <div className="play-container game-mode">
        <div className="play-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="play-container game-mode">
        <div className="play-content">
          <div className="play-card">
            <h2>Oops!</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gameData || !gameData.challenges || gameData.challenges.length === 0) {
    return (
      <div className="play-container game-mode">
        <div className="play-content">
          <div className="play-card">
            <h2>{t('noChallengesAvailable')}</h2>
            <p>{t('gameNoChallenges')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="play-container game-mode">
        <div className="play-content">
          <div className="game-complete">
            <div className="celebration">🎉</div>
            <h1>{t('amazing')}</h1>
            <p>{t('finishedAllChallenges')}</p>
            <div className="player-info">
              <span className="avatar">{AVATARS[gameData.kidAvatar] || AVATARS.bear}</span>
              <span>{gameData.kidName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challengeData || !challengeData.questions || challengeData.questions.length === 0) {
    return (
      <div className="play-container game-mode">
        <div className="play-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const currentChallenge = gameData.challenges[currentChallengeIndex];
  const question = challengeData.questions[currentQuestionIndex];

  if (!question) {
    return (
      <div className="play-container game-mode">
        <div className="play-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Progress dots
  const totalQuestions = challengeData.questions.length;

  return (
    <div className="play-container game-mode">
      <div className="game-header">
        <div className="player-badge">
          <span className="avatar">{AVATARS[gameData.kidAvatar] || AVATARS.bear}</span>
          <span className="name">{gameData.kidName}</span>
        </div>
        <div className="challenge-info">
          <span className="challenge-name">{t(`challenge_${currentChallenge.renderer}`)}</span>
        </div>
      </div>

      <div className="progress-dots">
        {Array(totalQuestions).fill(0).map((_, i) => (
          <div
            key={i}
            className={`dot ${i < currentQuestionIndex ? 'completed' : ''} ${i === currentQuestionIndex ? 'current' : ''}`}
          />
        ))}
      </div>

      <div className="play-content">
        <ChallengeRenderer
          key={challengeKey}
          challenge={question}
          language={gameData.language}
          onAnswer={handleAnswer}
          onComplete={handleQuestionComplete}
          voiceEnabled={gameData.voiceEnabled}
          showHelpOnStart={showHelpOnStart && currentQuestionIndex === 0}
          challengeName={currentChallenge.name}
        />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ChallengeRenderer from '../challenges';

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
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [challengeKey, setChallengeKey] = useState(0);

  useEffect(() => {
    loadGameData();
  }, [token]);

  const loadGameData = async () => {
    try {
      const data = await api.getPlayData(token);
      setGameData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectLevel = async (level) => {
    setSelectedLevel(level);
    setCurrentChallengeIndex(0);
    setChallengeKey(0);

    try {
      const data = await api.getPlayLevel(token, level.id);
      setLevelData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnswer = async (answer) => {
    const challenge = levelData.challenges[currentChallengeIndex];
    const result = await api.submitAnswer(token, challenge.id, answer);
    return result;
  };

  const nextChallenge = () => {
    if (currentChallengeIndex < levelData.challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setChallengeKey(prev => prev + 1);
    } else {
      // Level complete
      setSelectedLevel(null);
      setLevelData(null);
      loadGameData(); // Refresh progress
    }
  };

  const backToLevels = () => {
    setSelectedLevel(null);
    setLevelData(null);
    loadGameData();
  };

  if (loading) {
    return (
      <div className="play-container">
        <div className="play-content">
          <div className="play-card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="play-container">
        <div className="play-content">
          <div className="play-card">
            <h2>Oops!</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Playing a level
  if (selectedLevel && levelData) {
    const challenge = levelData.challenges[currentChallengeIndex];

    return (
      <div className="play-container">
        <div className="play-header">
          <h1>{selectedLevel.name}</h1>
          <p>Challenge {currentChallengeIndex + 1} of {levelData.challenges.length}</p>
        </div>

        <div className="play-content">
          <div className="play-card">
            <ChallengeRenderer
              key={challengeKey}
              challenge={challenge}
              onAnswer={handleAnswer}
            />

            <div className="challenge-progress">
              <button className="next-btn" onClick={nextChallenge}>
                {currentChallengeIndex < levelData.challenges.length - 1 ? 'Next' : 'Finish'}
              </button>
              <br />
              <button className="back-btn" onClick={backToLevels}>
                Back to Levels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level selection
  return (
    <div className="play-container">
      <div className="play-header">
        <h1>{gameData.game_name}</h1>
        <p>
          <span style={{ fontSize: '32px' }}>{AVATARS[gameData.kid_avatar] || AVATARS.bear}</span>
          {' '}
          Playing as {gameData.kid_name}
        </p>
      </div>

      <div className="play-content">
        <div className="play-card">
          <h2 style={{ marginBottom: '24px' }}>Choose a Level</h2>

          <div className="level-select-grid">
            {gameData.levels.map(level => {
              const progress = level.progress;
              const progressPercent = level.challenge_count > 0
                ? Math.round((progress.completed / parseInt(level.challenge_count)) * 100)
                : 0;

              return (
                <div
                  key={level.id}
                  className="level-select-item"
                  onClick={() => selectLevel(level)}
                >
                  <h3>{level.name}</h3>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>{level.category_name}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {level.challenge_count} challenges
                  </p>
                  {progressPercent > 0 && (
                    <>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>
                        {progressPercent}% complete
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

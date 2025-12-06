import React, { useEffect } from 'react';
import { usePlayLanguage } from '../i18n';
import voiceService from '../services/voiceService';

// Intro page shown before a challenge starts (only when voice is enabled)
// Displays the challenge name, speaks the voice introduction, and shows a start button

export default function ChallengeIntro({
  challengeTypeId,
  challengeName,
  language,
  onStart
}) {
  const { t } = usePlayLanguage(language);

  useEffect(() => {
    // Speak the voice introduction when the component mounts
    const voiceKey = `voice_${challengeTypeId}`;
    const voiceText = t(voiceKey);

    if (voiceText && voiceText !== voiceKey) {
      voiceService.speak(voiceText, language);
    }

    // Stop speech when component unmounts
    return () => voiceService.stop();
  }, [challengeTypeId, language, t]);

  return (
    <div className="challenge-intro">
      <div className="intro-content">
        <div className="intro-icon">🎯</div>
        <h1 className="intro-title">{challengeName}</h1>
        <p className="intro-description">{t(`challenge_${challengeTypeId}_desc`)}</p>
        <button
          className="btn btn-primary btn-large intro-start-btn"
          onClick={onStart}
        >
          {t('startChallenge')}
        </button>
      </div>
    </div>
  );
}

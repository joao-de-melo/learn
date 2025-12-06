// Voice Service using Web Speech API
// Provides text-to-speech functionality for game narration

class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSupported = 'speechSynthesis' in window;
    this.voices = [];
    this.voicesLoaded = false;

    // Load voices when they become available
    if (this.isSupported) {
      this.loadVoices();
      // Chrome requires this event listener
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
    this.voicesLoaded = this.voices.length > 0;
  }

  // Get the best voice for a language
  getVoiceForLanguage(lang) {
    if (!this.voicesLoaded) {
      this.loadVoices();
    }

    // Language code mapping
    const langCodes = {
      'pt': ['pt-PT', 'pt-BR', 'pt'],
      'en': ['en-US', 'en-GB', 'en']
    };

    const codes = langCodes[lang] || langCodes['en'];

    // Try to find a voice matching the language codes in order of preference
    for (const code of codes) {
      const voice = this.voices.find(v => v.lang.startsWith(code));
      if (voice) return voice;
    }

    // Fallback to any voice containing the language
    const fallbackVoice = this.voices.find(v =>
      v.lang.toLowerCase().includes(lang)
    );

    return fallbackVoice || this.voices[0] || null;
  }

  // Speak text in the specified language
  speak(text, language = 'pt', options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        console.warn('Speech synthesis not supported');
        resolve(); // Don't block if not supported
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice based on language
      const voice = this.getVoiceForLanguage(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = language === 'pt' ? 'pt-PT' : 'en-US';
      }

      // Configure speech parameters
      utterance.rate = options.rate || 0.9; // Slightly slower for kids
      utterance.pitch = options.pitch || 1.1; // Slightly higher pitch, friendlier
      utterance.volume = options.volume || 1;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        // Don't reject on 'interrupted' errors (normal when stopping)
        if (event.error !== 'interrupted') {
          console.warn('Speech synthesis error:', event.error);
        }
        resolve(); // Resolve anyway to not block game flow
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  // Stop current speech
  stop() {
    if (this.isSupported && this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  // Check if currently speaking
  isSpeaking() {
    return this.isSupported && this.synth.speaking;
  }

  // Check if speech synthesis is supported
  isAvailable() {
    return this.isSupported;
  }
}

// Singleton instance
const voiceService = new VoiceService();

export default voiceService;

// Language Category Challenges
// Add new language challenge types here

import LetterRecognitionChallenge, { generatePreview as letterRecognitionPreview } from './LetterRecognitionChallenge';
import WordRecognitionChallenge, { generatePreview as wordRecognitionPreview } from './WordRecognitionChallenge';

export default {
  letter_recognition: LetterRecognitionChallenge,
  word_recognition: WordRecognitionChallenge,
};

export const previewGenerators = {
  letter_recognition: letterRecognitionPreview,
  word_recognition: wordRecognitionPreview,
};

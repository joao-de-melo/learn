// Math Category Challenges
// Add new math challenge types here

import CountingChallenge, { generatePreview as countingPreview } from './CountingChallenge';
import VisualAdditionChallenge, { generatePreview as visualAdditionPreview } from './VisualAdditionChallenge';
import VisualSubtractionChallenge, { generatePreview as visualSubtractionPreview } from './VisualSubtractionChallenge';
import NumberToQuantityChallenge, { generatePreview as numberToQuantityPreview } from './NumberToQuantityChallenge';
import VoiceToQuantityChallenge, { generatePreview as voiceToQuantityPreview } from './VoiceToQuantityChallenge';
import VoiceToNumberChallenge, { generatePreview as voiceToNumberPreview } from './VoiceToNumberChallenge';

export default {
  counting: CountingChallenge,
  visual_addition: VisualAdditionChallenge,
  visual_subtraction: VisualSubtractionChallenge,
  number_to_quantity: NumberToQuantityChallenge,
  voice_to_quantity: VoiceToQuantityChallenge,
  voice_to_number: VoiceToNumberChallenge,
};

export const previewGenerators = {
  counting: countingPreview,
  visual_addition: visualAdditionPreview,
  visual_subtraction: visualSubtractionPreview,
  number_to_quantity: numberToQuantityPreview,
  voice_to_quantity: voiceToQuantityPreview,
  voice_to_number: voiceToNumberPreview,
};

// Logic Category Challenges
// Add new logic challenge types here

import PatternChallenge, { generatePreview as patternPreview } from './PatternChallenge';
import OddOneOutChallenge, { generatePreview as oddOneOutPreview } from './OddOneOutChallenge';
import MatchingChallenge, { generatePreview as matchingPreview } from './MatchingChallenge';

export default {
  pattern: PatternChallenge,
  odd_one_out: OddOneOutChallenge,
  matching: MatchingChallenge,
};

export const previewGenerators = {
  pattern: patternPreview,
  odd_one_out: oddOneOutPreview,
  matching: matchingPreview,
};

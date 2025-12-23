// Focus Category Challenges
// Add new focus/attention challenge types here

import MemoryMatchChallenge, { generatePreview as memoryMatchPreview } from './MemoryMatchChallenge';
import SequenceRecallChallenge, { generatePreview as sequenceRecallPreview } from './SequenceRecallChallenge';
import IconSearchChallenge, { generatePreview as iconSearchPreview } from './IconSearchChallenge';

export default {
  memory_match: MemoryMatchChallenge,
  sequence_recall: SequenceRecallChallenge,
  icon_search: IconSearchChallenge,
};

export const previewGenerators = {
  memory_match: memoryMatchPreview,
  sequence_recall: sequenceRecallPreview,
  icon_search: iconSearchPreview,
};

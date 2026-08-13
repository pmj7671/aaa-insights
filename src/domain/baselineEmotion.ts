/**
 * Baseline (deterministic) emotion classifier — a real implementation of the
 * EmotionClassifier seam. Lexicon based; a comment may yield several emotions
 * (E-25) or none (E-27). Production swaps in the Claude-backed detector via the
 * LLM gateway behind the SAME interface.
 * Requirements: supports R-46, D-17.
 */
import type { EmotionClassifier, EmotionRead, HeadlineEmotion } from './emotion.js';

const LEXICON: readonly { emotion: HeadlineEmotion; words: readonly string[] }[] = [
  { emotion: 'delight', words: ['love', 'delight', 'great', 'amazing', 'wonderful', 'happy', 'fantastic'] },
  { emotion: 'pride', words: ['proud', 'pride'] },
  { emotion: 'relief', words: ['relief', 'relieved', 'reassur', 'finally works'] },
  { emotion: 'hope', words: ['hope', 'excited', 'looking forward', 'can’t wait', "can't wait"] },
  { emotion: 'frustration', words: ['frustrat', 'annoy', 'irritat', 'hassle'] },
  { emotion: 'disappointment', words: ['disappoint', 'let down', 'letdown', 'underwhelm'] },
  { emotion: 'anger', words: ['angry', 'furious', 'rage', 'livid'] },
];

export const baselineEmotionClassifier: EmotionClassifier = {
  async detect(text: string): Promise<EmotionRead[]> {
    const t = text.toLowerCase();
    const reads: EmotionRead[] = [];
    for (const { emotion, words } of LEXICON) {
      if (words.some((w) => t.includes(w))) {
        reads.push({ headline: emotion, intensity: 0.7, confidence: 0.8, source: 'inferred' });
      }
    }
    return reads;
  },
};

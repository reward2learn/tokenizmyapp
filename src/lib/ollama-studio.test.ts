import { describe, expect, it } from 'vitest';
import { ollamaModelIsRunning } from '@/lib/ollama-studio';

describe('ollamaModelIsRunning', () => {
  it('matches exact model names', () => {
    const running = [{ name: 'qwen2.5:72b-instruct-q4_K_M', model: 'qwen2.5:72b-instruct-q4_K_M' }];
    expect(ollamaModelIsRunning('qwen2.5:72b-instruct-q4_K_M', running)).toBe(true);
  });

  it('matches base name with different tags', () => {
    const running = [{ name: 'llama3.1:latest', model: 'llama3.1:latest' }];
    expect(ollamaModelIsRunning('llama3.1:8b', running)).toBe(true);
  });

  it('returns false when model is not loaded', () => {
    const running = [{ name: 'muse-glimmer:latest', model: 'muse-glimmer:latest' }];
    expect(ollamaModelIsRunning('qwen2.5:72b-instruct-q4_K_M', running)).toBe(false);
  });
});

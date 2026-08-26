import { describe, expect, it } from 'vitest';
import { consumeOpenAiStream, openAiErrorMessage } from '@/lib/chat/chat-with-session-tools';

function sseBody(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(`${line}\n`));
      }
      controller.close();
    },
  });
}

describe('consumeOpenAiStream', () => {
  it('forwards content chunks and finish reason', async () => {
    const chunks: string[] = [];
    const result = await consumeOpenAiStream(
      sseBody([
        'data: {"choices":[{"delta":{"content":"Hello"}}]}',
        'data: {"choices":[{"delta":{"content":" world"},"finish_reason":null}]}',
        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}',
        'data: [DONE]',
      ]),
      (chunk) => {
        chunks.push(chunk);
      },
    );

    expect(chunks).toEqual(['Hello', ' world']);
    expect(result.content).toBe('Hello world');
    expect(result.finishReason).toBe('stop');
    expect(result.toolCalls).toEqual([]);
  });

  it('captures usage from the final include_usage stream chunk', async () => {
    const result = await consumeOpenAiStream(
      sseBody([
        'data: {"choices":[{"delta":{"content":"Hi"}}]}',
        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}',
        'data: {"choices":[],"usage":{"prompt_tokens":120,"completion_tokens":45}}',
        'data: [DONE]',
      ]),
    );

    expect(result.content).toBe('Hi');
    expect(result.usage).toEqual({ promptTokens: 120, completionTokens: 45 });
  });

  it('accumulates streamed tool calls', async () => {
    const result = await consumeOpenAiStream(
      sseBody([
        'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_1","type":"function","function":{"name":"save_conversation","arguments":""}}]}}]}',
        'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{}"}}]}}]}',
        'data: {"choices":[{"delta":{},"finish_reason":"tool_calls"}]}',
      ]),
    );

    expect(result.finishReason).toBe('tool_calls');
    expect(result.toolCalls).toEqual([{
      id: 'call_1',
      type: 'function',
      function: { name: 'save_conversation', arguments: '{}' },
    }]);
  });
});

describe('openAiErrorMessage', () => {
  it('returns studio-specific guidance on 502', () => {
    const msg = openAiErrorMessage(502, undefined, 'ollama-studio');
    expect(msg).toContain('Mac Studio');
    expect(msg).toContain('OLLAMA_TUNNEL_HOST');
  });

  it('returns generic message for other providers', () => {
    expect(openAiErrorMessage(502, undefined, 'openai')).toContain('temporarily unavailable');
  });
});

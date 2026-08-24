import { describe, expect, it } from 'vitest';
import {
  consumeSseStream,
  parseSseChunk,
  parseSsePayload,
  readOpenAiDelta,
} from './sse-parser';

describe('sse-parser', () => {
  it('parseSsePayload extracts delta content', () => {
    const events = parseSsePayload({ choices: [{ delta: { content: 'Hello' } }] });
    expect(events).toEqual([{ type: 'token', token: 'Hello' }]);
  });

  it('parseSsePayload extracts message content fallback', () => {
    const events = parseSsePayload({ choices: [{ message: { content: 'Full reply' } }] });
    expect(events).toEqual([{ type: 'token', token: 'Full reply' }]);
  });

  it('parseSsePayload surfaces stream errors', () => {
    const events = parseSsePayload({ error: 'rate limited' });
    expect(events).toEqual([{ type: 'error', error: 'rate limited' }]);
  });

  it('readOpenAiDelta throws on error field', () => {
    expect(() => readOpenAiDelta({ error: 'rate limited' })).toThrow('rate limited');
  });

  it('parseSseChunk accumulates tokens across lines', () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\ndata: [DONE]\n';
    const { events, remainder } = parseSseChunk(chunk);
    expect(events).toEqual([
      { type: 'token', token: 'Hi' },
      { type: 'done' },
    ]);
    expect(remainder).toBe('');
  });

  it('parseSsePayload extracts usage events', () => {
    const usage = {
      promptTokens: 100,
      completionTokens: 50,
      credits: 2,
      consumed: 2,
      charged: true,
      balance: 98,
      model: 'gpt-4o-mini',
    };
    const events = parseSsePayload({ type: 'usage', usage });
    expect(events).toEqual([{ type: 'usage', usage }]);
  });

  it('parseSseChunk includes usage before done', () => {
    const chunk =
      'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n' +
      'data: {"type":"usage","usage":{"promptTokens":10,"completionTokens":5,"credits":1,"consumed":1,"charged":true,"balance":99}}\n\n' +
      'data: [DONE]\n';
    const { events } = parseSseChunk(chunk);
    expect(events).toEqual([
      { type: 'token', token: 'Hi' },
      {
        type: 'usage',
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          credits: 1,
          consumed: 1,
          charged: true,
          balance: 99,
        },
      },
      { type: 'done' },
    ]);
  });

  it('parseSseChunk preserves partial line in remainder', () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"A"}}]}\ndata: {"cho';
    const { events, remainder } = parseSseChunk(chunk);
    expect(events).toEqual([{ type: 'token', token: 'A' }]);
    expect(remainder).toBe('data: {"cho');
  });

  it('parseSsePayload extracts calculator tool_result events', () => {
    const events = parseSsePayload({
      type: 'tool_result',
      tool: 'explain_unit_economics',
      result: { creditsPerUsd: 100 },
    });
    expect(events).toEqual([
      {
        type: 'tool_result',
        tool: 'explain_unit_economics',
        result: { creditsPerUsd: 100 },
      },
    ]);
  });

  it('parseSsePayload extracts calculator final events', () => {
    const events = parseSsePayload({
      type: 'final',
      userMessage: { id: 'u1' },
      assistantMessage: { id: 'a1' },
      toolResults: [],
    });
    expect(events[0]?.type).toBe('final');
  });

  it('consumeSseStream emits events for every chunk and flushes at end', async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hel'));
        controller.enqueue(encoder.encode('lo"}}]}\n\ndata: {"error":"boom"}\n\ndata: [DONE]\n'));
        controller.close();
      },
    });

    const events: string[] = [];
    await consumeSseStream(body, (event) => {
      events.push(`${event.type}:${'token' in event ? event.token : 'error' in event ? event.error : ''}`);
    });

    expect(events).toEqual(['token:Hello', 'error:boom', 'done:']);
  });
});

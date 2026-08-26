/**
 * Mac Studio Ollama tunnel helpers — native /api/ps and /api/generate for
 * model warm-up. OpenAI-compat chat uses resolveChatCompletionsUrl() instead.
 */

export function ollamaTunnelOrigin(): string {
  const raw = process.env.OLLAMA_TUNNEL_HOST?.trim() || 'https://ollama.tokenizin.com';
  return raw.replace(/\/+$/, '');
}

export interface OllamaRunningModel {
  name: string;
  model: string;
}

export async function listOllamaRunningModels(): Promise<OllamaRunningModel[]> {
  const response = await fetch(`${ollamaTunnelOrigin()}/api/ps`, { cache: 'no-store' });
  if (!response.ok) return [];
  const json = await response.json() as { models?: OllamaRunningModel[] };
  return json.models ?? [];
}

/** True when the requested tag is loaded in Ollama VRAM (GET /api/ps). */
export function ollamaModelIsRunning(requested: string, running: OllamaRunningModel[]): boolean {
  if (!requested) return false;
  const base = requested.split(':')[0];
  return running.some((entry) => {
    const candidates = [entry.name, entry.model];
    return candidates.some((name) => {
      if (name === requested) return true;
      if (name.startsWith(`${requested}:`)) return true;
      if (requested.startsWith(`${name}:`)) return true;
      return name.split(':')[0] === base;
    });
  });
}

export async function isOllamaModelLoaded(model: string): Promise<boolean> {
  const running = await listOllamaRunningModels();
  return ollamaModelIsRunning(model, running);
}

/**
 * Load model weights via native Ollama generate (1 token). Can take minutes
 * for large quants — run in the background (waitUntil), not in the HTTP response.
 */
export async function triggerOllamaModelWarm(model: string): Promise<void> {
  const response = await fetch(`${ollamaTunnelOrigin()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: ' ',
      stream: false,
      keep_alive: '15m',
      options: { num_predict: 1 },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail.slice(0, 200) || `Ollama warm failed (${response.status})`);
  }
}

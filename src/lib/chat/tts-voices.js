export const TTS_VOICE_IDS = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
export const DEFAULT_TTS_VOICE = 'alloy';
export const TTS_VOICE_STORAGE_KEY = 'redruby.ttsVoice';
export const TTS_VOICE_PROFILES = [
    { id: 'alloy', label: 'Alloy', description: 'Neutral and balanced' },
    { id: 'echo', label: 'Echo', description: 'Warm and conversational' },
    { id: 'fable', label: 'Fable', description: 'Expressive and clear' },
    { id: 'onyx', label: 'Onyx', description: 'Deep and authoritative' },
    { id: 'nova', label: 'Nova', description: 'Friendly and upbeat' },
    { id: 'shimmer', label: 'Shimmer', description: 'Soft and bright' },
];
export function isTtsVoiceId(value) {
    return TTS_VOICE_IDS.includes(value);
}
export function resolveTtsVoice(value) {
    return value && isTtsVoiceId(value) ? value : DEFAULT_TTS_VOICE;
}

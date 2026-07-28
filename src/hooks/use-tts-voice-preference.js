'use client';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TTS_VOICE, isTtsVoiceId, TTS_VOICE_STORAGE_KEY, } from '@/lib/chat/tts-voices';
export function useTtsVoicePreference() {
    const [voice, setVoiceState] = useState(DEFAULT_TTS_VOICE);
    useEffect(() => {
        try {
            const stored = globalThis.localStorage?.getItem(TTS_VOICE_STORAGE_KEY);
            if (stored && isTtsVoiceId(stored)) {
                setVoiceState(stored);
            }
        }
        catch {
            // ignore storage errors
        }
    }, []);
    const setVoice = useCallback((next) => {
        setVoiceState(next);
        try {
            globalThis.localStorage?.setItem(TTS_VOICE_STORAGE_KEY, next);
        }
        catch {
            // ignore storage errors
        }
    }, []);
    return [voice, setVoice];
}

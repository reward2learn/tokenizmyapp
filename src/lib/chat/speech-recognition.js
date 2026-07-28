export function getSpeechRecognitionCtor() {
    if (typeof globalThis === 'undefined')
        return null;
    const w = globalThis;
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
export function segmentsFromSpeechEvent(event) {
    const segments = [];
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
        segments.push({
            transcript: event.results[i][0].transcript,
            isFinal: event.results[i].isFinal,
        });
    }
    return segments;
}

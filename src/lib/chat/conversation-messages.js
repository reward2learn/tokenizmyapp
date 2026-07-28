import { MAX_EMBED_BYTES, MAX_EXTRACTED_TEXT_CHARS, } from '@/lib/chat/attachments';
/** Rough base64 → decoded-byte size estimate. */
function estimateBase64Bytes(base64) {
    return Math.floor((base64.length * 3) / 4);
}
function stripNul(value) {
    return value.split('\u0000').join('');
}
function sanitizeAttachment(attachment) {
    const clean = {
        name: stripNul(attachment.name),
        mimeType: attachment.mimeType,
        size: attachment.size,
        kind: attachment.kind,
    };
    if (attachment.extractedText) {
        clean.extractedText = stripNul(attachment.extractedText).slice(0, MAX_EXTRACTED_TEXT_CHARS);
    }
    // Drop base64 payloads that exceed the embed ceiling so we never persist
    // oversized blobs into the conversations JSON column.
    if (attachment.dataBase64 && estimateBase64Bytes(attachment.dataBase64) <= MAX_EMBED_BYTES) {
        clean.dataBase64 = attachment.dataBase64;
    }
    else if (attachment.dataBase64) {
        clean.truncated = true;
    }
    if (attachment.truncated)
        clean.truncated = true;
    return clean;
}
/** Strip NUL bytes Postgres JSON/text rejects; keep other Unicode intact. */
export function sanitizeConversationMessages(messages) {
    return messages.map((msg) => {
        const clean = {
            role: msg.role,
            content: stripNul(msg.content),
        };
        if (msg.attachments?.length) {
            clean.attachments = msg.attachments.map(sanitizeAttachment);
        }
        return clean;
    });
}

import { describe, expect, it } from 'vitest';
import {
  RELAY_STATE_MAX_AGE_S,
  RELAY_TICKET_MAX_AGE_S,
  signRelayState,
  verifyRelayState,
  signRelayTicket,
  verifyRelayTicket,
} from './google-relay';

const SECRET = 'test-relay-secret-0123456789abcdef';

describe('google-relay state', () => {
  it('round-trips a signed state payload', () => {
    const token = signRelayState(
      {
        appUrl: 'https://redrubybali-wellness-app.vercel.app',
        redirectTo: '/dashboard',
        nonce: 'abc123',
        clientId: '557317711673-x.apps.googleusercontent.com',
      },
      SECRET,
      1_700_000_000_000,
    );
    const payload = verifyRelayState(token, SECRET, 1_700_000_000_000);
    expect(payload).not.toBeNull();
    expect(payload!.appUrl).toBe('https://redrubybali-wellness-app.vercel.app');
    expect(payload!.redirectTo).toBe('/dashboard');
    expect(payload!.nonce).toBe('abc123');
    expect(payload!.clientId).toBe('557317711673-x.apps.googleusercontent.com');
    expect(payload!.exp).toBe(Math.floor(1_700_000_000_000 / 1000) + RELAY_STATE_MAX_AGE_S);
  });

  it('rejects a tampered payload', () => {
    const token = signRelayState(
      { appUrl: 'https://good-app.vercel.app', redirectTo: '/', nonce: 'n1', clientId: 'c1' },
      SECRET,
    );
    const [payloadB64, sig] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        appUrl: 'https://evil.example.com',
        redirectTo: '/',
        nonce: 'n1',
        clientId: 'c1',
        exp: Math.floor(Date.now() / 1000) + 600,
      }),
    ).toString('base64url');
    const tampered = tamperedPayload + '.' + sig;
    expect(verifyRelayState(tampered, SECRET)).toBeNull();
    expect(payloadB64).toBeTruthy();
    expect(sig).toBeTruthy();
  });

  it('rejects with the wrong secret', () => {
    const token = signRelayState(
      { appUrl: 'https://good-app.vercel.app', redirectTo: '/', nonce: 'n1', clientId: 'c1' },
      SECRET,
    );
    expect(verifyRelayState(token, 'other-secret')).toBeNull();
  });

  it('rejects an expired state', () => {
    const now = 1_700_000_000_000;
    const token = signRelayState(
      { appUrl: 'https://good-app.vercel.app', redirectTo: '/', nonce: 'n1', clientId: 'c1' },
      SECRET,
      now,
    );
    expect(verifyRelayState(token, SECRET, now + (RELAY_STATE_MAX_AGE_S + 60) * 1000)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyRelayState('', SECRET)).toBeNull();
    expect(verifyRelayState('not-a-token', SECRET)).toBeNull();
    expect(verifyRelayState('a.b.c', SECRET)).toBeNull();
  });
});

describe('google-relay ticket', () => {
  it('round-trips a signed ticket payload', () => {
    const token = signRelayTicket(
      {
        sub: 'google-12345',
        email: 'owner@redrubybali.com',
        name: 'Owner',
        picture: 'https://example.com/pic.png',
        redirectTo: '/dashboard',
      },
      SECRET,
      1_700_000_000_000,
    );
    const payload = verifyRelayTicket(token, SECRET, 1_700_000_000_000);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('google-12345');
    expect(payload!.email).toBe('owner@redrubybali.com');
    expect(payload!.name).toBe('Owner');
    expect(payload!.picture).toBe('https://example.com/pic.png');
    expect(payload!.redirectTo).toBe('/dashboard');
    expect(payload!.exp).toBe(Math.floor(1_700_000_000_000 / 1000) + RELAY_TICKET_MAX_AGE_S);
  });

  it('rejects a tampered ticket and a wrong secret', () => {
    const token = signRelayTicket(
      { sub: 'google-1', redirectTo: '/' },
      SECRET,
    );
    const [payloadB64] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: 'attacker', redirectTo: '/', exp: Math.floor(Date.now() / 1000) + 300 }),
    ).toString('base64url');
    const sig = token.split('.')[1];
    expect(verifyRelayTicket(tamperedPayload + '.' + sig, SECRET)).toBeNull();
    expect(verifyRelayTicket(token, 'other-secret')).toBeNull();
    expect(payloadB64).toBeTruthy();
  });

  it('rejects an expired ticket', () => {
    const now = 1_700_000_000_000;
    const token = signRelayTicket({ sub: 'google-1', redirectTo: '/' }, SECRET, now);
    expect(verifyRelayTicket(token, SECRET, now + (RELAY_TICKET_MAX_AGE_S + 60) * 1000)).toBeNull();
  });
});

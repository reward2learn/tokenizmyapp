import { describe, expect, it } from 'vitest';
import {
  TEMPLATE_ASSISTANT_PROFILES,
  resolveAssistantProfile,
  deriveAssistantProfile,
} from '@/domain/tenant/template-assistant-profiles';
import { TEMPLATE_CATALOG, type TemplateDefinition } from '@/domain/tenant/template-catalog';
import {
  parseAssistantProfile,
  NEUTRAL_ASSISTANT_PROFILE,
} from '@shared/lib/config/template-profile';

describe('built-in assistant profiles', () => {
  it('covers every template in the catalog', () => {
    // A template with no profile silently falls back to a derived one, which is
    // usable but generic. Catching the gap here is the point of the test.
    const missing = Object.keys(TEMPLATE_CATALOG).filter(
      (id) => !TEMPLATE_ASSISTANT_PROFILES[id],
    );
    expect(missing).toEqual([]);
  });

  it('gives each template a distinct persona', () => {
    // The bug being fixed was every template sharing one persona. Identical
    // roles across templates would be that bug returning by another route.
    const roles = Object.values(TEMPLATE_ASSISTANT_PROFILES).map((p) => p.role);
    expect(new Set(roles).size).toBe(roles.length);
  });

  it('never mentions the tenant whose data used to be hardcoded', () => {
    const serialized = JSON.stringify(TEMPLATE_ASSISTANT_PROFILES).toLowerCase();
    for (const leak of ['red ruby', 'taman bintang', 'bali', 'nightclub', 'idr']) {
      expect(serialized).not.toContain(leak);
    }
  });

  it('uses domain vocabulary rather than generic finance terms', () => {
    expect(TEMPLATE_ASSISTANT_PROFILES.hotel.keyMetrics).toContain('RevPAR');
    expect(TEMPLATE_ASSISTANT_PROFILES.restaurant.keyMetrics).toContain('covers');
    expect(TEMPLATE_ASSISTANT_PROFILES.manufacturing.keyMetrics).toContain('OEE');
  });

  it('keeps the healthcare assistant out of clinical judgement', () => {
    // This one is a safety property, not a style preference: an operations
    // assistant must not be nudged into interpreting patient data.
    const style = TEMPLATE_ASSISTANT_PROFILES.healthcare.answerStyle.join(' ').toLowerCase();
    expect(style).toContain('never interpret clinical data');
  });

  it('keeps the platform-admin assistant away from secrets', () => {
    const style = TEMPLATE_ASSISTANT_PROFILES['platform-admin'].answerStyle.join(' ').toLowerCase();
    expect(style).toContain('never disclose secrets');
  });
});

describe('resolveAssistantProfile', () => {
  const custom: TemplateDefinition = {
    ...TEMPLATE_CATALOG.default,
    id: 'custom-vet-clinic',
    label: 'Veterinary Clinic',
    description: 'Appointment and patient records for a veterinary practice.',
    source: 'custom',
  };

  it("prefers the template's own profile", () => {
    const authored = {
      role: 'veterinary practice analyst',
      domain: 'veterinary clinic operations',
      currency: 'EUR',
      keyMetrics: ['consults per day'],
      capabilities: ['review the appointment book'],
      answerStyle: ['Name the animal and owner.'],
    };
    expect(resolveAssistantProfile({ ...custom, assistant: authored })).toBe(authored);
  });

  it('falls back to the authored built-in profile', () => {
    expect(resolveAssistantProfile(TEMPLATE_CATALOG.hotel)).toBe(
      TEMPLATE_ASSISTANT_PROFILES.hotel,
    );
  });

  it('derives from the definition when nothing is authored', () => {
    // The important property: it describes THIS app. A stored custom template
    // created before personas existed must not inherit somebody else's.
    const derived = resolveAssistantProfile(custom);
    expect(derived.role).toContain('veterinary clinic');
    expect(derived.domain).toBe(custom.description);
    expect(derived.keyMetrics).toEqual([]);
  });

  it('does not invent metrics for an unknown domain', () => {
    // Guessing metrics produces confident nonsense; an empty list omits the
    // section from the prompt entirely.
    expect(deriveAssistantProfile(custom).keyMetrics).toHaveLength(0);
  });
});

describe('parseAssistantProfile', () => {
  it('returns the neutral profile for missing or malformed input', () => {
    expect(parseAssistantProfile(undefined)).toBe(NEUTRAL_ASSISTANT_PROFILE);
    expect(parseAssistantProfile('')).toBe(NEUTRAL_ASSISTANT_PROFILE);
    expect(parseAssistantProfile('{not json')).toBe(NEUTRAL_ASSISTANT_PROFILE);
    expect(parseAssistantProfile('[]')).toBe(NEUTRAL_ASSISTANT_PROFILE);
  });

  it('fills missing fields individually rather than discarding the whole profile', () => {
    // A partial profile is the normal case for an older stored template, not an
    // error case — the fields it does have must survive.
    const parsed = parseAssistantProfile(JSON.stringify({ role: 'baker', currency: 'GBP' }));
    expect(parsed.role).toBe('baker');
    expect(parsed.currency).toBe('GBP');
    expect(parsed.domain).toBe(NEUTRAL_ASSISTANT_PROFILE.domain);
    expect(parsed.answerStyle).toBe(NEUTRAL_ASSISTANT_PROFILE.answerStyle);
  });

  it('ignores non-string entries in list fields', () => {
    const parsed = parseAssistantProfile(
      JSON.stringify({ keyMetrics: ['covers', 42, null, '  ', 'average check'] }),
    );
    expect(parsed.keyMetrics).toEqual(['covers', 'average check']);
  });

  it('round-trips a real built-in profile through serialization', () => {
    // This is exactly what the deploy step does: JSON.stringify into an env var,
    // parse back inside the running app.
    const serialized = JSON.stringify(TEMPLATE_ASSISTANT_PROFILES.restaurant);
    expect(parseAssistantProfile(serialized)).toEqual(TEMPLATE_ASSISTANT_PROFILES.restaurant);
  });

  it('describes nothing in particular when nothing is known', () => {
    // Being vague is recoverable; confidently describing the wrong business is
    // the failure this whole change exists to prevent.
    const serialized = JSON.stringify(NEUTRAL_ASSISTANT_PROFILE).toLowerCase();
    for (const leak of ['red ruby', 'nightclub', 'idr', 'break-even']) {
      expect(serialized).not.toContain(leak);
    }
  });
});

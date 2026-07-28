import { Inngest } from 'inngest';
export const inngest = new Inngest({
    id: 'tokenizmyapp',
    name: 'TOKENIZMYAPP Orchestrator',
});
// Note: Handlers and workflows are imported directly in route.ts to avoid
// circular dependencies with files that import { inngest } from '@/lib/inngest'.
// The createFunction calls in those modules ensure auto-registration with Inngest.

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { provisionTenant } from '@/domain/workflows/tenant-provisioning';
import { vercelWebhookHandlers, tenantDeprovisioningWorkflow } from '@/lib/inngest';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    provisionTenant,
    tenantDeprovisioningWorkflow,
    ...vercelWebhookHandlers,
  ],
});

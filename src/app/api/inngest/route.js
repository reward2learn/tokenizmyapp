import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { provisionTenant } from '@/domain/workflows/tenant-provisioning';
import { tenantDeprovisioningWorkflow } from '@/lib/inngest/tenant-deprovisioning-workflow';
import { vercelWebhookHandlers } from '@/lib/inngest/vercel-webhook-handlers';
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        provisionTenant,
        tenantDeprovisioningWorkflow,
        ...vercelWebhookHandlers,
    ],
});

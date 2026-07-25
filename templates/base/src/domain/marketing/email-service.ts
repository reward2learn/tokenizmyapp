import { createClient } from '@/lib/db';


interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private client = createClient();

  async sendCampaign(campaignId: string): Promise<{ sent: number; failed: number }> {
    const campaign = await this.client.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new Error('Campaign not found');

    const subscribers = await this.client.subscriber.findMany({
      where: { status: 'active' },
      select: { email: true, name: true },
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      try {
        const result = await this.sendTransactional(
          sub.email,
          campaign.subject || campaign.name,
          { name: sub.name, body: campaign.body, campaignId: campaign.id },
        );
        if (result.success) {
          sent++;
          await this.client.campaignAnalytics.create({
            data: {
              campaignId,
              subscriberEmail: sub.email,
              sent: true,
              opened: false,
              clicked: false,
              converted: false,
            },
          });
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    await this.client.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'completed',
        sentAt: new Date(),
        sentCount: sent,
        failedCount: failed,
      },
    });

    return { sent, failed };
  }

  async sendTransactional(
    to: string,
    template: string,
    data: Record<string, unknown>,
  ): Promise<EmailSendResult> {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      // No Resend key configured — log to DB and return success
      await this.client.emailLog.create({
        data: {
          to,
          template,
          data: data as unknown as Record<string, unknown>,
          status: 'logged',
        },
      });
      return { success: true, messageId: 'logged' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@tokenizmyapp.com',
          to,
          subject: template,
          html: `<div>${(data.body as string) ?? ''}</div>`,
        }),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const result = await response.json();
      return { success: true, messageId: result.id };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async getCampaignStats(campaignId: string): Promise<{
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  }> {
    const stats = await this.client.campaignAnalytics.findMany({ where: { campaignId } });
    return {
      sent: stats.filter((s) => s.sent).length,
      opened: stats.filter((s) => s.opened).length,
      clicked: stats.filter((s) => s.clicked).length,
      converted: stats.filter((s) => s.converted).length,
    };
  }
}

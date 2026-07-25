import { BillingOverview } from '@/components/billing/billing-overview';
import { CreditTransactionList } from '@/components/billing/credit-transaction-list';
export const dynamic = 'force-dynamic';
export default function BillingPage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Billing</h1>
      <BillingOverview balance={0} />
      <h2>Recent Transactions</h2>
      <CreditTransactionList transactions={[]} />
    </main>
  );
}

import { CreditPackManager } from '@/components/billing/credit-pack-manager';
import { CreditTransactionList } from '@/components/billing/credit-transaction-list';
export const dynamic = 'force-dynamic';
export default function AdminBillingPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Billing Admin</h1>
      <h2>Credit Packs</h2>
      <CreditPackManager packs={[]} />
      <h2>All Transactions</h2>
      <CreditTransactionList transactions={[]} />
    </main>
  );
}

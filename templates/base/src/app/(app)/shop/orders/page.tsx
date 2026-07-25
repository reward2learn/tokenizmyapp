import { OrderManager } from '@/components/commerce/order-manager';

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <h1>My Orders</h1>
      <OrderManager orders={[]} />
    </main>
  );
}

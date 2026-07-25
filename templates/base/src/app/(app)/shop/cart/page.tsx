import { CartDrawer } from '@/components/commerce/cart-drawer';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <h1>Shopping Cart</h1>
      <CartDrawer open={true} onClose={() => {}} items={[]} />
    </main>
  );
}

import { CheckoutForm } from '@/components/commerce/checkout-form';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <h1>Checkout</h1>
      <CheckoutForm cartItems={[]} subtotalCents={0} onSubmit={() => {}} onCancel={() => {}} />
    </main>
  );
}

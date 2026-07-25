import { OrderSummary } from '@/components/commerce/order-summary';

export const dynamic = 'force-dynamic';

export default function BookingConfirmationPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }}>
      <h1>Booking Confirmed</h1>
      <OrderSummary order={{ id: '', orderNumber: '', status: 'pending', paymentStatus: 'pending', totalCents: 0, currency: 'IDR', items: [], createdAt: '' }} />
    </main>
  );
}

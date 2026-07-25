import { BookingCalendar } from '@/components/commerce/booking-calendar';
import { BookingForm } from '@/components/commerce/booking-form';

export const dynamic = 'force-dynamic';

export default function BookingPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <h1>Book a Service</h1>
      <BookingCalendar />
      <BookingForm productName="" productId="" onSubmit={() => {}} onCancel={() => {}} />
    </main>
  );
}

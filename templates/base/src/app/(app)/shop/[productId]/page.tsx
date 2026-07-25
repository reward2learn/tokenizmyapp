import { ProductDetail } from '@/components/commerce/product-detail';

export const dynamic = 'force-dynamic';

export default function ProductDetailPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <ProductDetail product={{ id: '', name: '', slug: '', priceCents: 0, currency: 'IDR' }} />
    </main>
  );
}

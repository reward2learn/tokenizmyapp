import { ProductGrid } from '@/components/commerce/product-grid';

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return (
    <main style={{ padding: '24px',  margin: '0 auto' }}>
      <h1>Shop</h1>
      <ProductGrid products={[]} />
    </main>
  );
}

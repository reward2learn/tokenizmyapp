import { redirect } from 'next/navigation';
import { getDefaultRoutePath } from '@/lib/navigation/default-route';

// Resolve the configured default route per request — never prerender the
// landing redirect at build time (the DB state can change at runtime).
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const defaultPath = await getDefaultRoutePath();
  redirect(defaultPath);
}

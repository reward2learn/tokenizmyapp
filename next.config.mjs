import path from 'node:path';
import { fileURLToPath } from 'node:url';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withWorkflow } from 'workflow/next';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  reactStrictMode: true,
  typedRoutes: false,
  typescript: {
    ignoreBuildErrors: true, // Bun workspace hoists duplicate next types; type-check runs separately via bun run type-check
  },
  async redirects() {
    return [];
  },
};

export default withWorkflow(withBundleAnalyzerConfig(nextConfig));

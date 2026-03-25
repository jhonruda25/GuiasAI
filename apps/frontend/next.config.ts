import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(currentDir, '../../'),
  turbopack: {
    root: currentDir,
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
});

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const monorepoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output bundles a minimal server for Docker/production.
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  // Force the Prisma query engine binary into the standalone bundle (Next's
  // tracer misses the .node engine otherwise).
  outputFileTracingIncludes: {
    "/**/*": [
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/*.node",
    ],
  },
  transpilePackages: ["@fameworld/db", "@fameworld/game-engine", "@fameworld/i18n"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default withNextIntl(nextConfig);

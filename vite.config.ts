import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { writeFileSync } from 'fs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env so we can use VITE_* vars at build time (e.g. for robots.txt)
  const env = loadEnv(mode, process.cwd(), '');

  const siteUrl   = env.VITE_SITE_URL           || 'https://marshaligndentalcare.in';
  const indexable = (env.VITE_SITE_INDEXABLE     || 'false').toLowerCase() === 'true';
  const robotsMeta = indexable
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, nofollow';

  process.env.VITE_ROBOTS_META = robotsMeta;

  return {
    plugins: [
      react(),

      // ── Inject VITE_ROBOTS_META into index.html at build time ─────────────
      {
        name: 'inject-robots-meta',
        transformIndexHtml(html) {
          return html.replace('%VITE_ROBOTS_META%', robotsMeta);
        },
      },

      // ── Build-time robots.txt generator ───────────────────────────────────
      // Writes public/robots.txt before the build so Vite copies it to dist/.
      {
        name: 'generate-robots-txt',
        buildStart() {
          const content = indexable
            ? `User-agent: *\nAllow: /\n\n# Sitemaps\nSitemap: ${siteUrl}/sitemap.xml\n`
            : `User-agent: *\nDisallow: /\n`;
          writeFileSync(
            path.resolve(process.cwd(), 'public/robots.txt'),
            content,
            'utf8',
          );
        },
      },
    ],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

    build: {
      // No source maps in any build — keeps the bundle lean and unexposed.
      sourcemap: false,
      minify: true,
    },

    esbuild: {
      // Strip console.* and debugger statements in production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  };
});

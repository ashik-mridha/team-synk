/**
 * API_PROXY_TARGET (server-side, set in the hosting dashboard) is the API's public URL, e.g.
 * https://teamsync-server.onrender.com. When set, the browser calls /api/auth/* and /api/v1/* on
 * THIS site and Next.js forwards them, so the session cookie is first-party and there is no CORS or
 * third-party-cookie problem for REST. Socket.io still connects straight to the API.
 * Rewrites are compiled at build time: change the variable, then redeploy.
 */
const target = (process.env.API_PROXY_TARGET ?? '').trim().replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the dev badge away from the sidebar (bottom-left) where it used to cover "Settings".
  devIndicators: { position: 'bottom-right' },
  async rewrites() {
    if (!target) return [];
    return [
      { source: '/api/auth/:path*', destination: `${target}/api/auth/:path*` },
      { source: '/api/v1/:path*', destination: `${target}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;

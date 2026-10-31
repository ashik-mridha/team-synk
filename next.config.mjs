/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the dev badge away from the sidebar (bottom-left) where it used to cover "Settings".
  devIndicators: { position: 'bottom-right' },
};

export default nextConfig;

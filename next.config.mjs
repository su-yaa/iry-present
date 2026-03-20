/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  devIndicators: {
    appIsrStatus: false, // Disables the static route indicator
    buildActivity: false, // Disables the build activity indicator
  },
};

export default nextConfig;

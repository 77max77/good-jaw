import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public', // PWA 설정
});

export default nextConfig;
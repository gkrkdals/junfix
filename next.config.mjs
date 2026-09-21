/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 배포용: 런타임에 필요한 파일만 .next/standalone 으로 추려서 출력
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

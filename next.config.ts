import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // 当执行 `next build` 时，将网站静态导出到 `out` 目录
  output: 'export',
  images: {
    // 静态导出模式下禁用默认 Image Optimization，否则 `next build` 会报错
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['tdesign-react'],

  // 本地开发时将所有 /v1/** 请求代理到 EdgeOne Pages Functions 本地服务（默认 8088）
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/v1/:path*',
          destination: 'http://localhost:8088/v1/:path*',
        },
      ];
    }
    // 生产 / 静态导出模式下不需要 rewrites
    return [];
  },
};

export default nextConfig;

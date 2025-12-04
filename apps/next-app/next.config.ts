import { resolve } from 'path';
import type { NextConfig } from 'next'

// Resolve project root directory and libs directory absolute paths
const rootDir = resolve(__dirname || process.cwd(), '../..');
const libsDir = resolve(rootDir, 'libs');

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig= {
  webpack(config: any) {
    // 修改 webpack 配置以处理 SVG 文件
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [{
        loader: '@svgr/webpack',
      }],
    });

    // 添加外部文件夹的解析路径
    config.resolve.alias = {
      ...config.resolve.alias,
      '@libs': libsDir
    };

    return config;
  },
  // 允许加载外部目录的图片
  images: {
    dangerouslyAllowSVG: true,
    domains: [],
  },
  // https://github.com/vercel/next.js/issues/50042
  serverExternalPackages: ['mjml', 'handlebars'],
  // Enable standalone mode for Docker deployment
  output: 'standalone',
  experimental: {
    // 允许导入外部目录
    externalDir: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;

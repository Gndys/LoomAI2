import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import type { NextConfig } from 'next'

import { config } from 'dotenv';

// 获取当前文件的目录
const __dirname = dirname(fileURLToPath(import.meta.url));
// 加载根目录的 .env 文件
config({ path: join(__dirname, '../../.env') });

// 解析项目根目录和libs目录的绝对路径
const rootDir = resolve(__dirname, '../..');
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
  serverExternalPackages: ['mjml'],
  experimental: {
    // 允许导入外部目录
    externalDir: true,
    nodeMiddleware: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;

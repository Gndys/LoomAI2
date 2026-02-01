# TinyShip

[中文](./README.md) | **English**

![Build Status](https://github.com/vikingmute/tinyship/actions/workflows/ci.yml/badge.svg)

🚀 A modern, full-featured monorepo starter kit for building SaaS applications with support for both domestic (China) and international markets.

## 📑 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [✨ Key Features](#-key-features)
  - [🏗️ Modern Architecture](#️-modern-architecture)
  - [🔐 Comprehensive Authentication](#-comprehensive-authentication)
  - [🌐 Global Ready](#-global-ready)
  - [📱 Communication Services](#-communication-services)
  - [🎨 Modern UI/UX](#-modern-uiux)
  - [💪 Core Features](#-core-features)
  - [🤖 AI Integration](#-ai-integration)
  - [🧠 AI Development Ready](#-ai-development-ready)
- [📦 Tech Stack](#-tech-stack)
- [🌟 Why TinyShip?](#-why-tinyship)

## 🚀 Getting Started

For detailed setup instructions and configuration guides, please refer to our [Start Guide](./docs/user-guide/overview.md).

## ✨ Key Features

### 🏗️ Modern Architecture
- **Flexible Monorepo Structure**: Simplified architecture using `libs` for shared code instead of complex packages
- **Dual Framework Support**: 
  - Next.js for React enthusiasts
  - Choose your preferred framework while maintaining the same powerful backend
- **Documentation Site (docs-app)**:
  - Static documentation site built with [Fumadocs](https://fumadocs.dev)
  - Supports docs, blogs, and static pages
  - Built-in i18n and full-text search
  - Static export, deployable to any CDN

### 🔐 Comprehensive Authentication
- **[Better-Auth](https://www.better-auth.com/) Integration**:
  - Email/Password authentication
  - Phone number verification with OTP
  - Multi-factor authentication (2FA)
  - Session management
  - Account linking
- **Multiple OAuth Providers**:
  - Google
  - GitHub
  - WeChat (微信登录)
  - Easily extensible for more providers

### 🌐 Global Ready
- **International Support**:
  - Built-in i18n support
  - Multi-language UI and email templates
  - Region-specific integrations
- **Payment Solutions**:
  - Stripe for global payments
  - WeChat Pay for Chinese market
  - Creem payment integration
  - **Dual Payment Model**: Traditional subscriptions + AI-era credit system
  - Complete credit consumption tracking and transaction history

### 📱 Communication Services
- **Email Service**:
  - Multiple provider support (Resend, SendGrid, SMTP)
  - Templated emails
  - Localized content
- **SMS Integration**:
  - Global providers (Twilio)
  - China-specific providers (Aliyun)
  - OTP and notification support

### 📦 Storage Services
- **Unified Storage Interface**:
  - Alibaba Cloud OSS
  - AWS S3
  - Cloudflare R2
  - Easy provider switching
- **Full Feature Support**:
  - File upload/download
  - Signed URL generation
  - Metadata management
  - Directory listing

### 🎨 Modern UI/UX
- **Rich Component Libraries**:
  - [shadcn/ui](https://ui.shadcn.com/) for Next.js
- **Styling**:
  - Tailwind CSS for utility-first styling
  - Consistent design system
- **Built-in Admin Panel**:
  - User management
  - Content management
  - Analytics dashboard

### 💪  Core Features
- **Type-Safe Validation with Zod**:
  - Schema-based validation throughout the application
  - Runtime type checking with TypeScript integration
  - API request/response validation
  - Form validation with detailed error messages
  - Custom validation rules
  - Automatic TypeScript type inference
- **Advanced Authorization**:
  - Role-based access control (RBAC)
  - Fine-grained permissions
  - Dynamic policy management
  - Resource-level access control
  - Flexible permission rules with CASL

### 🤖 AI Integration
- **AI Services**:
  - Vercel AI SDK integration
  - Multiple AI provider support
  - Easy to extend for custom AI features

### 🧠 AI Development Ready
- **Cursor Integration**:
  - Built-in Cursor rules for AI-assisted development
  - Intelligent code navigation and completion
  - Context-aware AI suggestions
- **AI-First Development**:
  - Structured codebase for AI understanding
  - Comprehensive documentation for AI tools
  - Ready-made prompts and templates
- **Enhanced Developer Experience**:
  - Quick project understanding with AI
  - Faster feature development
  - Intelligent code refactoring

## 📦 Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui & Magic UI
- [Zod](https://zod.dev/) for end-to-end type safety

### Documentation
- [Fumadocs](https://fumadocs.dev) documentation framework
- MDX content authoring
- Orama static search

### Backend
- Better-Auth
- CASL permissions
- PostgreSQL
- Drizzle ORM

### Services
- Email (Resend/SendGrid/SMTP)
- SMS (Aliyun/Twilio)
- Payments (Stripe/WeChat Pay/Creem)
- Credits System (Fixed/Dynamic consumption modes)
- Storage (Alibaba Cloud OSS/AWS S3/Cloudflare R2)
- AI Integration

## 🌟 Why TinyShip?

1. **Quick Start**: Get your SaaS up and running in minutes, not days
2. **Best Practices**: Built with modern tools and patterns
3. **Global + Local**: Support for both international and Chinese market requirements
4. **Framework Freedom**: Choose between React and Vue while keeping all the powerful features
5. **Production Ready**: Enterprise-grade security and scalability built-in
6. **AI-Powered Development**: Enhanced development experience with Cursor and AI tools

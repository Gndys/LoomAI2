# 云平台部署与通用配置

本指南介绍如何将 TinyShip 项目部署到各种云平台，以及通用的服务器配置。

## 📑 目录

- [☁️ 云平台部署](#️-云平台部署)
  - [Vercel 部署](#vercel-部署)
  - [Netlify 部署](#netlify-部署)
  - [Railway 部署](#railway-部署)
- [🔧 服务器配置](#-服务器配置)
  - [Nginx 反向代理](#nginx-反向代理)
  - [SSL 证书配置](#ssl-证书配置)
- [📊 性能优化](#-性能优化)
  - [缓存策略](#缓存策略)
  - [压缩配置](#压缩配置)
  - [安全配置](#安全配置)
- [🔍 监控与日志](#-监控与日志)
  - [应用监控](#应用监控)
  - [日志管理](#日志管理)
- [🚨 故障排除](#-故障排除)
  - [常见问题](#常见问题)
  - [监控脚本](#监控脚本)
- [🔧 环境管理](#-环境管理)
  - [多环境配置](#多环境配置)
  - [CI/CD 配置](#cicd-配置)

## ☁️ 云平台部署

### Vercel 部署

**Next.js 应用：**

1. **连接仓库**
   ```bash
   # 安装 Vercel CLI
   pnpm add -g vercel
   
   # 登录并部署
   vercel --cwd apps/next-app
   ```

2. **环境变量配置**
   在 Vercel 控制台设置环境变量，或使用命令行：
   ```bash
   vercel env add APP_BASE_URL
   vercel env add DATABASE_URL
   vercel env add BETTER_AUTH_SECRET
   ```

3. **项目配置**
   ```json
   {
     "buildCommand": "pnpm build:next",
     "outputDirectory": "apps/next-app/.next",
     "installCommand": "pnpm install",
     "framework": "nextjs"
   }
   ```

### Netlify 部署

**配置文件 `netlify.toml`：**

```toml
[build]
  base = "apps/next-app"
  publish = ".next"
  command = "pnpm build:next"

[build.environment]
  NODE_VERSION = "22"
  NPM_FLAGS = "--prefix=/dev/null"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Railway 部署

**配置文件 `railway.toml`：**

```toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "pnpm start:next"
  restartPolicyType = "never"

[env]
  NODE_ENV = "production"
```

## 🔧 服务器配置

### Nginx 反向代理

**基础配置：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**HTTPS 配置：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL 证书配置

**使用 Certbot 获取免费 SSL 证书：**

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 性能优化

### 缓存策略

**Nginx 缓存配置：**

```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
}

# API 路由缓存控制
location /api/ {
    proxy_pass http://localhost:7001;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

### 压缩配置

```nginx
# 启用 Gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json
    application/atom+xml
    image/svg+xml;
```

### 安全配置

```nginx
# 安全头部
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# 隐藏 Nginx 版本
server_tokens off;

# 限制请求大小
client_max_body_size 10M;
```

## 🔍 监控与日志

### 应用监控

**健康检查端点：**

- **Next.js**: `https://yourdomain.com/api/health`

**Nginx 健康检查配置：**

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

### 日志管理

**Nginx 日志配置：**

```nginx
# 自定义日志格式
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;
```

**日志轮转配置 `/etc/logrotate.d/nginx`：**

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

## 🚨 故障排除

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 502 Bad Gateway | 检查应用是否正常运行在 7001 端口 |
| SSL 证书错误 | 检查证书路径和权限，运行 `certbot renew` |
| 静态资源 404 | 检查 Nginx 配置和文件路径 |
| CORS 错误 | 配置正确的 CORS 头部 |
| 响应慢 | 启用压缩和缓存，检查数据库查询 |
| 内存不足 | 增加服务器内存或优化应用 |

### 监控脚本

**服务状态检查脚本：**

```bash
#!/bin/bash
# /usr/local/bin/check-service.sh

SERVICE_URL="http://localhost:7001/api/health"
SLACK_WEBHOOK="your-slack-webhook-url"

if ! curl -f -s $SERVICE_URL > /dev/null; then
    echo "Service is down!"
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 TinyShip service is down!"}' \
        $SLACK_WEBHOOK
    
    # 尝试重启服务
    pm2 restart tinyship-next
fi
```

**添加到 crontab：**

```bash
# 每分钟检查一次
* * * * * /usr/local/bin/check-service.sh
```

## 🔧 环境管理

### 多环境配置

**不同环境的 `.env` 文件：**

```bash
# .env.staging
NODE_ENV=staging
APP_BASE_URL=https://staging.yourdomain.com
DATABASE_URL=postgresql://user:password@staging-db:5432/tinyship_staging

# .env.production
NODE_ENV=production
APP_BASE_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:password@prod-db:5432/tinyship_production
```

### CI/CD 配置

**GitHub Actions 示例：**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Build application
        run: pnpm build:next
        
      - name: Deploy to server
        run: |
          # 部署脚本
          rsync -avz --delete ./ user@server:/path/to/app/
          ssh user@server 'pm2 restart tinyship-next'
```

---

选择适合的部署平台和配置，确保应用的高可用性、安全性和性能。定期监控和维护是成功部署的关键。 

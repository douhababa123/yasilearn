# 阿里云服务器部署说明（基于当前代码）

本文档基于当前仓库代码分析，说明如何在阿里云 ECS 上部署该应用，以及需要准备的数据库结构与配置。后端为 Node.js + Express，前端为 Vite 构建的 React 应用，数据库使用 PostgreSQL。请参考 `server.js` 中的连接配置与建表逻辑。 【F:server.js†L1-L171】

## 1. 服务器准备（阿里云 ECS）

建议环境：
- 操作系统：Ubuntu 20.04+ 或 CentOS 7+（任一）
- Node.js：18.x 或以上
- PostgreSQL：13.x 或以上

必需端口（根据安全组放行）：
- 前端：如果使用 Vite 预览/开发模式，默认 5173；如果生产静态托管可不需要开放 5173
- 后端 API：3001
- PostgreSQL：5432（仅服务器内部访问即可，不建议对公网开放）

## 2. 拉取代码与安装依赖

```bash
git clone <你的仓库地址>
cd yasilearn
npm install
```

项目提供的脚本在 `package.json` 中，开发与生产运行方式如下：【F:package.json†L1-L23】
- `npm run dev`：同时启动后端与前端开发服务器
- `npm run server`：仅启动后端 API（`node server.js`）
- `npm run build`：构建前端静态资源（Vite）

## 3. 数据库准备（PostgreSQL）

### 3.1 连接配置

后端使用 `DATABASE_URL` 环境变量连接数据库，如果未设置，则使用以下默认连接字符串：【F:server.js†L12-L18】

```
postgres://postgres:mysecretpassword@localhost:5432/ielts_db
```

建议在阿里云服务器上设置环境变量：

```bash
export DATABASE_URL="postgres://<user>:<password>@127.0.0.1:5432/ielts_db"
```

### 3.2 需要创建的数据库与表

应用会在启动时自动创建所需表（如果不存在），因此只需先创建数据库即可。建表逻辑在 `server.js` 的 `initDB` 中完成。 【F:server.js†L24-L66】

需要的数据库：
- `ielts_db`（名称可自定义，但需与 `DATABASE_URL` 保持一致）

应用会自动创建以下表：
1. **vocabulary**
   - `id` SERIAL PRIMARY KEY
   - `word` TEXT UNIQUE NOT NULL
   - `phonetic` TEXT
   - `definition` TEXT
   - `image_url` TEXT
   - `difficulty` INTEGER
   - `tags` TEXT[]
   - `created_at` TIMESTAMP DEFAULT NOW()【F:server.js†L30-L42】

2. **examples**
   - `id` SERIAL PRIMARY KEY
   - `vocab_id` INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE
   - `en_sentence` TEXT
   - `cn_sentence` TEXT【F:server.js†L44-L51】

3. **study_progress**
   - `vocab_id` INTEGER PRIMARY KEY REFERENCES vocabulary(id) ON DELETE CASCADE
   - `status` TEXT DEFAULT 'new'
   - `interval_minutes` INTEGER DEFAULT 0
   - `ease_factor` FLOAT DEFAULT 2.5
   - `review_count` INTEGER DEFAULT 0
   - `last_reviewed_at` TIMESTAMP
   - `next_review_at` TIMESTAMP DEFAULT NOW()【F:server.js†L53-L64】

> 注意：若数据库连接失败，后端会切换为“内存模式”，数据不会持久化。请确保 PostgreSQL 可连接。 【F:server.js†L71-L82】

## 4. 启动服务

### 4.1 开发/测试方式

```bash
npm run dev
```

此模式会同时启动：
- 前端 Vite 服务器（默认 5173）
- 后端 API（3001，绑定 0.0.0.0）【F:server.js†L208-L212】

### 4.2 生产部署建议

1) 构建前端：
```bash
npm run build
```

2) 启动后端：
```bash
npm run server
```

3) 通过 Nginx 反向代理：
   - 代理 `/api` 到 `http://127.0.0.1:3001`
   - 将前端构建产物（`dist/`）作为静态资源目录

## 5. 与中国大陆网络相关的注意事项

前端入口页 `index.html` 已去除 Google Fonts 引用，避免访问 `fonts.googleapis.com` 与 `fonts.gstatic.com`。 【F:index.html†L8-L41】

如需进一步排查第三方资源，请在页面代码与资源引用中检查是否包含 Google 域名或其他在国内不可访问的外链。

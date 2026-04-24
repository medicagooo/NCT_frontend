# N·C·T

<div align="center">
  <p><strong>NO CONVERSION THERAPY</strong></p>
  <p>用于记录、整理与公开展示“扭转治疗”相关机构与经历信息的多语言站点前端。</p>
  <p>
    <a href="./README.md"><strong>简体中文</strong></a> ·
    <a href="./README.zh-TW.md">繁體中文</a> ·
    <a href="./README.en.md">English</a>
  </p>
  <p>
    <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white">
    <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
    <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
    <img alt="Static Content Snapshots" src="https://img.shields.io/badge/Static-Content%20Snapshots-0F766E">
  </p>
</div>

> 更新说明（2026-04-23）：当前根目录 `No-Torsion` 已经是独立的 `Vite + React` 静态前端项目。旧版 `Express + EJS + Workers` 已迁到同级 `../NCT_old`；表单、翻译、数据写入等后端能力请配合同级 `../nct-api-sql` 与 `../nct-api-sql-sub` 使用。

## 项目定位

`No-Torsion` 现在负责的是“前端展示壳层”，不是后端服务：

- 渲染 `/`、`/map`、`/blog`、`/port/:id`、`/privacy` 等前端路由
- 在构建阶段生成 `public/content/*` 静态快照
- 读取公开地图数据并在浏览器中展示
- 在配置 `VITE_NCT_SUB_FORM_URL` 时，把 `/form` 入口跳转到 `nct-api-sql-sub` 的独立表单页
- 在配置 `VITE_NCT_SUB_FORM_URL` 时，复用同一后端的 `/api/no-torsion/translate-text` 处理英文博客正文和非简中记录详情的运行时翻译

当前根目录 **不再** 提供下列能力：

- `Express + EJS` 页面服务
- Cloudflare Worker 后端
- 表单提交写入 API
- 机构修正提交 API
- `/api/frontend-runtime` 这类运行时 token 接口

如果你仍然需要上述能力，请使用：

- [`../NCT_old`](../NCT_old)：旧版 `Express + EJS + Workers`
- [`../nct-api-sql`](../nct-api-sql)：主库、公开 JSON、管理台、主推/回拉同步
- [`../nct-api-sql-sub`](../nct-api-sql-sub)：独立表单页、No-Torsion 后端 API、翻译与上报

## 当前功能

| 模块 | 说明 |
| --- | --- |
| 首页 / 门户 | 单页前端壳层，负责导航、语言切换与页面路由 |
| 地图浏览 | 读取 `VITE_NCT_API_SQL_PUBLIC_DATA_URL` 指向的公开 JSON；默认回退到仓库内 `public/content/map-data.json` |
| 博客内容 | 构建时把 Markdown 转成静态 JSON / HTML，前端按需加载 |
| 多语言 | 通过 `site-bootstrap.json` 下发词条、语言选项和默认语言 |
| 表单入口 | `/form` 仅作为入口页；当配置了 `VITE_NCT_SUB_FORM_URL` 时，会跳转到 `nct-api-sql-sub` 的独立表单页 |
| 运行时翻译 | 仅在配置了 `VITE_NCT_SUB_FORM_URL` 时启用，并复用其同源翻译 API |

## 兼容说明

仓库里仍保留了部分迁移期前端逻辑，方便与旧链路兼容，但要注意：

- `/form` 在当前项目里不是本地提交流程，而是前往外部后端表单页的跳转入口
- 前端仍保留了机构修正页面 UI
- 机构修正页面提交时依赖同源的 `/api/frontend-runtime`、`/map/correction/submit` 或 `/correction/submit`
- 这些接口 **并不在当前项目中实现**

也就是说，直接把 `No-Torsion` 当作“纯静态站点”部署时：

- 地图、博客、隐私页、文章详情页可以正常工作
- `/form` 只有在配置 `VITE_NCT_SUB_FORM_URL` 后才会变成可用入口
- 机构修正提交流程需要额外提供兼容后端，或者继续使用 `NCT_old`

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 前端框架 | Vite 8 + React 19 |
| 地图展示 | Leaflet |
| 内容构建 | Node.js 脚本生成静态 JSON 快照 |
| 内容来源 | `blog/*.md`、`data.json`、`friends.json`、公开地图 JSON |
| 部署形态 | 静态站点 |

## 仓库结构

```text
.
├── frontend/src/              # React 前端入口、路由与页面逻辑
├── public/content/            # 构建期生成的静态快照
├── blog/                      # Markdown 博客源文件
├── config/                    # i18n、地区选项、运行时配置
├── scripts/                   # 构建期内容生成与配置工具
├── tests/                     # 前端 / 构建脚本测试
├── vite.config.js             # Vite 配置
└── index.html                 # SPA 宿主页
```

## 环境变量

复制环境文件：

```bash
cp .env.example .env
```

[`./.env.example`](./.env.example) 已按修改必要性排序列出当前项目会读取的全部项目级环境变量，以及通常由平台注入的运行时标记。

### 必填环境变量

当前项目没有绝对必填环境变量；把它当作纯静态站点时，零配置也能启动。

按功能视为必填：

- `VITE_NCT_API_SQL_PUBLIC_DATA_URL`：当你希望前端直接读取 `nct-api-sql` 的实时公开数据，而不是仓库内快照时
- `VITE_NCT_SUB_FORM_URL`：当你希望启用 `/form` 跳转和运行时翻译时

关键变量如下：

| 变量 | 说明 |
| --- | --- |
| `VITE_NCT_API_SQL_PUBLIC_DATA_URL` | 公开地图 JSON 地址；默认 `/content/map-data.json` |
| `VITE_NCT_SUB_FORM_URL` | `nct-api-sql-sub` 的独立表单页地址，例如 `https://sub.example.com/form` |

补充说明：

- `VITE_*` 变量会暴露到浏览器运行时
- 是否配置 `VITE_NCT_SUB_FORM_URL` 会决定前端部署模式：有值视为 `hono`，空值视为 `api-only`
- 构建时地图快照固定使用仓库内的 `public/content/map-data.json`，不再通过环境变量刷新远端快照
- `RUNTIME_TARGET` / `CF_PAGES` 通常由运行平台注入，本地一般不需要手动设置
- [`.dev.vars.example`](./.dev.vars.example) 现在只用于说明根目录不再部署 Worker 后端

## 快速开始

```bash
cd No-Torsion
npm install
cp .env.example .env
npm run dev
```

默认开发地址：

- Vite 开发服务器：`http://127.0.0.1:5173`

如果希望接入完整链路，通常还需要同时启动：

- `../nct-api-sql`：提供公开地图 JSON
- `../nct-api-sql-sub`：提供独立表单页和翻译 API

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run frontend:prepare-content` | 生成 `public/content/*` 静态快照 |
| `npm run frontend:build` | 先生成内容快照，再执行前端构建 |
| `npm run frontend:preview` | 本地预览构建产物 |
| `npm run test:unit` | 运行 Node 单元测试 |
| `npm test` | 运行测试并执行一次构建检查 |

说明：

- `npm run dev:workers` 和 `npm run deploy:workers` 现在只输出迁移提示，不会真正启动或部署后端

## 构建期静态内容

`npm run frontend:prepare-content` 会生成这些文件：

- `public/content/site-bootstrap.json`
- `public/content/area-selector.json`
- `public/content/blog/index.json`
- `public/content/blog/articles/*.json`
- `public/content/map-data.json`（仅在配置远端快照源，或仓库内已有现成快照时使用）

这让前端在“无自带后端”的前提下，仍然可以直接展示：

- 地图数据
- 多语言词条
- 博客列表与文章正文

## 部署

当前项目适合部署到任意静态托管平台，例如 Cloudflare Pages、Netlify、Vercel 静态输出或 Nginx 静态目录。

构建命令：

```bash
npm run frontend:build
```

发布目录：

```text
dist/
```

仓库已包含：

- [`public/_redirects`](./public/_redirects)：把前端路由回退到 `index.html`
- [`404.html`](./404.html)：静态托管下的兜底页面

## README 核对结果

本次核对后确认：

- `No-Torsion` 的实际职责是“静态前端壳层”，不是旧版全栈服务
- 旧 README 中大量 `Express / EJS / Workers / D1` 说明已经不再适用于当前根目录
- 当前文档已按现有代码、脚本与环境变量更新为前端项目视角

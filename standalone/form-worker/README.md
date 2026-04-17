# Standalone Form Worker

这个目录是独立表单填写页的专用 Workers 入口包。它会把表单页面直接挂在 `/`，并复用主仓库中的服务端校验、地区联动、自动补全和提交逻辑。

## 目录内容

- `worker.mjs`：Cloudflare Workers 入口
- `wrangler.jsonc`：专用 Workers 配置
- `.dev.vars.example`：本地开发变量示例
- `package.json`：独立调试 / 部署脚本

## 本地调试

1. 在当前目录复制 `.dev.vars.example` 为 `.dev.vars`
2. 填入至少这些变量：
   - `FORM_PROTECTION_SECRET`
   - `FORM_ID` 或 `FORM_ID_ENCRYPTED`
   - `PUBLIC_MAP_DATA_URL` 或 `GOOGLE_SCRIPT_URL`
3. 运行：

```bash
npm run dev
```

或者从仓库根目录运行：

```bash
npm run dev:workers:standalone-form
```

## 部署

```bash
npm run deploy
```

或者从仓库根目录运行：

```bash
npm run deploy:workers:standalone-form
```

## 说明

- 这个包使用了根目录的源码、模板、D1 migrations 和静态资源，但部署入口、Wrangler 配置和本地 `.dev.vars` 都独立放在这里。
- `wrangler.jsonc` 通过 `base_dir` 指向仓库根目录，只把独立表单实际需要的模板和静态文件打进 bundle。
- Cloudflare 文档说明：`base_dir` 会决定 `rules` 的匹配根目录，`.dev.vars` 需要与 Wrangler 配置文件位于同一目录。

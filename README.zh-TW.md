# N·C·T

<div align="center">
  <p><strong>NO CONVERSION THERAPY</strong></p>
  <p>用於記錄、整理與公開展示「扭轉治療」相關機構與經歷資訊的多語言站點前端。</p>
  <p>
    <a href="./README.md">简体中文</a> ·
    <a href="./README.zh-TW.md"><strong>繁體中文</strong></a> ·
    <a href="./README.en.md">English</a>
  </p>
  <p>
    <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white">
    <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
    <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
    <img alt="Static Content Snapshots" src="https://img.shields.io/badge/Static-Content%20Snapshots-0F766E">
  </p>
</div>

> 更新說明（2026-04-23）：目前根目錄 `No-Torsion` 已經是獨立的 `Vite + React` 靜態前端專案。舊版 `Express + EJS + Workers` 已遷到同級 `../NCT_old`；表單、翻譯、資料寫入等後端能力請搭配同級 `../nct-api-sql` 與 `../nct-api-sql-sub` 使用。

## 專案定位

`No-Torsion` 現在負責的是「前端展示殼層」，不是後端服務：

- 渲染 `/`、`/map`、`/blog`、`/port/:id`、`/privacy` 等前端路由
- 在建置階段產生 `public/content/*` 靜態快照
- 讀取公開地圖資料並在瀏覽器中展示
- 在設定 `VITE_NCT_SUB_FORM_URL` 時，把 `/form` 入口導向 `nct-api-sql-sub` 的獨立表單頁
- 在設定 `VITE_NCT_SUB_FORM_URL` 時，重用同一個後端的 `/api/no-torsion/translate-text` 處理英文部落格正文與非簡中記錄詳情的執行期翻譯

目前根目錄 **不再** 提供下列能力：

- `Express + EJS` 頁面服務
- Cloudflare Worker 後端
- 表單提交寫入 API
- 機構修正提交 API
- `/api/frontend-runtime` 這類執行期 token 介面

如果你仍需要上述能力，請使用：

- [`../NCT_old`](../NCT_old)：舊版 `Express + EJS + Workers`
- [`../nct-api-sql`](../nct-api-sql)：母庫、公開 JSON、管理台、主推/回拉同步
- [`../nct-api-sql-sub`](../nct-api-sql-sub)：獨立表單頁、No-Torsion 後端 API、翻譯與上報

## 目前功能

| 模組 | 說明 |
| --- | --- |
| 首頁 / 入口 | 單頁前端殼層，負責導覽、語言切換與頁面路由 |
| 地圖瀏覽 | 讀取 `VITE_NCT_API_SQL_PUBLIC_DATA_URL` 指向的公開 JSON；預設回退到 `public/content/map-data.json` |
| 部落格內容 | 建置時把 Markdown 轉成靜態 JSON / HTML |
| 多語言 | 透過 `site-bootstrap.json` 下發詞條、語言選項與預設語言 |
| 表單入口 | `/form` 只是入口頁；當設定 `VITE_NCT_SUB_FORM_URL` 時，會導向 `nct-api-sql-sub` 的獨立表單頁 |
| 執行期翻譯 | 只有在設定 `VITE_NCT_SUB_FORM_URL` 時才會啟用 |

## 相容性說明

倉庫裡仍保留了部分遷移期前端邏輯，方便與舊鏈路相容，但要注意：

- `/form` 在目前專案裡不是本地提交流程，而是前往外部後端表單頁的導向入口
- 前端仍保留了機構修正頁面的 UI
- 機構修正頁面提交時依賴同源的 `/api/frontend-runtime`、`/map/correction/submit` 或 `/correction/submit`
- 這些介面 **並沒有** 在目前專案中實作

也就是說，直接把 `No-Torsion` 當作「純靜態站點」部署時：

- 地圖、部落格、隱私頁、文章詳情頁都可以正常工作
- `/form` 只有在設定 `VITE_NCT_SUB_FORM_URL` 後才會變成可用入口
- 機構修正提交流程仍需要額外提供相容後端，或繼續使用 `NCT_old`

## 技術棧

| 類別 | 選型 |
| --- | --- |
| 前端框架 | Vite 8 + React 19 |
| 地圖展示 | Leaflet |
| 內容建置 | Node.js 腳本產生靜態 JSON 快照 |
| 內容來源 | `blog/*.md`、`data.json`、`friends.json`、公開地圖 JSON |
| 部署形態 | 靜態站點 |

## 倉庫結構

```text
.
├── frontend/src/              # React 入口、路由與頁面邏輯
├── public/content/            # 建置期生成的靜態快照
├── blog/                      # Markdown 文章來源
├── config/                    # i18n、地區選項、執行時配置
├── scripts/                   # 內容生成與配置輔助腳本
├── tests/                     # 前端 / 建置腳本測試
├── vite.config.js             # Vite 設定
└── index.html                 # SPA 宿主頁
```

## 環境變數

建立本地環境檔：

```bash
cp .env.example .env
```

[`./.env.example`](./.env.example) 已按修改必要性排序列出目前專案會讀取的全部專案級環境變數，以及通常由平台注入的執行期標記。

### 必填環境變數

目前專案沒有絕對必填環境變數；若把它當成純靜態站點，零配置也能啟動。

按功能視為必填：

- `VITE_NCT_API_SQL_PUBLIC_DATA_URL`：當你希望前端直接讀取 `nct-api-sql` 的即時公開資料，而不是倉庫內快照時
- `VITE_NCT_SUB_FORM_URL`：當你希望啟用 `/form` 跳轉與執行期翻譯時

關鍵變數如下：

| 變數 | 說明 |
| --- | --- |
| `VITE_NCT_API_SQL_PUBLIC_DATA_URL` | 公開地圖 JSON 位址；預設 `/content/map-data.json` |
| `VITE_NCT_SUB_FORM_URL` | `nct-api-sql-sub` 的獨立表單頁位址，例如 `https://sub.example.com/form` |

補充說明：

- `VITE_*` 變數會暴露到瀏覽器執行時
- 是否設定 `VITE_NCT_SUB_FORM_URL` 會決定前端部署模式：有值視為 `hono`，空值視為 `api-only`
- 建置期地圖快照固定使用倉庫內的 `public/content/map-data.json`，不再透過環境變數刷新遠端快照
- `RUNTIME_TARGET` / `CF_PAGES` 通常由執行平台注入，本地開發一般不需要手動設定
- [`.dev.vars.example`](./.dev.vars.example) 現在只用來提示根目錄不再部署 Worker 後端

## 快速開始

```bash
cd No-Torsion
npm install
cp .env.example .env
npm run dev
```

預設開發位址：

- Vite 開發伺服器：`http://127.0.0.1:5173`

如果想跑完整鏈路，通常還會同時啟動：

- `../nct-api-sql`：提供公開地圖資料
- `../nct-api-sql-sub`：提供獨立表單頁與翻譯 API

## 常用命令

| 命令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run frontend:prepare-content` | 生成 `public/content/*` 靜態快照 |
| `npm run frontend:build` | 先生成內容快照，再執行前端建置 |
| `npm run frontend:preview` | 本地預覽建置產物 |
| `npm run test:unit` | 執行 Node 單元測試 |
| `npm test` | 執行測試並做一次建置檢查 |

說明：

- `npm run dev:workers` 與 `npm run deploy:workers` 現在只輸出遷移提示，不會真的啟動或部署後端

## 建置期靜態內容

`npm run frontend:prepare-content` 會生成：

- `public/content/site-bootstrap.json`
- `public/content/area-selector.json`
- `public/content/blog/index.json`
- `public/content/blog/articles/*.json`
- `public/content/map-data.json`（僅在設定遠端快照來源，或重用倉庫內現有快照時使用）

這讓前端在「沒有自帶後端」的前提下，仍可直接展示：

- 地圖資料
- 多語言詞條
- 部落格列表與文章正文

## 部署

目前專案適合部署到任意靜態託管平台，例如 Cloudflare Pages、Netlify、Vercel 靜態輸出或 Nginx 靜態目錄。

建置命令：

```bash
npm run frontend:build
```

發布目錄：

```text
dist/
```

倉庫已內建：

- [`public/_redirects`](./public/_redirects)：把前端路由回退到 `index.html`
- [`404.html`](./404.html)：靜態託管下的兜底頁

## README 核對結果

本次核對後確認：

- `No-Torsion` 的實際職責是「靜態前端殼層」，不是舊版全端服務
- 舊 README 中大量 `Express`、`EJS`、`Workers`、`D1` 說明已不再適用於目前根目錄
- 目前文檔已依照現有程式碼、腳本與環境變數更新為前端專案視角

---
description: Vue 3 + Vite 菁英特遣隊開發與自動化部署循環 (Elite Squad Development & Deployment Cycle)
---

# Vue-Vite-Elite-Squad & Deployment Cycle

此工作流程自動化執行 Vue 3 專案的架構審查、UI 優化、SEO 注入、本地視覺驗證、智慧提交以及最終的線上部署與通知。

## 前置作業 (Prerequisites)

- 確保 `.env` 已正確設定（包含 `TELEGRAM_BOT_TOKEN` 和 `TELEGRAM_CHAT_ID`）。
- 開發環境預設為 macOS，並使用 Node.js / npm 工具鏈。

---

## 第一階段：開發與深度優化 (Development & Optimization)

### 1. 架構與多語系審查 (Architecture & i18n Strategy)

- **結構**: 檢視 Vue 3 (Composition API) + Vite 專案結構。
- **路由**: 驗證 Path-based 路由策略（如 `/zh-TW/timestamp`）與 Vite-SSG 預渲染配置。
- **規範**: 確保 TypeScript 與 ESLint 規範被嚴格遵守。

### 2. UI 實作與視覺重構 (UI Implementation)

- **RWD 適配**: 針對 Mac 開發環境與多裝置（完美相容如 Flip 5 修長螢幕與 iPhone 15 Pro Max 大螢幕）進行極致的響應式適配。
- **風格準則**: 所有輸出的程式碼、UI 文案與提示訊息，必須絕對遵守「**簡潔、專業、優雅**」的風格。嚴禁冗贅或不專業的用語。
- **穩定性**: 確保多語系切換時 UI 佈局穩定不跑版。

### 3. 搜尋引擎與 AI 檢索優化 (SEO, GEO & AEO)

- **SEO**: 依據語系動態注入 Meta Tags，並落實語意化 HTML (`<article>`, `<section>`)。
- **GEO**: 為 AI 爬蟲注入高知識密度的上下文文本 (Contextual Content)。
- **AEO**: 在 `<head>` 配置 Schema.org (`JSON-LD`)，並建立直述句 Q&A 區塊以觸發精選摘要。

---

## 第二階段：自動化驗證與部署 (Validation & Deployment Cycle)

### 4. 全面專案檢查 (Comprehensive Project Check)

執行完整的檢查套件，包含 Linting、測試 (Vitest)、安全性審計和重複程式碼檢測。

```bash
npm run check-all
```

> [!IMPORTANT]
> 若此步驟失敗，Agent 需進入「迭代修復循環」(步驟 6)。

### 5. AI 視覺驗證 (AI Visual Verification)

啟動本地伺服器並使用無頭瀏覽器 (Headless Browser) 進行深層 DOM 檢查。

```bash
npm run dev
// turbo
# Agent Action: 使用內建瀏覽器工具造訪 http://localhost:5173
```

> **Agent 驗證項目**：
>
> 1. **環境檢查**: 確保 `#app` 與核心狀態載入成功。
> 2. **雙平台截圖**:
>    - Desktop: `1280x800`
>    - Mobile: `375x667`
>    - 存入: `./artifacts/screenshots/`
> 3. **Console 監控**: 讀取 `browser.logs`，若包含 `Uncaught ReferenceError` 或 `Vue warn` 則判定失敗。

### 6. 迭代修復循環與止損機制 (Iterative Fix Cycle & Safeguard)

若在步驟 4 或 5 發現問題：

1. **自動修復**: Agent 分析錯誤並修改程式碼。
2. **重試**: 重新執行 `npm run check-all` 或視覺檢查。
3. **安全閥 (safeguard)**：**最多重複修復 3 次**。若超過 3 次仍未通過，強制停止並發送 Telegram 錯誤警報要求人類介入，避免無窮迴圈。

### 7. 智慧 Git 提交 (Smart Git Commit)

所有檢查通過後，遵循 **Conventional Commits** 規範進行版本控制。

```bash
git add .
# Agent Action: 分析變更內容並生成語意化 Commit 訊息
# 格式: <type>(<scope>): <subject> (例如: refactor(ui): optimize timestamp input for mobile)
git commit -m "<generated_message>"
git push origin main
```

### 8. 優雅通知推送 (Refined Notification)

若全線流程順利完成，透過腳本發送具備高質感的 Markdown 格式通知。

```bash
# Agent Action: 執行通知腳本
node scripts/notify-telegram.js "SUCCESS" "🚀 **部署成功！**" "$(git rev-parse --short HEAD)"
```

## 全域錯誤處理 (Global Error Handling)

若在核心節點發生無法自動修復的致命錯誤：

1. **停止執行**：立即鎖定工作流程。
2. **警報發送**："🚨 **部署失敗** 於步驟 [Step Name]。請檢查 `./artifacts` 中的截圖與日誌。"

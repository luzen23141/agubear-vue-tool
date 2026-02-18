---
description: Automated Deployment Cycle with Quality Checks & Verification (自動化部署與品質驗證流程)
---

# 部署循環工作流程 (Deployment Cycle Workflow)

此工作流程自動化應用程式的檢查、修復、部署和驗證過程。

## 前置作業 (Prerequisites)

- 確保 `.env` 已正確設定。
- 確保 `TELEGRAM_BOT_TOKEN` 和 `TELEGRAM_CHAT_ID` 可用 (或已寫死在 skill 中)。

## 工作流程步驟 (Workflow Steps)

### 1. 全面專案檢查 (Comprehensive Project Check)

執行完整的檢查套件，包括 Linting、測試、安全性審計和重複程式碼檢測。

```bash
npm run check-all
```

> [!IMPORTANT]
> 如果此步驟失敗，工作流程應暫停或停止。
> **行動**：如果需要人工介入，請發送 Telegram 通知。

---

### 2. AI 視覺驗證 (AI Visual Verification)

Agent 需執行無頭瀏覽器進行深層檢查。

```bash
npm run dev
// turbo
# Agent Action: Use browser tool to visit http://localhost:5173
```

> **Agent 驗證項目**：
>
> 1. **環境檢查**: 確保 `window.__INITIAL_STATE__` 或關鍵 DOM (`#app`) 存在。
> 2. **雙平台截圖**:
>    - Desktop: `1280x800`
>    - Mobile: `375x667`
>    - 存入: `./artifacts/screenshots/`
> 3. **Console 監控**: 讀取 `browser.logs`，若含 `Uncaught ReferenceError` 則判定失敗。

---

### 3. 迭代修復循環 (Iterative Fix Cycle)

如果在步驟 1 或 2 中發現問題：

1. 修改程式碼中的問題。
2. 重新執行 `npm run check-all`。
3. 重複此步驟，直到所有檢查通過且視覺檢查無誤。

---

### 4. 智慧 Git 提交 (Smart Git Commit)

檢查通過後，遵循 **Conventional Commits** 規範。

```bash
git add .
# Agent Action: Analyze changes and generate semantic commit message
# Format: <type>(<scope>): <subject>
# Example: chore(deploy): release version 1.2.3
git commit -m "<generated_message>"
git push origin main
```

---

### 5. 部署與線上驗證 (Sanity Check)

執行部署並驗證線上版本 (含 Cache-Busting)。

```bash
# Deployment is triggered automatically by git push in Step 4
# Just wait for GitHub Actions to complete (approx 30s-1m)
npm run verify-deploy
```

> [!WARNING]
> 如果驗證失敗 (超時或版本不匹配)：
>
> 1. **通知**：發送 Telegram 警報 "⚠️ Deployment verification failed"。
> 2. **行動**：檢查 GitHub Actions日誌或手動檢查網站。
> 3. **重試**：如果需要回滾或修復，工作流程可能需要從步驟 1 重新開始。

---

### 6.優雅通知推送 (Refined Notification)

通知內容應包含 Markdown 表格或 Emoji 區塊。

```bash
# Agent Action: Run notification script
node scripts/notify-telegram.js "SUCCESS" "🚀 **部署成功！**" "$(git rev-parse --short HEAD)"
```

## 錯誤處理 (Error Handling)

如果任何關鍵步驟 (檢查、部署、驗證) 失敗：

1. **發送 Telegram 通知**："🚨 **部署失敗** 於步驟 [Step Name]。請調查。"
2. **停止工作流程**：在問題解決前不要繼續。

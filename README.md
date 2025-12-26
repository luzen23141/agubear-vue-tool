# 🐻 AguBear Tools

線上開發者工具集合，提供時間戳轉換、MD5 雜湊、Unicode 編碼、拼音查詢、QR Code 產生等實用功能。

🌐 **線上 Demo**：[agubear.black](https://agubear.black)

## 功能

| 工具                | 說明                                                             |
| ------------------- | ---------------------------------------------------------------- |
| ⏳ **時間戳轉換**   | Unix Timestamp ↔ 日期時間，支援秒/毫秒、多時區 (UTC-12 ~ UTC+12) |
| 🔐 **MD5 雜湊**     | 產生 MD5 Hash，支援大小寫切換與歷史紀錄                          |
| 🔤 **Unicode 轉換** | 文字 ↔ `\uXXXX` / `&#xXXXX;` 雙向轉換，可跳過 ASCII              |
| 🗣️ **拼音轉換**     | 中文字 → 漢語拼音，支援聲調符號顯示                              |
| 📱 **QR Code**      | 產生 QR Code，可自訂尺寸、顏色、錯誤校正，支援下載/拖曳/複製     |
| 📋 **JSON 格式化**  | 格式化/壓縮 JSON，去除跳脫字元，Unicode 解碼，錯誤標示           |

## 快速開始

```bash
npm install       # 安裝依賴
npm run dev       # 開發模式 (http://localhost:5173)
npm run build     # 建置生產版本
npm run test      # 執行單元測試 (66 tests)
./deploy.sh       # 部署到 GitHub Pages
```

## 技術棧

- [Vue 3](https://vuejs.org/) — 漸進式 JavaScript 框架
- [Vite](https://vitejs.dev/) — 下一代前端建構工具
- [Vitest](https://vitest.dev/) — 單元測試框架
- [date-fns](https://date-fns.org/) — 日期工具庫
- [CryptoJS](https://github.com/brix/crypto-js) — MD5 雜湊
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) — 拼音轉換
- [qrcode](https://github.com/soldair/node-qrcode) — QR Code 產生

## 專案結構

```text
src/
├── components/       # Vue 元件
│   ├── TimestampConverter.vue
│   ├── Md5Generator.vue
│   ├── UnicodeConverter.vue
│   ├── PinyinConverter.vue
│   ├── QrCodeGenerator.vue
│   └── JsonFormatter.vue
├── composables/      # 可組合函式
│   ├── useHistory.js
│   └── useTimestampConverter.js
├── utils/            # 工具函式
│   ├── converter.js
│   └── unicode.js
├── tests/            # 單元測試
│   ├── utils/
│   └── composables/
├── App.vue
├── main.js
└── style.css
```

## 授權

MIT License

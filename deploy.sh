#!/usr/bin/env sh

# 發生錯誤時終止
set -e

# 從主專案取得 remote URL
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REPO_URL" ]; then
  echo "錯誤: 找不到 git remote origin，請先設定 remote"
  exit 1
fi

# 清理並建置專案
rm -rf dist
npm run build

# 生成部署配置 (在 root 執行)
echo "正在生成部署配置..."
node scripts/generate-deploy-config.mjs

# 進入輸出的資料夾進行部署
cd dist

# 初始化 git 並設定 user (避免 CI 環境失敗)
git init
git config user.email "deploy@example.com"
git config user.name "Deploy Bot"

git add -A
git commit -m 'deploy'

# 部署到 gh-pages 分支 (使用主專案的 remote URL)
git push -f "$REPO_URL" HEAD:gh-pages

cd -

#!/usr/bin/env sh

# 發生錯誤時終止
set -e

# 建置專案
npm run build

# 進入輸出的資料夾
cd dist

# 這是關鍵：如果你要用自訂域名，必須在 dist 裡產生一個 CNAME 檔案
# 將下面這行改為你的域名 (例如 tools.yourdomain.com)
echo 'tool.agubear.black' > CNAME

git init
git add -A
git commit -m 'deploy'

# 部署到 https://<USERNAME>.github.io/<REPO>
# 請將下面的 <USERNAME> 和 <REPO> 換成你的資訊
git push -f git@github.com:luzen23141/agubear-vue-tool.git main:gh-pages

cd -

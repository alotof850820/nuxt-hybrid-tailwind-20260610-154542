# PlanLab 財務規劃儀表板

PlanLab 是一個用 Nuxt、Vue、Tailwind CSS 與 Chart.js 製作的個人財務規劃網頁。首頁提供產品入口，`Start planning` 會進入實際的財務規劃工作區。

## 線上觀看

Vercel production URL：

https://planlab-alotof850820.vercel.app/

Vercel 專案名稱已改為 `planlab`，本機專案資料夾已整理為 `C:\PlanLab`。

## 主要功能

- **首頁入口**：`/` 是 PlanLab landing page，包含品牌導覽、產品主張、CTA 與儀表板預覽。
- **財務總覽**：`/dashboard` 顯示總資產、資產變化趨勢、資產配置與事件標記。
- **全域設定**：`/settings` 管理目前年齡、首頁趨勢年數與目標金額。
- **股票規劃**：`/stocks` 管理本金、月投入、年化報酬、規劃年數、停止投入與提領設定。
- **存款規劃**：`/deposits` 管理活存與定存，活存/定存可設定利率，定存事件會同步到趨勢與明細。
- **買房規劃**：`/house` 可啟用買房情境，設定買房年齡、頭期款、月付與貸款年限。
- **年度明細**：`/details` 依全域年數逐年列出年齡、投入、房貸、存款利息、事件與期末資產。
- **互動圖表**：使用 Chart.js 呈現資產趨勢與配置，趨勢圖 X 軸以年齡顯示。

## 本機開發

```bash
npm install
npm run dev
npm run build
```

常用驗證：

```bash
npm run test:home-trend
npm run test:deposits
npm run test:dashboard-allocation
npm run test:goal-settings
npm run test:homepage-entry
npm run test:kpi-animation
npm run test:remaining-animations
npm run audit:contrast
npm run test:tabler-types
npm run build
```

如果要指定本機測試網址：

```powershell
$env:TARGET_URL='http://127.0.0.1:3100'
npm run test:home-trend
```

## 技術架構

- Nuxt 4 / Vue 3
- Tailwind CSS v4
- Chart.js
- Tabler Icons
- Playwright
- Vercel

## 專案結構

- `app/pages/index.vue`：首頁 Landing Page。
- `app/pages/dashboard.vue`：財務成果總覽。
- `app/pages/settings.vue`：全域設定。
- `app/pages/stocks.vue`：股票與投資設定。
- `app/pages/deposits.vue`：存款規劃。
- `app/pages/house.vue`：買房規劃。
- `app/pages/details.vue`：年度收支明細。
- `app/composables/useFinancialPlan.ts`：共用財務規劃狀態與計算邏輯。
- `app/components/AssetTrendChart.client.vue`：資產趨勢圖。
- `scripts/`：Playwright、型別與對比驗證腳本。
- `docs/`：規格、計畫、功能狀態與進度紀錄。

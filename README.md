# Stockwise — Inventory & Billing

Stockwise is a responsive inventory and billing workspace for small stores. Manage products and stock, build customer bills, and review or print completed invoices.

## Features

- Dashboard with sales, inventory value, and low-stock summaries
- Searchable and category-filtered inventory with add, edit, and delete actions
- Stock-aware checkout with editable quantities and 5% GST
- Bill history with invoice previews and print-ready receipts
- Starter products for a quick first look
- Responsive layout for desktop, tablet, and mobile

Products and bills are saved in the current browser using local storage. This is a front-end application; it does not sync data between browsers or devices.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks

```sh
npm run lint
npm run build
```

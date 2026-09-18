# 🌾 AgriMarket — From Farm to Your Doorstep

Professional farm-direct marketplace prototype (HTML + CSS + Vanilla JS, no build step, no CDN dependency).

## Run it
Just serve the folder — e.g. `python3 -m http.server 8000` inside `AgriMarket/`, then open `http://localhost:8000/index.html`.
Or open `index.html` directly (all features work offline; file:// included).

## Demo accounts (one-click fill on login page)
| Role | Email | Password | Lands on |
|---|---|---|---|
| Customer | customer@agrimarket.in | customer123 | Customer dashboard |
| Farmer | farmer@agrimarket.in | farmer123 | Farmer dashboard |
| Admin | admin@agrimarket.in | admin123 | Admin console |

## What's inside (maps to the 10 development phases)
- **Phases 1–2** — `css/style.css` design system (tokens, buttons, cards, forms, badges, navbar, footer, light/dark theme), responsive + dashboard layers.
- **Phase 3** — Public site: home (exact section order), marketplace (live search, suggestions, filters, sort, pagination, grid/list), categories, product details (gallery, Know-Your-Farmer, reviews), farmers + profiles, about, contact, FAQ.
- **Phase 4** — Cart (qty, save-for-later, free-delivery bar, discounts), wishlist, 4-step checkout (address → delivery → demo payment → confirmation). All persist in localStorage.
- **Phase 5** — Customer dashboard: orders + live tracking timeline, addresses, reviews, notifications, saved farmers, recently viewed, recommendations.
- **Phase 6** — Farmer dashboard: add/edit/publish/draft products, inventory states, order-status pipeline, customers, earnings, reviews, canvas analytics.
- **Phase 7** — Admin console: farmer approve/reject/docs/suspend, product/order/user CRUD, categories, payments, reports (CSV export), complaints, reviews, broadcasts, settings. Everything mutates real demo state.
- **Phase 8** — Reviews with verified badge, 3-way compare, State→District→Mandal→Village picker, bulk-quote requests, simulated farmer chat, notification centre.
- **Phase 9** — Market-price ticker + table, weather widget, schemes, agri news, floating **Agri Assistant** chatbot; `js/services.js` isolates future weather/market/AI/payment/logistics APIs.
- **Phase 10** — SEO meta + sitemap + robots + favicon, semantic HTML, focus states, reduced-motion support, empty/loading/error/success states throughout.

## Project structure
```
AgriMarket/
├── *.html            # 19 pages (18 required + compare)
├── css/              # style.css, dashboard.css, responsive.css
├── js/               # data, services, common, main, products, cart,
│                     # auth, customer, farmer, admin
└── assets/           # favicon.svg
```

## Test it fast (5-minute script)
1. Home → search "mango" → open product → Add to cart → Cart → Checkout → place order → Orders → Track.
2. Login as farmer → Add Product → Publish → check it appears in marketplace → update an order status → watch customer tracking change.
3. Login as admin → Farmers → Approve newcomer → Products → edit price → Reports → download CSV.
4. Toggle 🌙 dark mode, refresh — everything persists.

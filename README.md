# Sales Order Monitoring

A small responsive web app that helps a sales team monitor sales orders across multiple branches, built for the Harrisons Sabah IT Executive technical assessment. All data comes from the provided **read-only mock REST API** (fictional assessment data).

- **Live app:** https://sales-order-monitor-azure.vercel.app/
- **Repository:** https://github.com/sebastiandaniely02/sales-order-monitor

## Features

- **Dashboard:** total orders, open/pending, completed (invoiced + delivered), cancelled, and total order value
- **Order list:** order number (SalesId), customer, branch/site, order date, status and amount
- **Search** across order number, customer name, customer account, PO reference and sales taker
- **Filters** by branch/site and status (options loaded from the API)
- **Server-side pagination** (25 per page) and **sortable columns**
- **Loading, empty and error states**, with Retry and Clear filters actions
- **Responsive layout:** the table turns into stacked cards on phones

## Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Familiar from my internship; fast setup and build |
| HTTP | Native `fetch` | Built in, enough for GET-only requests |
| Styling | Plain CSS with custom properties and media queries | No setup time, full control |
| Backend | None | The API allows browser calls (CORS `Access-Control-Allow-Origin: *`) |
| Hosting | Vercel | Free, deploys automatically from GitHub |

## Getting started

**Prerequisites:** Node.js `v22.21.0` and npm.

```bash
git clone https://github.com/sebastiandaniely02/sales-order-monitor.git
cd sales-order-monitor
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5173
```

Other scripts:

```bash
npm run lint      # ESLint checks
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the mock sales-orders API |
| `VITE_API_KEY` | Assessment API key, sent as the `x-assessment-key` header |

On Vercel, the same two variables are set in **Project Settings → Environment Variables**.

## Architecture

```
Browser (React app on Vercel)
  Components (UI)  ──▶  App.jsx (state)  ──▶  api/salesOrders.js  ──HTTPS GET──▶  Mock REST API
  Dashboard, Filters,    filters, sort,        builds the URL and                 /meta
  OrderTable,            page, response        adds x-assessment-key              /?page&status&site&q&sort&order
  Pagination   ◀── re-render ──┘
```

### Folder structure

```
src/
  api/salesOrders.js        the only module that calls the API
  components/
    Dashboard.jsx           summary cards (with skeleton loading)
    Filters.jsx             search box + site/status dropdowns
    OrderTable.jsx          order list with sortable headers
    Pagination.jsx          Prev / Next and "Showing X–Y of Z"
    StatusBadge.jsx         colour-coded status labels
    StateMessage.jsx        reusable loading / empty / error message
  hooks/useDebounce.js      delays search requests until typing stops
  utils/format.js           RM currency, numbers, Malaysia-time dates
  App.jsx                   state, data fetching, choosing which UI state to show
```

### Key design decisions

1. **Server-side pagination, filtering, search and sorting.** The app sends `page`, `pageSize`, `q`, `site`, `status`, `sort` and `order` as query parameters and only loads 25 orders at a time, so it stays fast as data grows.
2. **The dashboard uses the API's `summary` object** instead of downloading all orders to count them. The dashboard shows company-wide totals; the list shows the filtered count ("X of 1,200 orders").
3. **One API module** (`src/api/salesOrders.js`) handles URL building, authentication and error handling, so components never call `fetch` directly (separation of concerns).
4. **Dropdown options come from `/meta` facets**, not hard-coded values, so new sites or statuses appear automatically.
5. **Newest orders first** by default, since recent orders matter most for monitoring.
6. **Presentational components** receive data through props; `App.jsx` owns the shared state.

### API integration notes

- **Endpoints used:** `GET /meta` (once, for filter options) and `GET /` (paginated list + summary).
- **Authentication:** `x-assessment-key` request header.
- **Empty filters are not sent** (e.g. "All sites" sends no `site` parameter).
- **Debounced search:** requests are sent 400 ms after typing stops, to avoid one request per keystroke.
- **Request cancellation:** each request uses an `AbortController`; when filters change, the previous request is aborted, so an older, slower response cannot overwrite newer results (race condition).
- **Page resets to 1** whenever a filter or sort changes, so the user never requests a page that no longer exists.
- **Error handling:** network failures and non-2xx responses (e.g. 401 for a wrong key) are turned into readable messages with a Retry button. The original network error is kept as `cause` for debugging.
- **Loading state is derived** from whether the stored response belongs to the current request, rather than a separate `loading` flag.

## Assumptions and data notes

- **"Completed" = invoiced + delivered**, because the brief groups them and the API has no single completed count. The card shows the breakdown. To be confirmed with business users.
- **Dashboard totals are overall**, verified by calling the API with `status=Cancelled`: only `filtered_orders` changed.
- **Whether `total_order_value` includes cancelled orders is not documented** by the API; shown as provided.
- **Dates** are returned in UTC and displayed in Malaysia time (`Asia/Kuala_Lumpur`, UTC+8).
- **Site codes** are shown as provided; site names were not guessed.
- **Customer is not sortable**, because `SalesName` is not in the API's list of sortable fields.
- **Possible data inconsistency:** `SO-MOCK-00023` has status *Cancelled* but an invoiced amount of RM 570.65. The data was not changed; this would be raised with the data owner.

## Testing

Manual testing using equivalence partitioning (EP) and boundary value analysis (BVA).

| # | Test | Technique | Expected result | Result |
|---|---|---|---|---|
| 1 | Call `/meta` and the list endpoint with curl | Integration | 200 OK, `facets`, `summary`, `data` returned | Pass |
| 2 | CORS preflight (`OPTIONS`) with curl | Integration | `Access-Control-Allow-Origin: *` | Pass |
| 3 | Wrong API key | Negative (EP) | Error state shows HTTP 401 | Pass |
| 4 | Dashboard values on load | Functional | 1,200 / 420 / 660 / 120 / RM 998,244.30 | Pass |
| 5 | Date conversion (`03:07Z`) | Functional | Shown as 11:07 am Malaysia time | Pass |
| 6 | Search "Siti" typed quickly | Functional | One request sent after typing stops | Pass |
| 7 | Site B20 + status Open order + "Siti" | EP (valid) | 6 matching orders, dashboard unchanged | Pass |
| 8 | Search "zzzz" | EP (no match) | Empty state with Clear filters, no pagination | Pass |
| 9 | First page | BVA | Prev disabled | Pass |
| 10 | Last page of Cancelled (page 5) | BVA | "Showing 101–120 of 120", Next disabled | Pass |
| 11 | Change filter while on page 3 | State | Returns to page 1 | Pass |
| 12 | Click Amount header twice | Functional | Ascending, then descending | Pass |
| 13 | Slow network (DevTools "Slow 4G") | UX | Skeleton cards and spinner, then data | Pass |
| 14 | Offline, then Retry | Negative | Error state; Retry loads data | Pass |
| 15 | Phone width (DevTools + real phone) | Responsive | Stacked cards with labels | Pass |
| 16 | `npm run lint` and `npm run build` | Static checks | No errors | Pass |

**Request cancellation:** previous requests are cancelled via `AbortController` when filters change. Cancellation was observed in the Network tab during development (effect cleanup); the rapid filter-switching scenario was not explicitly reproduced within the time limit.

## Known limitations and possible improvements

- **API key is visible in the browser bundle.** Variables prefixed with `VITE_` are built into client code. Acceptable for this fictional, read-only key; in production, a serverless proxy or backend would keep the key on the server.
- **No automated tests yet.** Next steps: unit tests for `format.js` and the API module (Vitest), and end-to-end tests (Selenium or Playwright).
- **No order detail view.** The single-order endpoint (`/{salesId}`) could power a detail panel (balance, invoiced amount, sales taker, requested shipping date).
- **Filters are not saved in the URL**, so a filtered view can't be shared as a link.
- **Possible extras:** highlight overdue orders using `ShippingDateRequested`, CSV export.

## AI-use disclosure

**Tools used:** Claude (Anthropic).

**How I used it:**
- Researched the company and the assessment, and discussed the plan, architecture and UI before coding.
- Claude provided the code for each step with explanations. I built the app myself in seven checkpoints (API connection → table → dashboard and formatting → filters → pagination and sorting → UX states and responsive layout → deployment), typing each file, running it, and testing it before moving on.

**What I verified or changed myself:**
- Explored the API with curl before coding: response structure, field names, `summary` behaviour with filters, and CORS headers.
- Fixed a failing import caused by a misnamed file (`salesOrder.js` → `salesOrders.js`).
- Fixed an ESLint `preserve-caught-error` error by attaching the original error as `cause`.
- Checked the UTC to Malaysia time conversion manually, and the 401 response for a wrong key.
- Ran the manual tests above, locally and on the deployed site.

**Time spent:** about 5 hours, including about 20 minutes on deployment.
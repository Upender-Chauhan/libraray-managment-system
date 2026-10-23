# Bibliotheca — Library Management System

A complete, self-contained library management website: catalog management, member
records, book issue/return (circulation), a dashboard, and reports. No server,
database, or build step required — it runs entirely in the browser.

## Running it


1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
   - Double-click the file, or right-click → Open With → your browser.
   - For the best experience, serve it locally instead of using `file://`:
     ```
     cd library-system
     python3 -m http.server 8000
     ```
     then visit `http://localhost:8000`.

## Login

- **Username:** `admin`
- **Password:** `admin123`

## What's included

| Page                | Purpose |
|----------------------|---------|
| `index.html`         | Login screen |
| `dashboard.html`     | Snapshot: totals, recent circulation, genre breakdown |
| `books.html`         | Full book catalog — add, edit, delete, search, filter by genre |
| `members.html`       | Member records — register, edit, suspend, delete |
| `transactions.html`  | Issue a book to a member / mark a book returned, with automatic overdue detection |
| `reports.html`       | Most-borrowed titles, membership mix, on-time vs late returns, overdue register |

## How data is stored

All data is stored in the browser's `localStorage`, seeded on first run with sample
books, members, and loan records. Nothing is sent to any server — it's private to
your browser on this machine.

- Clearing your browser's site data for this page will reset it back to the seed data.
- Because storage is per-browser, opening the site in a different browser or in
  incognito/private mode will start with a fresh seeded dataset.

## Extending it

The code is organized for easy extension:

- `assets/style.css` — the entire design system (colors, type, components) as CSS variables.
- `assets/app.js` — the data layer (`readDB` / `writeDB`), auth, and shared UI helpers
  (toast notifications, modals, the sidebar shell).
- Each page is a single HTML file with its own inline script that reads/writes the
  same shared `localStorage` keys, so you can add new pages by following the same
  pattern (`renderShell('pagekey')`, then render into `#main-content`).

To wire this up to a real backend later, replace the `readDB` / `writeDB` functions
in `assets/app.js` with `fetch()` calls to your API — the rest of the pages call
only those two functions, so the swap is contained to one file.

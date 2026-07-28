# Project handoff: Train the Intern live feedback app

## What this is
A branded feedback app for a paid AI training (Operate Bigger, "Train the Intern," PBSO PAL, Aug 5 2026). Participants fill out a form on their phones. Responses write to a Google Sheet through a Google Apps Script web app. A second page is a live dashboard shown on the room TV that reads the same sheet and updates every few seconds. Built to be demoed live as proof of what conversational AI can stand up.

## Repo and hosting
- GitHub repo: `ajfas1-netizen/feedback`, served via GitHub Pages.
- Phone app URL: `https://ajfas1-netizen.github.io/feedback/feedback.html`
- Dashboard URL: `https://ajfas1-netizen.github.io/feedback/results.html`

## Files
- `feedback.html` — participant submission app. Single self-contained file, inline CSS and JS. Mobile-first. Light "cream" Operate Bigger brand.
- `results.html` — live results dashboard for the TV. Single self-contained file. Dark Operate Bigger deck brand. Polls the backend every 4000ms with a cache-busting query string.
- `Code.gs` — Google Apps Script bound to the responses Google Sheet. Already deployed and confirmed working.

## Backend (already deployed and returning valid JSON)
- Web App URL (same value hardcoded as `WEB_APP_URL` in both HTML files):
  `https://script.google.com/macros/s/AKfycbxNiQ3OzaMUsx7dOnMopw_aZvvZrDi_qYL2rXG2NjcyulRwu_Nx2qaxqOrr19VjzuO2/exec`
- Deployed as: Execute as Me, Who has access Anyone (required so participants submit with no Google login).
- IMPORTANT: to change `Code.gs`, edit the SAME deployment as a New version (Deploy > Manage deployments > pencil > Version: New version). Never create a new deployment; that mints a new URL and breaks both HTML files.

## Data contract
Frontend POSTs to the Web App URL with `Content-Type: text/plain;charset=utf-8` (this avoids a CORS preflight; Apps Script parses the JSON string server-side). Payload keys:
`skillBefore, skillAfter, valueToday, recommend` (each a "1".."10" string),
`mostValuable, canDo, helpNext` (comma-joined strings of selected options),
`firstTask, surprised, better, quote, name, role, email` (free text),
`quotePermission` (one of `named`, `anon`, `no`).

Google Sheet tab is named `Responses`, columns in this order:
`Timestamp, SkillBefore, SkillAfter, ValueToday, Recommend, MostValuable, CanDo, FirstTask, Surprised, Better, Quote, QuotePermission, Name, Role, HelpNext, Email`.

`doGet` returns JSON for the dashboard:
`{ count, avgBefore, avgAfter, avgValue, avgRecommend, confidencePct, parts:{optionLabel:count}, quotes:[{text,name,role}] }`.
Quotes are only included when `quotePermission` is `named` or `anon`. `named` includes name/role; `anon` blanks them. `no` is never returned.

## Brand tokens
Phone app (light): navy `#1c3f5e`, blue `#2e6da4`, cream background `#faf6ec`, ink `#22303a`. Fonts Jost (headings) and Source Sans 3 (body) via Google Fonts.
Dashboard (dark): background `#0e1621`, card `#131f33`, border `#2c4a78`, blue `#4b8fd6`, sky `#8fc1e9`, green `#4bd08a`. Same fonts.
Logo lockup is the word OPERATEBIGGER with OPERATE in blue/sky and BIGGER in near-white. No em dashes anywhere in copy.

## Known-good behaviors to preserve
- Ratings are a 10-column grid, tap to select, works down to ~360px phones.
- Success screen shows the person their own skill gain (after minus before).
- Dashboard shows response count, avg skill gain in to out, value, recommend, a confidence percentage, most-valuable bars, and a permitted-quote stream.
- Fonts load from Google Fonts, so the app needs internet (same wifi the session already depends on).

## What I want to fix or change
<describe the specific problem or change here>

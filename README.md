# Train the Intern — Live Feedback App

Turns the paper feedback form into a phone app that writes to a Google Sheet, plus a live results dashboard for the room TV. Built to be demoed as proof of what conversational AI can stand up in an afternoon.

Three moving parts:

- `feedback.html` — what participants open on their phones and fill out
- `results.html` — the live dashboard you throw on the TV
- `Code.gs` — the Google Apps Script that reads and writes the Google Sheet

The two HTML files are static. Host them anywhere (GitHub Pages works). The Apps Script is the only "backend," and it is free.

---

## Setup, about 5 minutes

### 1. Make the sheet + script
1. Create a new Google Sheet. Name it anything (for example, "PBSO PAL Feedback").
2. In the sheet: **Extensions > Apps Script**.
3. Delete the starter code, paste in everything from `Code.gs`, and **Save**.
4. In the function dropdown pick **setupHeaders**, click **Run**, and authorize when Google prompts. This writes the header row.

### 2. Deploy the web app
1. In Apps Script click **Deploy > New deployment**.
2. Gear icon > **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
   - "Anyone" is required so participants can submit without logging into a Google account. No sign-in, no friction.
4. **Deploy**, authorize again if asked, then copy the **Web app URL**. It ends in `/exec`.

### 3. Wire the URL into both files
Open `feedback.html` and `results.html` and paste that same `/exec` URL into the line near the top of the script:

```js
const WEB_APP_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```

Both files must point at the same URL.

### 4. Host the two HTML files
Push this folder to a GitHub repo and turn on **Settings > Pages**. Your links become:

- Phone app: `https://<you>.github.io/<repo>/feedback.html`
- TV dashboard: `https://<you>.github.io/<repo>/results.html`

Optional: point a short link at the phone app, for example `operatebigger.com/pbsofeedback`, so it is easy to say out loud in the room.

---

## Running it live (Slide 41, the two-asks moment)

1. Open `results.html` on the TV before you hand out the ask.
2. Give the room the phone-app link (short link or QR).
3. Watch responses, the average skill gain, and the shared quotes populate in real time.
4. The dashboard auto-refreshes every 4 seconds. No action needed.

The reveal line writes itself: they just filled out a form on their phones, it hit a database and a live dashboard instantly, and the whole thing was built by talking to an AI.

---

## After the session

Everything sits in the Google Sheet, one row per person. For the Scott recap you have it all in one place:
- Average walked-in vs walked-out self-rating (the growth number)
- Value and recommend scores
- Every quote with its permission flag (named, anonymous, or do-not-share)
- Requested follow-up topics and any emails left for you

The dashboard only ever shows quotes marked **named** or **anonymous**. Anything marked do-not-share stays in the sheet and never appears on screen.

---

## Notes
- Fonts load from Google Fonts, so the app needs internet. That is the same wifi the day already depends on.
- No personal data about real kids is collected or requested. This form is about the training only, consistent with the guardrails.
- If a phone cannot submit, the paper form is the fallback. Bring a few printed copies just in case.

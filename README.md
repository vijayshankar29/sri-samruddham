# SRI SAMRUDDHAM — Housewarming Website v2

This package includes the complete responsive website, supplied artwork, and a ready-to-deploy Google Apps Script RSVP backend.

## Run the website
Open `index.html` directly, or host this folder on GitHub Pages / Netlify / Cloudflare Pages.

## Connect RSVP to your Google Sheet

Your spreadsheet can remain PRIVATE. Guests do **not** need access to it.

1. Open your RSVP Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace the editor contents with `google-apps-script/Code.gs`.
4. Save.
5. Choose **Deploy → New deployment → Web app**.
6. Execute as: **Me**.
7. Set access so invitation guests can submit to the web app.
8. Deploy and copy the `/exec` Web App URL.
9. Open `script.js` and replace:
   `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
   with that `/exec` URL.
10. Re-upload the site.

The script writes only these values:
- server submission date/time
- Name
- Availability (`I'll be there` or `Can't make it`)
- client timestamp
- page URL

## Important security reality

A public website cannot contain a truly secret browser-side submission URL or secret key: anything sent by the browser can be inspected by a technically capable visitor. The safe design used here is different:
- the **Google Sheet itself stays private**
- the website never contains the Sheet URL
- the Apps Script endpoint exposes only an append operation
- the server validates the only two accepted availability values
- names are length-limited and formula-injection protected
- there is a simple bot honeypot

This prevents guests from opening/editing the spreadsheet through the invitation. If you need stronger anti-spam/anti-forgery protection, put the RSVP endpoint behind a server-side service (for example Cloudflare Turnstile + Worker) rather than placing a secret in JavaScript.

## Files
- `index.html` — page structure/content
- `styles.css` — responsive design + animations
- `script.js` — navigation, transitions, countdown, 3D house, RSVP
- `assets/` — supplied artwork
- `google-apps-script/Code.gs` — Google Sheets append-only backend

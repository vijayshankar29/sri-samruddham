/**
 * Google Apps Script backend for the Sri Samruddham RSVP.
 *
 * IMPORTANT:
 * 1. Create this script FROM the RSVP Google Sheet (Extensions -> Apps Script).
 * 2. Keep the spreadsheet itself PRIVATE. Guests never need Sheet access.
 * 3. Deploy this script as a Web App and paste ONLY the Web App URL into script.js.
 *
 * Expected columns:
 * Submitted At | Name | Availability | Client Time | Page
 */

const SHEET_NAME = "RSVP";
const ALLOWED = new Set(["I'll be there", "Can't make it"]);

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const name = String(payload.name || "").trim().slice(0, 80);
    const attendance = String(payload.attendance || "").trim();

    if (!name) return json_({ok:false, error:"Name is required"});
    if (!ALLOWED.has(attendance)) return json_({ok:false, error:"Invalid availability"});

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Submitted At", "Name", "Availability", "Client Time", "Page"]);
      sheet.setFrozenRows(1);
    }

    // Spreadsheet server time/date is authoritative.
    sheet.appendRow([
      new Date(),
      safeCell_(name),
      attendance,
      safeCell_(String(payload.clientTime || "").slice(0, 40)),
      safeCell_(String(payload.page || "").slice(0, 300))
    ]);

    return json_({ok:true});
  } catch (err) {
    return json_({ok:false, error:"Server error"});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function safeCell_(value) {
  // Prevent spreadsheet-formula injection from guest input.
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

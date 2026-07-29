Temporary donation-click logging, no server needed.

1. Create a new Google Sheet (sheets.new).
2. Extensions -> Apps Script. Replace the default code with:

```js
// Neutralizes leading =, +, -, @ so a posted value can't be read as a
// spreadsheet formula when the sheet is opened (formula injection).
function sanitize(value) {
  value = String(value || '');
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    sanitize(params.page),
    sanitize(params.referrer),
    sanitize(params.userAgent)
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy -> New deployment -> type "Web app". Execute as "Me", who has access "Anyone". Deploy, authorize when prompted, copy the web app URL (ends in `/exec`).
4. Paste that URL into `SHEET_ENDPOINT` in `donate-tracking.js`.
5. Clicks on the Donate button will append a row: timestamp, page, referrer, browser user agent. No name/email — this is anonymous traffic data, not identity.

The URL is public (visible in page source) and unauthenticated by design, so anyone can POST to it directly — worst case is spam rows or quota exhaustion, not data theft (the script can only append rows, never read or delete).

Re-deploy (Deploy -> Manage deployments -> Edit -> New version) any time you change the Apps Script code — editing the code alone does not update the live `/exec` URL.

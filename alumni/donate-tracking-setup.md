Temporary donation-click logging, no server needed.

1. Create a new Google Sheet (sheets.new).
2. Extensions -> Apps Script. Replace the default code with:

```js
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    params.page || '',
    params.referrer || '',
    params.userAgent || ''
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy -> New deployment -> type "Web app". Execute as "Me", who has access "Anyone". Deploy, authorize when prompted, copy the web app URL (ends in `/exec`).
4. Paste that URL into `SHEET_ENDPOINT` in `donate-tracking.js`.
5. Clicks on the Donate button will append a row: timestamp, page, referrer, browser user agent. No name/email — this is anonymous traffic data, not identity.

Re-deploy (Deploy -> Manage deployments -> Edit -> New version) any time you change the Apps Script code.

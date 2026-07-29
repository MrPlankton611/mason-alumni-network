Temporary donation-click logging, no server needed.

1. Create a new Google Sheet (sheets.new).
2. Extensions -> Apps Script. Replace the default code with:

```js
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = JSON.parse(e.postData.contents);
  var rowIndex = sheet.getLastRow() + 1;

  sheet.getRange(rowIndex, 1).setValue(new Date());

  // Plain-text format alone does NOT stop Sheets from evaluating a leading
  // =/+/-/@ as a formula (formula recognition happens before number format
  // is applied). The part that actually prevents it is the literal leading
  // apostrophe in escapeForSheet() below - that's the documented Apps Script
  // mechanism for forcing a value to be stored as literal text. The format
  // call is kept only as a harmless second layer.
  var textRange = sheet.getRange(rowIndex, 2, 1, 3);
  textRange.setNumberFormat('@');
  textRange.setValues([[
    escapeForSheet(params.page),
    escapeForSheet(params.referrer),
    escapeForSheet(params.userAgent)
  ]]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeForSheet(value) {
  value = String(value || '');
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}
```

3. Deploy -> New deployment -> type "Web app". Execute as "Me", who has access "Anyone". Deploy, authorize when prompted, copy the web app URL (ends in `/exec`).
4. Paste that URL into `SHEET_ENDPOINT` in `donate-tracking.js`.
5. Clicks on the Donate button will append a row: timestamp, page, referrer, browser user agent. No name/email — this is anonymous traffic data, not identity.

The URL is public (visible in page source) and unauthenticated by design, so anyone can POST to it directly — worst case is spam rows or quota exhaustion, not data theft (the script can only append rows, never read or delete).

**Re-deploying an existing web app:** editing the code in the editor alone does NOT update the live `/exec` URL. You must go to Deploy -> Manage deployments -> click the pencil/edit icon on the existing deployment -> Version: "New version" -> Deploy. Only "New deployment" (step 3) generates a new URL; re-versioning an existing deployment keeps the same URL.

**If you already have rows with clickable links or #NAME?/#ERROR! cells:** those are live formulas that executed on the old code. Select and delete those rows, then select the whole data range and Format -> Number -> Plain text as a blanket safety net matching the code above.

// TEMPORARY: logs anonymous donation-link clicks (timestamp, referrer, user agent)
// to a Google Sheet via a Google Apps Script Web App. Fill in the URL below after
// deploying the Apps Script (see donate-tracking-setup.md), or leave blank to skip logging.
(function () {
  var SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyi85htLDVlhc4_Y5rrjJj5LVQmEjTSsNhaV6g5mOix3JxzShAHyyt0jwmif4e2xt4YOQ/exec';

  var links = document.querySelectorAll('.donate-link');
  if (!links.length || !SHEET_ENDPOINT) return;

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      fetch(SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        keepalive: true,
        body: JSON.stringify({
          page: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent
        })
      });
    });
  });
})();

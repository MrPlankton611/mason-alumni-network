// SITE_URL: update this (and the og:url/og:image tags in each page's <head>) when a custom domain replaces GitHub Pages.
(function () {
  var SHARE_TEXT = 'Join the Comet Alumni Network! Stay connected with Mason High School grads through mentorship, networking events, and reunions.';

  var btn = document.getElementById('shareBtn');
  if (!btn) return;

  var popup = document.getElementById('sharePopup');
  var closeBtn = document.getElementById('shareClose');
  var linkInput = document.getElementById('shareLinkInput');
  var copyStatus = document.getElementById('shareCopyStatus');
  var fbLink = document.getElementById('shareFacebook');
  var xLink = document.getElementById('shareX');
  var liLink = document.getElementById('shareLinkedIn');
  var igBtn = document.getElementById('shareInstagram');

  var pageUrl = window.location.href;
  linkInput.value = pageUrl;
  fbLink.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl) + '&quote=' + encodeURIComponent(SHARE_TEXT);
  xLink.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(SHARE_TEXT) + '&url=' + encodeURIComponent(pageUrl);
  liLink.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(pageUrl);

  function setOpen(open) {
    popup.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(popup.hidden);
  });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('click', function (e) {
    if (!popup.hidden && !popup.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  function showStatus(message, duration) {
    copyStatus.textContent = message;
    setTimeout(function () { copyStatus.textContent = ''; }, duration);
  }

  linkInput.addEventListener('click', function () {
    navigator.clipboard.writeText(pageUrl).then(function () {
      showStatus('Copied!', 2000);
    });
  });

  // Instagram has no web share intent for prefilled posts, so copy the
  // caption and hand off to Instagram for the user to paste it in.
  igBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(SHARE_TEXT + ' ' + pageUrl).then(function () {
      showStatus('Caption copied - paste it into your Instagram post!', 4000);
      window.open('https://www.instagram.com/', '_blank', 'noopener');
    });
  });
})();

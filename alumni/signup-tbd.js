// Sign-up buttons for events without confirmed dates show an inline message
// instead of navigating, since there's nowhere to actually sign up yet.
(function () {
  document.querySelectorAll('.signup-tbd').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var message = document.createElement('p');
      message.className = 'signup-tbd-message';
      message.textContent = link.dataset.tbdMessage;
      link.replaceWith(message);
    });
  });
})();

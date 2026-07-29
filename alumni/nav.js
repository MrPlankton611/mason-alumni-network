// Enhances the native <details> nav dropdowns: hover-to-open on desktop,
// plus closing on outside click / Escape / when another dropdown opens.
(function () {
  var dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  var hoverCapable = window.matchMedia('(hover: hover)').matches;

  dropdowns.forEach(function (dd) {
    if (hoverCapable) {
      dd.addEventListener('mouseenter', function () { dd.open = true; });
      dd.addEventListener('mouseleave', function () { dd.open = false; });
    }
    dd.addEventListener('toggle', function () {
      if (!dd.open) return;
      dropdowns.forEach(function (other) {
        if (other !== dd) other.open = false;
      });
    });
  });

  document.addEventListener('click', function (e) {
    dropdowns.forEach(function (dd) {
      if (dd.open && !dd.contains(e.target)) dd.open = false;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    dropdowns.forEach(function (dd) { dd.open = false; });
  });
})();

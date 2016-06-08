(function() {
  var $fixedElement = document.querySelectorAll('[data-fixed]')[0];
  var $after = document.querySelectorAll('[data-fixed-after]')[0];

  var raf = false, isNormal = true;

  window.addEventListener('scroll', function() {
    var scrollTop = window['pageYOffset'] || document.documentElement['scrollTop'];
    if (raf) return;
    raf = true;
    requestAnimationFrame(function() {
      if (250 < scrollTop && isNormal) {
        isNormal = false;
        $fixedElement.classList.add('layout-fixed');
        $after.style.marginTop = $fixedElement.offsetHeight + 10 + 'px';
      } else if (250 > scrollTop && !isNormal) {
        isNormal = true;
        $fixedElement.classList.remove('layout-fixed');
        $after.style.marginTop = '';
      }
      raf = false;
    });
  }, false);
})();

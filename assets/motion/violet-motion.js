/* ==========================================================================
   Violet Motion — JS helper (optional)
   Only two components need JS: the risk count-up, and replaying one-shots
   (Boot). Everything else is pure CSS. ~1 KB, no dependencies.

   USAGE
     <script src="violet-motion.js" defer></script>

   Count-up: any element with data-vm-count animates 0 -> value when scrolled
   into view. Optionally point it at a bar fill with data-vm-fill="#selector".
     <span class="vm-count__num" data-vm-count="73"
            data-vm-fill=".vm-count__fill"></span>

   Replay a one-shot (e.g. Boot) from your own code:
     VioletMotion.replay(document.querySelector('.vm-boot'));
   ========================================================================== */
(function (global) {
  var reduce = global.matchMedia &&
    global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function replay(el) {
    if (!el) return;
    el.classList.remove('vm-run');
    void el.offsetWidth;        // force reflow so the animation restarts
    el.classList.add('vm-run');
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-vm-count')) || 0;
    var dur = parseFloat(el.getAttribute('data-vm-duration')) || 1100;
    var fillSel = el.getAttribute('data-vm-fill');
    var fill = fillSel ? document.querySelector(fillSel) : null;
    function set(v) {
      el.textContent = Math.round(v);
      if (fill) fill.style.width = v + '%';
    }
    if (reduce) { set(target); return; }
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      set(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    set(0);
    requestAnimationFrame(step);
  }

  function init() {
    // auto-run Boot(s) on load
    document.querySelectorAll('.vm-boot').forEach(function (el) {
      if (!el.classList.contains('vm-run')) el.classList.add('vm-run');
    });
    // count-ups fire when visible
    var counts = document.querySelectorAll('[data-vm-count]');
    if ('IntersectionObserver' in global && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counts.forEach(function (el) { io.observe(el); });
    } else {
      counts.forEach(countUp);
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();

  global.VioletMotion = { replay: replay, countUp: countUp };
})(window);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
} else {
  document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  var dividers = Array.prototype.slice.call(document.querySelectorAll('.parallax-divider'));
  if (dividers.length) {
    var tickingParallax = false;
    var updateParallax = function(){
      var vh = window.innerHeight;
      dividers.forEach(function(el){
        var rect = el.getBoundingClientRect();
        var progress = (vh - rect.top) / (vh + rect.height);
        progress = Math.min(1, Math.max(0, progress));
        el.style.backgroundPositionY = (44 + progress * 12) + '%';
      });
      tickingParallax = false;
    };
    var onParallaxScroll = function(){
      if (!tickingParallax) { window.requestAnimationFrame(updateParallax); tickingParallax = true; }
    };
    window.addEventListener('scroll', onParallaxScroll, { passive:true });
    window.addEventListener('resize', onParallaxScroll);
    updateParallax();
  }
}

var menuToggle = document.querySelector('.menu-toggle');
var mobileMenu = document.getElementById('mobile-menu');
var menuClose = document.querySelector('.mobile-menu-close');

function openMenu(){
  mobileMenu.classList.add('open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Menü schließen');
  document.body.classList.add('menu-open');
  menuClose.focus();
}
function closeMenu(){
  mobileMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Menü öffnen');
  document.body.classList.remove('menu-open');
  menuToggle.focus();
}

menuToggle.addEventListener('click', function(){
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});
menuClose.addEventListener('click', closeMenu);
mobileMenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
});

(function(){
  var track = document.getElementById('carousel-track');
  if (!track) return;
  var carouselEl = track.closest('.carousel');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.quote-card'));
  var prevBtn = document.querySelector('.carousel-arrow.prev');
  var nextBtn = document.querySelector('.carousel-arrow.next');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.carousel-dot'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  var autoplayId = null;
  var AUTOPLAY_MS = 4000;

  function updateUI(index){
    current = index;
    dots.forEach(function(d,i){
      d.classList.toggle('active', i === index);
      d.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }

  function goTo(index){
    index = (index + slides.length) % slides.length;
    var target = slides[index];
    var left = target.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left: left, behavior: reduced ? 'auto' : 'smooth' });
  }
  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  function stopAutoplay(){
    if (autoplayId){ window.clearInterval(autoplayId); autoplayId = null; }
  }
  function startAutoplay(){
    if (reduced || document.hidden) return;
    stopAutoplay();
    autoplayId = window.setInterval(next, AUTOPLAY_MS);
  }
  function restartAutoplay(){ startAutoplay(); }

  prevBtn.addEventListener('click', function(){ prev(); restartAutoplay(); });
  nextBtn.addEventListener('click', function(){ next(); restartAutoplay(); });
  dots.forEach(function(dot, i){ dot.addEventListener('click', function(){ goTo(i); restartAutoplay(); }); });

  carouselEl.addEventListener('mouseenter', stopAutoplay);
  carouselEl.addEventListener('mouseleave', startAutoplay);
  carouselEl.addEventListener('focusin', stopAutoplay);
  carouselEl.addEventListener('focusout', function(){
    if (!carouselEl.contains(document.activeElement)) startAutoplay();
  });
  track.addEventListener('touchstart', stopAutoplay, { passive:true });
  track.addEventListener('touchend', function(){ window.setTimeout(startAutoplay, 1200); }, { passive:true });
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) stopAutoplay(); else startAutoplay();
  });

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting && entry.intersectionRatio > 0.6){
        var idx = slides.indexOf(entry.target);
        if (idx !== -1) updateUI(idx);
      }
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach(function(s){ io.observe(s); });

  updateUI(0);
  startAutoplay();
})();

(function(){
  var openers = document.querySelectorAll('[data-open-modal]');
  if (!openers.length) return;
  var lastFocused = null;

  function openModal(overlay){
    lastFocused = document.activeElement;
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    var closeBtn = overlay.querySelector('.modal-box-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeModal(overlay){
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }
  function activeOverlay(){
    return document.querySelector('.modal-overlay.open');
  }

  openers.forEach(function(btn){
    btn.addEventListener('click', function(){
      var overlay = document.getElementById('modal-' + btn.getAttribute('data-open-modal'));
      if (overlay) openModal(overlay);
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(function(overlay){
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelectorAll('[data-close-modal]').forEach(function(btn){
      btn.addEventListener('click', function(){ closeModal(overlay); });
    });
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    var open = activeOverlay();
    if (open) closeModal(open);
  });
})();

(function(){
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  function effectiveTheme(){
    var explicit = document.documentElement.getAttribute('data-theme');
    if (explicit === 'light' || explicit === 'dark') return explicit;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch(e){}
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  btn.setAttribute('aria-pressed', effectiveTheme() === 'dark' ? 'true' : 'false');
  btn.addEventListener('click', function(){
    applyTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
  });
})();

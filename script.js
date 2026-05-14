// Dark/Light Theme Toggle
(function () {
  var KEY = 'yuzeracc-theme';
  var root = document.documentElement;

  function getTheme() {
    return localStorage.getItem(KEY) || 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#07070e' : '#f8f9fc');
    }
  }

  applyTheme(getTheme());

  document.addEventListener('click', function (e) {
    if (e.target.closest('#theme-toggle')) {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    }
  });
})();

// Mobile Menu Toggle
(function () {
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.menu-toggle');
    if (!toggle) return;
    var nav = document.querySelector('.nav-links');
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('.nav-links a');
    if (!link) return;
    var nav = document.querySelector('.nav-links');
    nav.classList.remove('open');
    var menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) menuToggle.classList.remove('active');
  });
})();

// Smooth Scroll (with navbar offset)
document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  e.preventDefault();
  var target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  var offset = document.querySelector('.navbar').offsetHeight + 8;
  var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: top, behavior: 'smooth' });
});

// Scroll Animations (Intersection Observer)
(function () {
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
      observer.observe(el);
    });
  });
})();

// Navbar background on scroll
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
})();

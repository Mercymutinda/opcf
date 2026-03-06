/**
 * OPCF-Africa — script.js
 * Handles: Navigation scroll state, scroll reveal animations,
 *          mobile menu, dark/light theme toggle with persistence.
 */

(function () {
    'use strict';
  
    /* ============================================================
       1. DOM REFERENCES
    ============================================================ */
    const html         = document.documentElement;
    const mainNav      = document.getElementById('mainNav');
    const hamburger    = document.getElementById('hamburger');
    const mobileNav    = document.getElementById('mobileNav');
    const mobileClose  = document.getElementById('mobileClose');
    const themeToggle  = document.getElementById('themeToggle');
    const toggleLabel  = themeToggle ? themeToggle.querySelector('.theme-toggle__label') : null;
  
    /* ============================================================
       2. THEME MANAGEMENT
       Persists to localStorage, respects OS preference on first visit
    ============================================================ */
    const THEME_KEY    = 'opcf-theme';
    const DARK_THEME   = 'dark';
    const LIGHT_THEME  = 'light';
  
    /**
     * Determine initial theme:
     * 1. Check localStorage for a saved preference
     * 2. Fall back to OS preference
     * 3. Default to dark
     */
    function getInitialTheme() {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === DARK_THEME || saved === LIGHT_THEME) return saved;
  
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? DARK_THEME : LIGHT_THEME;
    }
  
    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_KEY, theme);
      updateToggleLabel(theme);
      updateToggleAriaLabel(theme);
    }
  
    function updateToggleLabel(theme) {
      if (!toggleLabel) return;
      toggleLabel.textContent = theme === DARK_THEME ? 'Light Mode' : 'Dark Mode';
    }
  
    function updateToggleAriaLabel(theme) {
      if (!themeToggle) return;
      themeToggle.setAttribute(
        'aria-label',
        theme === DARK_THEME ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  
    function toggleTheme() {
      const current = html.getAttribute('data-theme');
      const next    = current === DARK_THEME ? LIGHT_THEME : DARK_THEME;
  
      // Brief scale animation on the button
      if (themeToggle) {
        themeToggle.style.transition = 'transform 0.15s ease, box-shadow 0.3s';
        themeToggle.style.transform  = 'scale(0.92)';
        setTimeout(() => {
          themeToggle.style.transform = '';
        }, 150);
      }
  
      applyTheme(next);
    }
  
    // Boot: apply saved/preferred theme immediately (before paint)
    applyTheme(getInitialTheme());
  
    // Wire up toggle button
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  
    /* ============================================================
       3. NAVIGATION — scroll state
    ============================================================ */
    let lastScrollY = window.scrollY;
    let ticking     = false;
  
    function onScroll() {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    }
  
    function updateNav() {
      if (mainNav) {
        mainNav.classList.toggle('scrolled', lastScrollY > 60);
      }
      ticking = false;
    }
  
    window.addEventListener('scroll', onScroll, { passive: true });
  
    /* ============================================================
       4. SCROLL REVEAL — IntersectionObserver
    ============================================================ */
    const revealElements = document.querySelectorAll('.reveal');
  
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // fire once only
          }
        });
      },
      {
        threshold:   0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );
  
    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  
    /* Hero elements animate in on load (not on scroll) */
    function animateHero() {
      const heroReveals = document.querySelectorAll('.hero .reveal');
      heroReveals.forEach(function (el, index) {
        setTimeout(function () {
          el.classList.add('visible');
        }, 120 + index * 160);
      });
    }
  
    /* ============================================================
       5. MOBILE NAVIGATION
    ============================================================ */
    function openMobileNav() {
      if (!mobileNav || !hamburger) return;
      mobileNav.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // prevent scroll behind overlay
    }
  
    function closeMobileNav() {
      if (!mobileNav || !hamburger) return;
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  
    if (hamburger)   hamburger.addEventListener('click', openMobileNav);
    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  
    // Close when any mobile link is tapped
    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
  
    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });
  
    /* ============================================================
       6. SMOOTH ANCHOR SCROLL
       (Supplements CSS scroll-behavior for older browsers and
        for links that navigate from mobile overlay)
    ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
  
        e.preventDefault();
        const offset = mainNav ? mainNav.offsetHeight : 0;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
  
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  
    /* ============================================================
       7. INIT
    ============================================================ */
    document.addEventListener('DOMContentLoaded', function () {
      animateHero();
      updateNav();          // set initial nav state in case page loads mid-scroll
    });
  
    // If DOMContentLoaded already fired (script deferred)
    if (document.readyState !== 'loading') {
      animateHero();
      updateNav();
    }
  
  })();
  
(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('header');
  const hoverZone = document.querySelector('.top-hover-zone');
  const toggle = document.getElementById('themeToggle');
  const themeText = document.getElementById('themeText');
  const typing = document.getElementById('typingText');
  const progressNumber = document.getElementById('progressNumber');
  const progressLine = document.getElementById('progressLine');
  const progressSection = document.getElementById('progressSection');
  const mouseLight = document.getElementById('mouseLight');

  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  const sectionNames = {
    home: 'HOME',
    projects: 'PROJECTS',
    research: 'RESEARCH',
    about: 'ABOUT',
    skills: 'SKILLS',
    achievements: 'ACHIEVEMENTS',
    contact: 'CONTACT'
  };

  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------- Theme ----------------
  function setTheme(theme) {
    const light = theme === 'light';
    root.setAttribute('data-theme', light ? 'light' : 'dark');

    if (toggle) {
      toggle.setAttribute('aria-pressed', String(light));
      toggle.setAttribute(
        'aria-label',
        light ? 'Switch to dark mode' : 'Switch to light mode'
      );
    }
    if (themeText) {
      themeText.textContent = light ? 'light' : 'dark';
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ---------------- Typewriter ----------------
  const phrases = [
    'Computer Science & Engineering Student.',
    'AI / ML & Computer Vision Enthusiast.',
    'Python & C++ Developer.',
    'Research & Software Development.'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let typeTimer = null;

  function renderPhrase(text) {
    if (typing) typing.textContent = text;
  }

  function typeNext() {
    const current = phrases[phraseIndex];

    if (deleting) {
      charIndex = Math.max(0, charIndex - 1);
    } else {
      charIndex = Math.min(current.length, charIndex + 1);
    }

    renderPhrase(current.slice(0, charIndex));

    if (!deleting && charIndex === current.length) {
      deleting = true;
      typeTimer = window.setTimeout(typeNext, 1500);
      return;
    }

    if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeTimer = window.setTimeout(typeNext, 350);
      return;
    }

    typeTimer = window.setTimeout(typeNext, deleting ? 38 : 65);
  }

  if (reducedMotion) {
    renderPhrase(phrases[0]);
  } else {
    renderPhrase(phrases[0]);
    charIndex = phrases[0].length;
    typeTimer = window.setTimeout(typeNext, 1600);
  }

  // ---------------- Header + left rail ----------------
  let lastScrollY = window.scrollY || 0;
  let headerRaf = 0;
  let progressRaf = 0;
  let hoverReveal = false;

  function chromeHeight() {
    return window.innerWidth <= 800 ? 64 : 76;
  }

  function showHeader() {
    if (header) header.classList.remove('nav-hidden');
    root.style.setProperty('--chrome-top', chromeHeight() + 'px');
  }

  function hideHeader() {
    if (header) header.classList.add('nav-hidden');
    root.style.setProperty('--chrome-top', '0px');
  }

  function handleScrollState() {
    const currentY = window.scrollY || 0;
    const delta = currentY - lastScrollY;

    if (currentY <= 12) {
      showHeader();
    } else if (!hoverReveal && Math.abs(delta) > 3) {
      if (delta > 0) {
        hideHeader();
      } else {
        showHeader();
      }
    }

    lastScrollY = currentY;
    headerRaf = 0;
  }

  function updateProgress() {
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const percent = maxScroll === 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((window.scrollY / maxScroll) * 100)));

    if (progressNumber) {
      progressNumber.textContent = String(percent).padStart(2, '0') + '%';
    }

    if (progressLine) {
      const lineHeight = 25 + (percent * 1.15);
      progressLine.style.height = Math.min(150, Math.max(25, lineHeight)) + 'px';
    }

    let current = 'home';
    const marker = (window.scrollY || 0) + 150;

    sections.forEach(function (section) {
      if (section.offsetTop <= marker) current = section.id;
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });

    if (progressSection) {
      progressSection.textContent = sectionNames[current] || current.toUpperCase();
      progressSection.classList.toggle('visible', current !== 'home');
    }

    progressRaf = 0;
  }

  window.addEventListener('scroll', function () {
    if (!headerRaf) {
      headerRaf = window.requestAnimationFrame(handleScrollState);
    }
    if (!progressRaf) {
      progressRaf = window.requestAnimationFrame(updateProgress);
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    root.style.setProperty('--chrome-top', chromeHeight() + 'px');
    updateProgress();
  });

  if (hoverZone) {
    hoverZone.addEventListener('mouseenter', function () {
      hoverReveal = true;
      showHeader();
    });
    hoverZone.addEventListener('mouseleave', function () {
      hoverReveal = false;
    });
  }

  if (header) {
    header.addEventListener('mouseenter', function () {
      hoverReveal = true;
      showHeader();
    });
    header.addEventListener('mouseleave', function () {
      hoverReveal = false;
    });
  }

  // ---------------- Mouse-follow light ----------------
  if (
    mouseLight &&
    !reducedMotion &&
    window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lightX = mouseX;
    let lightY = mouseY;
    let lightRaf = 0;

    window.addEventListener('pointermove', function (event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      mouseLight.style.opacity = '1';

      if (!lightRaf) {
        lightRaf = window.requestAnimationFrame(function animateLight() {
          lightX += (mouseX - lightX) * 0.12;
          lightY += (mouseY - lightY) * 0.12;

          mouseLight.style.left = lightX + 'px';
          mouseLight.style.top = lightY + 'px';

          if (Math.abs(mouseX - lightX) > 0.2 || Math.abs(mouseY - lightY) > 0.2) {
            lightRaf = window.requestAnimationFrame(animateLight);
          } else {
            lightRaf = 0;
          }
        });
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      mouseLight.style.opacity = '0';
    });
  }

  // ---------------- Scroll reveal ----------------
  const revealItems = Array.from(document.querySelectorAll('.reveal'));

  if (
    'IntersectionObserver' in window &&
    !reducedMotion
  ) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealItems.forEach(function (element) {
      observer.observe(element);
    });
  } else {
    revealItems.forEach(function (element) {
      element.classList.add('visible');
    });
  }

  // Initial state
  root.style.setProperty('--chrome-top', chromeHeight() + 'px');
  showHeader();
  updateProgress();

  // Avoid unused-timer warnings on page teardown where supported.
  window.addEventListener('pagehide', function () {
    if (typeTimer) window.clearTimeout(typeTimer);
    if (headerRaf) window.cancelAnimationFrame(headerRaf);
    if (progressRaf) window.cancelAnimationFrame(progressRaf);
  });
})();

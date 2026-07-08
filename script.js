/* =====================================================
   SPICE ROUTE — Interactive JavaScript
   ===================================================== */

// ====================== CONFIG ======================
const WHATSAPP_NUMBER = '919876543210'; // Replace with actual number
const RESTAURANT_NAME = 'Spice Route';

// ====================== NAVBAR ======================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initMenuFilters();
  initGallery();
  initOfferBanner();
  initReservationDate();
  initSmoothCounters();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Only apply scroll effect on pages where navbar starts transparent (home page)
  const isHomePage = document.querySelector('.hero');
  if (!isHomePage) return;

  // Remove the scrolled class initially on home page
  navbar.classList.remove('scrolled');

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// ====================== MOBILE MENU ======================
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ====================== SCROLL REVEAL ======================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the animation slightly
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ====================== MENU FILTERS ======================
function initMenuFilters() {
  // Menu page filters
  const filterBtns = document.querySelectorAll('[data-filter]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items
      const menuItems = document.querySelectorAll('.menu-item');
      const categories = document.querySelectorAll('.menu-category');

      menuItems.forEach(item => {
        const type = item.dataset.type;
        const isSpicy = item.dataset.spicy === 'true';
        let show = true;

        switch (filter) {
          case 'all':
            show = true;
            break;
          case 'veg':
            show = type === 'veg';
            break;
          case 'nonveg':
            show = type === 'nonveg';
            break;
          case 'spicy':
            show = isSpicy;
            break;
          case 'starters':
          case 'mains':
          case 'beverages':
          case 'desserts':
            const parentCategory = item.closest('.menu-category');
            show = parentCategory && parentCategory.dataset.category === filter;
            break;
        }

        item.style.display = show ? '' : 'none';
        item.style.opacity = show ? '1' : '0';
        item.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
      });

      // Show/hide category headers based on visible items
      categories.forEach(cat => {
        const visibleItems = cat.querySelectorAll('.menu-item[style=""], .menu-item:not([style])');
        const hasVisible = Array.from(cat.querySelectorAll('.menu-item')).some(
          item => item.style.display !== 'none'
        );

        if (filter === 'all') {
          cat.style.display = '';
        } else if (['starters', 'mains', 'beverages', 'desserts'].includes(filter)) {
          cat.style.display = cat.dataset.category === filter ? '' : 'none';
        } else {
          cat.style.display = hasVisible ? '' : 'none';
        }
      });
    });
  });

  // Gallery filters
  const galleryFilterBtns = document.querySelectorAll('[data-gallery-filter]');
  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.galleryFilter;

      galleryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const items = document.querySelectorAll('[data-gallery-type]');
      items.forEach(item => {
        const match = filter === 'all' || item.dataset.galleryType === filter;
        item.style.display = match ? '' : 'none';
        if (match) {
          item.style.animation = 'fadeInUp 0.5s ease-out';
        }
      });
    });
  });
}

// ====================== GALLERY & LIGHTBOX ======================
function initGallery() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  if (!lightbox) return;

  // Open lightbox
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// ====================== WHATSAPP INTEGRATION ======================
function orderWhatsApp(item) {
  let message = '';

  if (item) {
    message = encodeURIComponent(
      `Hi ${RESTAURANT_NAME}! 🍛\n\nI'd like to order:\n• ${item}\n\nPlease confirm availability and total.\n\nThank you!`
    );
  } else {
    message = encodeURIComponent(
      `Hi ${RESTAURANT_NAME}! 🍛\n\nI'd like to place an order:\n\n1. \n2. \n3. \n\nDelivery Address: \n\nPlease confirm availability and total.\n\nThank you!`
    );
  }

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  return false;
}

function reserveWhatsApp() {
  const message = encodeURIComponent(
    `Hi ${RESTAURANT_NAME}! 🪑\n\nI'd like to reserve a table:\n\n📅 Date: \n🕐 Time: \n👥 Guests: \n🎉 Occasion: \n\nPlease confirm availability.\n\nThank you!`
  );

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  return false;
}

// ====================== FORM HANDLERS ======================
function handleContactSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');

  // Animate form out
  form.style.opacity = '0';
  form.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    form.style.display = 'none';
    success.style.display = 'block';
    success.style.animation = 'fadeInUp 0.5s ease-out';
  }, 300);
}

function handleReservationSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('reservationForm');
  const success = document.getElementById('reservationSuccess');

  // Gather form data for WhatsApp message
  const name = document.getElementById('res-name').value;
  const phone = document.getElementById('res-phone').value;
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  const guests = document.getElementById('res-guests').value;
  const occasion = document.getElementById('res-occasion').value;
  const requests = document.getElementById('res-requests').value;

  // Animate form transition
  form.style.opacity = '0';
  form.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    form.style.display = 'none';
    success.style.display = 'block';
    success.style.animation = 'fadeInUp 0.5s ease-out';
  }, 300);

  // Also send via WhatsApp for instant confirmation
  const message = encodeURIComponent(
    `Hi ${RESTAURANT_NAME}! 🪑\n\nNew Table Reservation:\n\n👤 Name: ${name}\n📱 Phone: ${phone}\n📅 Date: ${date}\n🕐 Time: ${time}\n👥 Guests: ${guests}\n🎉 Occasion: ${occasion}\n📝 Requests: ${requests || 'None'}\n\nPlease confirm. Thank you!`
  );

  // Open WhatsApp in background
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  // Don't auto-open to avoid popup blockers; user can click the chat button in success state
}

// ====================== OFFER BANNER ======================
function initOfferBanner() {
  const banner = document.getElementById('offerBanner');
  if (!banner) return;

  // Show banner after 5 seconds
  setTimeout(() => {
    // Only show if user hasn't dismissed it in this session
    if (!sessionStorage.getItem('offerDismissed')) {
      banner.classList.add('visible');
    }
  }, 5000);

  const closeBtn = banner.querySelector('.offer-banner-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.classList.remove('visible');
      sessionStorage.setItem('offerDismissed', 'true');
    });
  }
}

// ====================== RESERVATION DATE ======================
function initReservationDate() {
  const dateInput = document.getElementById('res-date');
  if (!dateInput) return;

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
  dateInput.value = today;

  // Max date = 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
}

// ====================== SMOOTH COUNTERS ======================
function initSmoothCounters() {
  const statValues = document.querySelectorAll('.hero-stat-value');
  if (!statValues.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
  const text = element.textContent;
  const match = text.match(/(\d+)/);
  if (!match) return;

  const target = parseInt(match[1]);
  const suffix = text.replace(match[1], '').trim();
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ====================== REVIEWS AUTO-SCROLL ======================
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.reviews-track');
  if (!track) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    track.scrollLeft = scrollLeft - walk;
  });

  // Auto scroll reviews
  let autoScrollInterval;
  const startAutoScroll = () => {
    autoScrollInterval = setInterval(() => {
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: 360, behavior: 'smooth' });
      }
    }, 4000);
  };

  startAutoScroll();

  track.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
  track.addEventListener('mouseleave', startAutoScroll);
  track.addEventListener('touchstart', () => clearInterval(autoScrollInterval), { passive: true });
  track.addEventListener('touchend', () => {
    setTimeout(startAutoScroll, 3000);
  });
});

// ====================== SMOOTH SCROLL FOR ANCHOR LINKS ======================
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href');
  if (targetId === '#') return;

  const targetEl = document.querySelector(targetId);
  if (targetEl) {
    e.preventDefault();
    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
});

// ====================== PARALLAX HERO (subtle) ======================
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-bg img');
  if (!hero) return;

  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
  }
}, { passive: true });

// ====================== PRELOADER ======================
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

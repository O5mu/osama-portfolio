/* ==========================================================================
   OSAMA AL-BASSAM - PORTFOLIO SCRIPT ENGINE
   Includes: Interactive Mouse-Reactive Particle Canvas, CV Modal, Toast
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initMobileMenu();
  initCvModal();
  initInteractiveParticleCanvas();
});

/* --------------------------------------------------------------------------
   Toast Notification Helper
   -------------------------------------------------------------------------- */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

/* --------------------------------------------------------------------------
   Mobile Menu
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => menu.classList.add('hidden'));
    });
  }
}

/* --------------------------------------------------------------------------
   CV Modal
   -------------------------------------------------------------------------- */
function openCvModal() {
  const modal = document.getElementById('cv-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCvModal() {
  const modal = document.getElementById('cv-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function initCvModal() {
  const openBtn = document.getElementById('open-cv-btn');
  const closeBtn = document.getElementById('close-cv-modal-btn');
  const modal = document.getElementById('cv-modal');

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCvModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCvModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCvModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeCvModal();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   INTERACTIVE MOUSE-REACTIVE PARTICLE CANVAS
   -------------------------------------------------------------------------- */
function initInteractiveParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Update mouse radius on resize
    mouse.radius = window.innerWidth >= 2560 ? 280 : window.innerWidth >= 1920 ? 200 : 160;
  });

  // Mouse / Touch tracking
  const mouse = {
    x: null,
    y: null,
    radius: window.innerWidth >= 2560 ? 280 : window.innerWidth >= 1920 ? 200 : 160
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle creation — scale count cap by resolution
  const maxParticles = window.innerWidth >= 2560 ? 200 : window.innerWidth >= 1920 ? 130 : 85;
  const particleCount = Math.min(Math.floor((width * height) / 14000), maxParticles);
  const particles = [];

  const colors = [
    'rgba(59, 130, 246, ',  // Electric Blue
    'rgba(6, 182, 212, ',   // Cyber Cyan
    'rgba(16, 185, 129, ',  // Emerald
    'rgba(147, 197, 253, '  // Soft Light Blue
  ];

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.75;
      this.vy = (Math.random() - 0.5) * 0.75;
      this.baseRadius = Math.random() * 1.6 + 1.2;
      this.radius = this.baseRadius;
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.4 + 0.35;
    }

    update() {
      // Natural drifting
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges smoothly
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      // Mouse Hover Physics Interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          // Glow and grow when hovered
          const hoverFactor = 1 - dist / mouse.radius;
          this.radius = this.baseRadius + hoverFactor * 2.2;

          // Gentle evasion / push-away when cursor gets close
          if (dist < 100) {
            const force = (100 - dist) / 100;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 1.8;
            this.y -= Math.sin(angle) * force * 1.8;
          }
        } else {
          // Smooth return to normal radius
          if (this.radius > this.baseRadius) {
            this.radius -= 0.05;
          }
        }
      } else {
        if (this.radius > this.baseRadius) {
          this.radius -= 0.05;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw inter-particle constellation lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 110 * 110) {
          const dist = Math.sqrt(distSq);
          const lineAlpha = (1 - dist / 110) * 0.16;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    // 2. Draw dynamic interactive connections to Mouse Hover position
    if (mouse.x !== null && mouse.y !== null) {
      for (let i = 0; i < particles.length; i++) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < mouse.radius * mouse.radius) {
          const dist = Math.sqrt(distSq);
          const mouseLineAlpha = (1 - dist / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${mouseLineAlpha})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }

      // Subtle glowing dot at cursor position
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.fill();
    }

    // 3. Update & render particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

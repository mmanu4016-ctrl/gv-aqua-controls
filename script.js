// Video Hero and Particle Overlay Implementation

// Particle system (same as previous implementation)
const particles = [];
const particleContainer = document.getElementById('particle-overlay');
const particleCount = 20;

function createParticles() {
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.classList.add('particle-element');
    const size = Math.random() * 4 + 2;
    p.style.position = 'absolute';
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.borderRadius = '50%';
    p.style.background = Math.random() > 0.5 ? 'var(--accent-cyan)' : 'var(--accent-blue)';
    p.style.boxShadow = `0 0 10px ${p.style.background}`;
    p.style.opacity = Math.random() * 0.4 + 0.1;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    particleContainer.appendChild(p);
    particles.push({ element: p, x, y, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.6 - 0.2, size });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = window.innerWidth;
    if (p.x > window.innerWidth) p.x = 0;
    if (p.y < 0) p.y = window.innerHeight;
    p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
  });
}

// Initialise video hero
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;
  // Start hidden, fade in when metadata is loaded
  video.style.opacity = '0';
  video.addEventListener('loadedmetadata', () => {
    video.style.transition = 'opacity 1s ease';
    video.style.opacity = '1';
    video.play().catch(() => {});
  });
  // Ensure the video does not loop; it will pause on the last frame automatically
  video.loop = false;
  // When video ends, keep it displayed (paused on last frame)
  video.addEventListener('ended', () => {
    video.pause(); // ensure it stays on the final frame
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // Hide preloader (no longer needed for frame preload)
  const preloader = document.getElementById('preloader');
  if (preloader) preloader.classList.add('fade-out');
  document.body.style.overflow = 'auto';

  initHeroVideo();
  createParticles();
  requestAnimationFrame(animationLoop);
});

function animationLoop() {
  updateParticles();
  requestAnimationFrame(animationLoop);
}

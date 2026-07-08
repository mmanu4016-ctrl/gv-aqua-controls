// Global variables and constants
const frameCount = 120;
const images = [];
let imagesLoadedCount = 0;
const canvas = document.getElementById('scrolly-canvas');
const ctx = canvas.getContext('2d');

// Image sequence folder & padding format: frames/ezgif-frame-001.jpg to frames/ezgif-frame-240.jpg
const getFramePath = (index) => {
  const pad = index.toString().padStart(3, '0');
  return `frames/ezgif-frame-${pad}.jpg`;
};

// Lerp scroll coordinates for 120fps physical smoothness
const scrollState = {
  currentFrame: 1,
  targetFrame: 1,
  ease: 0.08
};

// Preload Image Sequence
function preloadImages() {
  const loaderBar = document.getElementById('loading-bar');
  const loaderPercent = document.getElementById('loading-percent');
  const preloader = document.getElementById('preloader');

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => {
      imagesLoadedCount++;
      const progress = Math.round((imagesLoadedCount / frameCount) * 100);
      loaderBar.style.width = `${progress}%`;
      loaderPercent.textContent = `${progress}%`;

      if (imagesLoadedCount === frameCount) {
        // Complete preload
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.style.overflow = 'auto';
          initCanvas();
          requestAnimationFrame(animationLoop);
        }, 600);
      }
    };
    img.onerror = () => {
      console.error(`Failed to load frame: ${getFramePath(i)}`);
      // Count anyway to avoid getting stuck
      imagesLoadedCount++;
    };
    images[i] = img;
  }
}

// Canvas Initialization & Dynamic Cover Scaling
function initCanvas() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  drawFrame(Math.round(scrollState.currentFrame));
}

function drawFrame(frameIndex) {
  const img = images[frameIndex];
  if (!img) return;

  // Clear Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Aspect ratio scaling (Cover mode - centered)
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const imgWidth = img.naturalWidth || 800;
  const imgHeight = img.naturalHeight || 450;

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, drawX, drawY;

  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    drawWidth = canvasHeight * imgRatio;
    drawHeight = canvasHeight;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Animation Loop (requestAnimationFrame with Lerp)
function animationLoop() {
  const diff = scrollState.targetFrame - scrollState.currentFrame;
  if (Math.abs(diff) > 0.01) {
    scrollState.currentFrame += diff * scrollState.ease;
    drawFrame(Math.round(scrollState.currentFrame));
  }
  
  // Custom particle float logic (subtle blue electrical vibes overlaying canvas)
  updateParticles();
  
  requestAnimationFrame(animationLoop);
}

// Particle Overlay System
const particles = [];
const particleContainer = document.getElementById('particle-overlay');
const particleCount = 20;

function createParticles() {
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.classList.add('particle-element');
    
    // Random styling properties
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
    
    particles.push({
      element: p,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.6 - 0.2, // Drift upwards slightly
      size: size
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    
    // Bounds wrapping
    if (p.x < 0) p.x = window.innerWidth;
    if (p.x > window.innerWidth) p.x = 0;
    if (p.y < 0) p.y = window.innerHeight;
    
    p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
  });
}

// Scroll Event Handler
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  const scrollSection = document.getElementById('scrolly-section');
  
  const scrollTop = window.scrollY;
  const sectionOffset = scrollSection.offsetTop;
  const sectionHeight = scrollSection.offsetHeight;
  
  // Header Sticky background transition
  if (scrollTop > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Scrollytelling active range calculations
  const relativeScroll = scrollTop - sectionOffset;
  const scrollableDistance = sectionHeight - window.innerHeight;
  
  if (relativeScroll >= 0 && relativeScroll <= scrollableDistance) {
    const scrollRatio = relativeScroll / scrollableDistance;
    // Map scroll ratio to target frame index (1 to 240)
    scrollState.targetFrame = 1 + (scrollRatio * (frameCount - 1));
    
    // Update Text Slides highlighting
    const scrollPercent = scrollRatio * 100;
    const slides = document.querySelectorAll('.scroll-slide');
    
    slides.forEach(slide => {
      const start = parseFloat(slide.getAttribute('data-start'));
      const end = parseFloat(slide.getAttribute('data-end'));
      
      if (scrollPercent >= start && scrollPercent <= end) {
        slide.classList.add('active');
        
        // Active link tracking
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === '#scrolly-section') {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      } else {
        slide.classList.remove('active');
      }
    });
  } else if (relativeScroll < 0) {
    scrollState.targetFrame = 1;
    document.getElementById('slide-intro').classList.add('active');
  } else if (relativeScroll > scrollableDistance) {
    scrollState.targetFrame = frameCount;
    document.getElementById('slide-final').classList.add('active');
  }
});

// Interactive Hotspot Logic (PCB Blueprint)
const hotspots = document.querySelectorAll('.pcb-hotspot');
const panelHolder = document.getElementById('info-content-holder');

hotspots.forEach(hotspot => {
  hotspot.addEventListener('click', function() {
    // Reset active class on all hotspots
    hotspots.forEach(h => h.classList.remove('active'));
    
    // Mark this one active
    this.classList.add('active');
    
    const targetId = this.getAttribute('data-target');
    const sourceContent = document.getElementById(targetId);
    
    if (sourceContent) {
      // Fade out old content, switch, fade in
      panelHolder.style.opacity = '0';
      panelHolder.style.transform = 'translateY(10px)';
      panelHolder.style.transition = 'opacity 0.25s, transform 0.25s';
      
      setTimeout(() => {
        panelHolder.innerHTML = sourceContent.innerHTML;
        panelHolder.style.opacity = '1';
        panelHolder.style.transform = 'translateY(0)';
      }, 250);
    }
  });
});

// Smart Home Simulation Engine
const simState = {
  mode: 'AUTO', // 'AUTO', 'DRY', 'VOLTAGE', 'MANUAL'
  overheadLevel: 30,
  sumpLevel: 80,
  voltage: 230,
  motorActive: false,
  impellerAngle: 0,
  impellerTimer: null,
  autoTimer: null,
  voltageTrip: false,
  dryRunTrip: false
};

// Simulation elements
const sumpWater = document.getElementById('sump-water');
const roofWater = document.getElementById('roof-water');
const sliderOverhead = document.getElementById('slider-overhead');
const sliderSump = document.getElementById('slider-sump');
const sliderVoltage = document.getElementById('slider-voltage');
const lblOverhead = document.getElementById('lbl-overhead-val');
const lblSump = document.getElementById('lbl-sump-val');
const lblVoltage = document.getElementById('lbl-voltage-val');
const rowVoltage = document.getElementById('row-voltage');
const rowManualSwitch = document.getElementById('row-manual-switch');
const btnManualToggle = document.getElementById('btn-manual-pump-toggle');
const simStateDesc = document.getElementById('sim-state-desc');
const simLogger = document.getElementById('sim-logger');

// SVG Flow components
const flowSuction = document.getElementById('flow-suction');
const flowDelivery = document.getElementById('flow-delivery');

// SVG LED elements
const ledPower = document.getElementById('led-sim-power');
const ledMotor = document.getElementById('led-sim-motor');
const ledFull = document.getElementById('led-sim-full');
const ledErr = document.getElementById('led-sim-err');

function logTerminal(message, type = 'normal') {
  const line = document.createElement('div');
  line.classList.add('log-line');
  if (type === 'green') line.classList.add('text-green');
  if (type === 'yellow') line.classList.add('text-yellow');
  if (type === 'red') line.classList.add('text-red');
  
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  line.textContent = `[${timeStr}] ${message}`;
  
  simLogger.appendChild(line);
  simLogger.scrollTop = simLogger.scrollHeight;
}

// Toggle Scenario Mode
function setScenarioMode(mode) {
  simState.mode = mode;
  document.querySelectorAll('.scenario-toggles button').forEach(b => b.classList.remove('active'));
  
  // Reset active triggers
  simState.dryRunTrip = false;
  simState.voltageTrip = false;
  
  // UI tweaks based on scenario
  rowVoltage.style.display = mode === 'VOLTAGE' ? 'flex' : 'none';
  rowManualSwitch.style.display = mode === 'MANUAL' ? 'block' : 'none';
  
  if (mode === 'AUTO') {
    document.getElementById('sim-btn-auto').classList.add('active');
    simStateDesc.innerHTML = `
      <h4>Active Scenario: Auto Cycle Mode</h4>
      <p>The controller detects the Overhead Tank level. When it falls to the bottom probe (Low), the motor turns ON automatically. Once it reaches the top probe (Full), the motor turns OFF.</p>
    `;
    logTerminal('[MODE SCENARIO] Switched to Auto Cycle Mode.', 'yellow');
  } else if (mode === 'DRY') {
    document.getElementById('sim-btn-dry').classList.add('active');
    simStateDesc.innerHTML = `
      <h4>Active Scenario: Sump Dry Protection</h4>
      <p>Simulates a dry sump. When the sump level drops below 20%, the system senses high current load/dry-run parameters. It triggers safety cut-off to prevent pump burnout.</p>
    `;
    logTerminal('[MODE SCENARIO] Switched to Sump Dry (Dry Run) test scenario.', 'yellow');
    // Force Sump levels down for demonstration
    sliderSump.value = 10;
    updateSumpLevel(10);
  } else if (mode === 'VOLTAGE') {
    document.getElementById('sim-btn-voltage').classList.add('active');
    simStateDesc.innerHTML = `
      <h4>Active Scenario: Grid Voltage Protection</h4>
      <p>Simulates voltage fluctuations on the main grid. Drag the slider to extremes. Critical thresholds: &lt; 160V or &gt; 260V. Controller cuts supply to guard motor insulation.</p>
    `;
    logTerminal('[MODE SCENARIO] Switched to Voltage Protection scenario.', 'yellow');
  } else if (mode === 'MANUAL') {
    document.getElementById('sim-btn-manual').classList.add('active');
    simStateDesc.innerHTML = `
      <h4>Active Scenario: Manual Override Mode</h4>
      <p>Bypasses automatic sensor level loops. Enables the manual toggle button to control the motor. Overriding respects structural safety triggers (voltage sags/dry run limits).</p>
    `;
    logTerminal('[MODE SCENARIO] Switched to Manual Override Mode.', 'yellow');
  }
  
  // Re-evaluate system cycle
  evalSimulationCycle();
}

// Impeller Rotate Animation
function animateImpeller() {
  if (simState.motorActive) {
    simState.impellerAngle += 15;
    const item1 = document.getElementById('motor-impeller-1');
    const item2 = document.getElementById('motor-impeller-2');
    
    if (item1 && item2) {
      item1.setAttribute('transform', `rotate(${simState.impellerAngle}, 20, 25)`);
      item2.setAttribute('transform', `rotate(${simState.impellerAngle}, 20, 25)`);
    }
    
    // Shift flow dots
    flowSuction.style.strokeDashoffset = (parseFloat(flowSuction.style.strokeDashoffset || 0) - 2).toString();
    flowDelivery.style.strokeDashoffset = (parseFloat(flowDelivery.style.strokeDashoffset || 0) - 2).toString();
    
    requestAnimationFrame(animateImpeller);
  }
}

function setMotorStatus(active) {
  if (simState.motorActive === active) return;
  simState.motorActive = active;
  
  if (active) {
    ledMotor.setAttribute('fill', '#32ff78'); // Green ON
    ledMotor.style.filter = 'drop-shadow(0 0 4px #32ff78)';
    flowSuction.style.display = 'block';
    flowDelivery.style.display = 'block';
    flowSuction.classList.add('flow-active');
    flowDelivery.classList.add('flow-active');
    
    logTerminal('Motor started. Water pump is drawing supply...', 'green');
    btnManualToggle.textContent = 'SWITCH MOTOR OFF';
    btnManualToggle.classList.add('btn-glow');
    
    // Start spin loop
    requestAnimationFrame(animateImpeller);
  } else {
    ledMotor.setAttribute('fill', '#333'); // Off
    ledMotor.style.filter = 'none';
    flowSuction.style.display = 'none';
    flowDelivery.style.display = 'none';
    flowSuction.classList.remove('flow-active');
    flowDelivery.classList.remove('flow-active');
    
    logTerminal('Motor stopped. Flow standby.', 'yellow');
    btnManualToggle.textContent = 'SWITCH MOTOR ON';
    btnManualToggle.classList.remove('btn-glow');
  }
}

// Simulator Update Functions
function updateSumpLevel(val) {
  simState.sumpLevel = parseInt(val);
  lblSump.textContent = `${val}%`;
  
  // Calculate relative height in SVG Sump container
  const rectHeight = 68;
  const fillHeight = (simState.sumpLevel / 100) * rectHeight;
  const newY = 400 + (rectHeight - fillHeight);
  
  sumpWater.setAttribute('y', newY.toString());
  sumpWater.setAttribute('height', fillHeight.toString());
  
  evalSimulationCycle();
}

function updateOverheadLevel(val) {
  simState.overheadLevel = parseInt(val);
  lblOverhead.textContent = `${val}%`;
  
  const rectHeight = 58;
  const fillHeight = (simState.overheadLevel / 100) * rectHeight;
  const newY = 100 + (rectHeight - fillHeight);
  
  roofWater.setAttribute('y', newY.toString());
  roofWater.setAttribute('height', fillHeight.toString());
  
  // Led state Full indicator
  if (simState.overheadLevel >= 95) {
    ledFull.setAttribute('fill', '#3be7ff'); // Cyan full
    ledFull.style.filter = 'drop-shadow(0 0 4px #3be7ff)';
  } else {
    ledFull.setAttribute('fill', '#333');
    ledFull.style.filter = 'none';
  }
  
  evalSimulationCycle();
}

function updateVoltageLevel(val) {
  simState.voltage = parseInt(val);
  lblVoltage.textContent = `${val} V`;
  evalSimulationCycle();
}

// Logic core of the Automation Simulation State Machine
function evalSimulationCycle() {
  // Clear automatic timers
  if (simState.autoTimer) {
    clearInterval(simState.autoTimer);
    simState.autoTimer = null;
  }

  // 1. Safety Checks (Voltage Protection)
  if (simState.mode === 'VOLTAGE' && (simState.voltage < 160 || simState.voltage > 260)) {
    simState.voltageTrip = true;
    setMotorStatus(false);
    ledErr.setAttribute('fill', '#ff2a5f'); // Red Fault
    ledErr.style.filter = 'drop-shadow(0 0 5px #ff2a5f)';
    
    if (simState.voltage < 160) {
      logTerminal(`[FAULT DETECTED] Under Voltage: ${simState.voltage}V. Motor isolated.`, 'red');
    } else {
      logTerminal(`[FAULT DETECTED] Over Voltage: ${simState.voltage}V. Motor isolated.`, 'red');
    }
    return;
  } else {
    simState.voltageTrip = false;
  }

  // 2. Safety Checks (Dry Run Protection)
  if (simState.sumpLevel <= 20) {
    // If motor is running or starts, trip dry run
    if (simState.motorActive || simState.mode === 'DRY') {
      simState.dryRunTrip = true;
      setMotorStatus(false);
      ledErr.setAttribute('fill', '#ff2a5f');
      ledErr.style.filter = 'drop-shadow(0 0 5px #ff2a5f)';
      logTerminal(`[FAULT DETECTED] Dry Run condition! Sump water depleted. Motor stopped.`, 'red');
      return;
    }
  } else {
    simState.dryRunTrip = false;
  }

  // Reset errors if safe conditions met
  if (!simState.dryRunTrip && !simState.voltageTrip) {
    ledErr.setAttribute('fill', '#333');
    ledErr.style.filter = 'none';
  }

  // 3. Operational Logic Loops
  if (simState.mode === 'AUTO') {
    // Automatic sensor triggers
    if (simState.overheadLevel <= 20 && !simState.motorActive) {
      logTerminal('[AUTO TRIG] Overhead Tank Low sensor triggered. Starting Motor...', 'yellow');
      setMotorStatus(true);
    } else if (simState.overheadLevel >= 95 && simState.motorActive) {
      logTerminal('[AUTO TRIG] Overhead Tank Full sensor triggered. Stopping Motor...', 'yellow');
      setMotorStatus(false);
    }
    
    // Auto Cycle Fill Action Sim
    if (simState.motorActive) {
      simState.autoTimer = setInterval(() => {
        if (simState.overheadLevel < 100) {
          // Increase overhead, drain sump
          const nextOverhead = Math.min(simState.overheadLevel + 2, 100);
          const nextSump = Math.max(simState.sumpLevel - 1, 0);
          
          sliderOverhead.value = nextOverhead.toString();
          sliderSump.value = nextSump.toString();
          
          updateOverheadLevel(nextOverhead);
          updateSumpLevel(nextSump);
        } else {
          setMotorStatus(false);
          clearInterval(simState.autoTimer);
        }
      }, 500);
    }
  } else if (simState.mode === 'DRY') {
    // Keep off, no action
    setMotorStatus(false);
  } else if (simState.mode === 'MANUAL') {
    // Controlled exclusively by button switch, check safety limits
    if (simState.motorActive) {
      // Manual running slowly fills overhead
      simState.autoTimer = setInterval(() => {
        if (simState.overheadLevel < 100) {
          const nextOverhead = Math.min(simState.overheadLevel + 2, 100);
          sliderOverhead.value = nextOverhead.toString();
          updateOverheadLevel(nextOverhead);
        } else {
          setMotorStatus(false);
          clearInterval(simState.autoTimer);
          logTerminal('[MANUAL MODE] Tank reached capacity. Motor shut-off override.', 'yellow');
        }
      }, 600);
    }
  }
}

// Attach Simulator Listeners
sliderOverhead.addEventListener('input', (e) => updateOverheadLevel(e.target.value));
sliderSump.addEventListener('input', (e) => updateSumpLevel(e.target.value));
sliderVoltage.addEventListener('input', (e) => updateVoltageLevel(e.target.value));

document.getElementById('sim-btn-auto').addEventListener('click', () => setScenarioMode('AUTO'));
document.getElementById('sim-btn-dry').addEventListener('click', () => setScenarioMode('DRY'));
document.getElementById('sim-btn-voltage').addEventListener('click', () => setScenarioMode('VOLTAGE'));
document.getElementById('sim-btn-manual').addEventListener('click', () => setScenarioMode('MANUAL'));

btnManualToggle.addEventListener('click', () => {
  if (simState.mode !== 'MANUAL') return;
  setMotorStatus(!simState.motorActive);
  evalSimulationCycle();
});

// Card Glow hover effects (Feature Cards)
const cards = document.querySelectorAll('.feature-card');
cards.forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const glow = this.querySelector('.glow-point');
    if (glow) {
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    }
  });
});

// Active Section Tracking on scroll (Navbar links updating)
const observerOptions = {
  root: null,
  rootMargin: '-30% 0px -60% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      const navLinks = document.querySelectorAll('.nav-link');
      
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });
}, observerOptions);

document.querySelectorAll('section[id]').forEach(section => {
  observer.observe(section);
});

// Bootstrapper / On Load
window.addEventListener('DOMContentLoaded', () => {
  preloadImages();
  createParticles();
  
  // Power indicator LED on controller mock
  ledPower.style.filter = 'drop-shadow(0 0 4px #ffaa00)';
  
  // Default active hotspot selection on Blueprint
  const defaultHotspot = document.querySelector('.pcb-hotspot[data-target="info-mcu"]');
  if (defaultHotspot) {
    defaultHotspot.click();
  }
});

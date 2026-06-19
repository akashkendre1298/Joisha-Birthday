/* ==========================================
   WEB AUDIO API: SOUND SYNTHESIS ENGINE
   ========================================== */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isEnabled = false;
        this.ambientInterval = null;
        this.currentNote = 0;
        this.synthNodes = [];
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.isEnabled = true;
    }

    stopAll() {
        this.synthNodes.forEach(node => {
            try { node.stop(); } catch (e) { }
        });
        this.synthNodes = [];
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
    }

    // Play a short retro UI click sound
    playClick() {
        if (!this.isEnabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Play a subtle hover blip
    playHover() {
        if (!this.isEnabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Play a rising panic alarm sound
    playPanic(pitchMultiplier = 1) {
        if (!this.isEnabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150 * pitchMultiplier, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400 * pitchMultiplier, this.ctx.currentTime + 0.25);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(155 * pitchMultiplier, this.ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(405 * pitchMultiplier, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
        osc2.start();
        osc2.stop(this.ctx.currentTime + 0.3);
    }

    // Play critical lobby failure explosion
    playExplosion() {
        if (!this.isEnabled || !this.ctx) return;

        // Generate noise buffer
        const bufferSize = this.ctx.sampleRate * 1.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noiseNode.start();
        noiseNode.stop(this.ctx.currentTime + 1.5);
    }

    // Sound effect for screen glitch transition
    playGlitchTransition() {
        if (!this.isEnabled || !this.ctx) return;

        const duration = 0.8;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);

        // Rapid frequency modifications to simulate glitches
        for (let t = 0; t < duration; t += 0.05) {
            osc.frequency.setValueAtTime(50 + Math.random() * 500, this.ctx.currentTime + t);
        }

        filter.type = 'bandpass';
        filter.frequency.value = 600;

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // Play a special chimes/fanfare sound when envelope is opened
    playChime() {
        if (!this.isEnabled || !this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.06, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);

            this.synthNodes.push(osc);
        });
    }

    // Play soft emotional background ambient music pad synthesizer
    startAmbientPad() {
        if (!this.isEnabled || !this.ctx) return;
        this.stopAll();

        // 4 Chords in progression (Am9 - Fmaj7 - Cmaj9 - G6)
        const chords = [
            [220, 261.63, 329.63, 392, 493.88], // A3, C4, E4, G4, B4
            [174.61, 261.63, 329.63, 349.23, 440], // F3, C4, E4, F4, A4
            [261.63, 329.63, 392, 493.88, 523.25], // C4, E4, G4, B4, C5
            [196, 246.94, 293.66, 392, 440]  // G3, B3, D4, G4, A4
        ];

        const playPadChord = () => {
            const chord = chords[this.currentNote];
            this.currentNote = (this.currentNote + 1) % chords.length;

            // Build simple additive synth oscillator voices
            chord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();

                osc.type = idx === 0 ? 'sawtooth' : 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                // Fine detune for chorus warmth
                osc.detune.setValueAtTime((Math.random() - 0.5) * 15, this.ctx.currentTime);

                // Slow attack, sustain, slow release envelopes
                const attack = 1.5;
                const release = 3.5;
                const maxGain = 0.025 / chord.length;

                gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(maxGain, this.ctx.currentTime + attack);
                gainNode.gain.setValueAtTime(maxGain, this.ctx.currentTime + 4.5);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5 + release);

                // Add a lowpass filter to make it soft and warm
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(idx === 0 ? 300 : 800, this.ctx.currentTime);

                osc.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 4.5 + release);

                this.synthNodes.push(osc);
            });
        };

        playPadChord();
        this.ambientInterval = setInterval(playPadChord, 6000); // Trigger new chord every 6 seconds
    }
}

const sounds = new SoundEngine();

// ==========================================
/* BACKGROUND CANVAS: GLOWING NODE SYSTEM */
// ==========================================
class CanvasGridParticles {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.width = 0;
        this.height = 0;
        this.mouse = { x: null, y: null };
        this.gridInterval = 50;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Generate neon ambient particles
        const count = Math.min(60, Math.floor((this.width * this.height) / 25000));
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }

        this.animate();
    }

    createParticle(x = null, y = null) {
        return {
            x: x !== null ? x : Math.random() * this.width,
            y: y !== null ? y : Math.random() * this.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            color: Math.random() > 0.5 ? '#00ff88' : '#ffb700',
            alpha: Math.random() * 0.6 + 0.2
        };
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    triggerExplosion(x, y) {
        const explosionCount = 20;
        for (let i = 0; i < explosionCount; i++) {
            const p = this.createParticle(x, y);
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 4 + 2;
            p.speedX = Math.cos(angle) * velocity;
            p.speedY = Math.sin(angle) * velocity;
            p.size = Math.random() * 3 + 2;
            p.alpha = 1;
            this.particles.push(p);
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.018)';
        this.ctx.lineWidth = 1;

        // Draw vertical grid lines
        for (let x = 0; x < this.width; x += this.gridInterval) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = 0; y < this.height; y += this.gridInterval) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw static grid lines
        this.drawGrid();

        // Update and draw particles
        this.particles.forEach((p, idx) => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Bounce on boundaries
            if (p.x < 0 || p.x > this.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.height) p.speedY *= -1;

            // Draw particle
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.restore();

            // Link particles that are close
            for (let j = idx + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 120) {
                    this.ctx.save();
                    this.ctx.globalAlpha = (1 - (dist / 120)) * 0.15;
                    this.ctx.strokeStyle = p.color;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }

            // Mouse proximity repulsion
            if (this.mouse.x !== null) {
                const mDist = Math.hypot(p.x - this.mouse.x, p.y - this.mouse.y);
                if (mDist < 100) {
                    const force = (100 - mDist) / 100;
                    const angle = Math.atan2(p.y - this.mouse.y, p.x - this.mouse.x);
                    p.x += Math.cos(angle) * force * 2;
                    p.y += Math.sin(angle) * force * 2;
                }
            }

            // Clean up extra exploded particles that faded away
            if (p.alpha > 0.8) {
                p.alpha -= 0.015; // Fade explosion particles
            }
        });

        // Limit maximum particles to prevent performance drag
        if (this.particles.length > 200) {
            this.particles.splice(60, this.particles.length - 200);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================
/* DOM INTERACTION & PAGE CONTROL */
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lock snap scroll until envelope is opened
    const snapContainer = document.querySelector('.snap-container');
    snapContainer.classList.add('locked');

    // 2. Initialize background particle graphics
    const particles = new CanvasGridParticles();

    // 3. Envelope opening interaction
    const envelope = document.getElementById('envelope');
    const envelopeOverlay = document.getElementById('envelope-overlay');

    envelope.addEventListener('click', () => {
        if (envelope.classList.contains('open')) return;

        // Initialize Audio Context on click due to browser user-gesture policy
        sounds.init();

        envelope.classList.add('open');
        sounds.playClick();

        // Synthesize party chimes fanfare
        sounds.playChime();

        // Blow party confetti bomb (burst multiple explosions on canvas)
        setTimeout(() => {
            sounds.playExplosion();
            particles.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2 - 50);

            // Secondary confetti bursts
            setTimeout(() => {
                particles.triggerExplosion(window.innerWidth / 2 - 120, window.innerHeight / 2 + 50);
                particles.triggerExplosion(window.innerWidth / 2 + 120, window.innerHeight / 2 + 50);
            }, 150);
        }, 400);

        // Reveal the website scroll
        setTimeout(() => {
            envelopeOverlay.classList.add('fade-out');
            snapContainer.classList.remove('locked');
        }, 1600);
    });

    // 2. Sound activation / Toggle
    const soundToggle = document.getElementById('sound-toggle');
    const soundOnIcon = soundToggle.querySelector('.sound-on');
    const soundOffIcon = soundToggle.querySelector('.sound-off');
    const soundLabel = soundToggle.querySelector('span');

    soundToggle.addEventListener('click', () => {
        if (!sounds.ctx) {
            sounds.init();
        }

        sounds.isEnabled = !sounds.isEnabled;
        sounds.playClick();

        if (sounds.isEnabled) {
            soundOnIcon.classList.remove('hidden');
            soundOffIcon.classList.add('hidden');
            soundLabel.textContent = 'Audio: On';
            // Start ambient loop if we are currently on secret screen
            if (document.getElementById('secret-overlay').classList.contains('active')) {
                sounds.startAmbientPad();
            }
        } else {
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
            soundLabel.textContent = 'Audio: Off';
            sounds.stopAll();
        }
    });

    // Universal audio feedback on button hovers
    const interactiveButtons = document.querySelectorAll('button, .dot-link, .chaos-item');
    interactiveButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => sounds.playHover());
    });

    // 3. Dot Navigation active states synchronization
    const sections = document.querySelectorAll('.snap-section');
    const dotLinks = document.querySelectorAll('.dot-link');

    const updateActiveDot = (sectionId) => {
        dotLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Use Intersection Observer for highly accurate scrolling alignment detection
    const observerOptions = {
        root: snapContainer,
        threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                updateActiveDot(id);
                // Trigger entry transitions for elements inside card
                entry.target.querySelectorAll('.fade-in').forEach(el => {
                    el.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Handle dot clicks for custom scrolling
    dotLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);

            sounds.playClick();
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 4. Panic Meter interactive panel
    const panicBtn = document.getElementById('panic-btn');
    const panicFill = document.getElementById('panic-meter-fill');
    let panicValue = 25;

    panicBtn.addEventListener('click', () => {
        sounds.playClick();
        if (panicValue < 100) {
            panicValue += 25;
            panicFill.style.width = panicValue + '%';

            // Screen rumble shockwave effect
            document.body.classList.add('glitch-flash');
            setTimeout(() => document.body.classList.remove('glitch-flash'), 100);

            // Synthesize panic beep at matching speed/pitch
            sounds.playPanic(panicValue / 25);

            if (panicValue === 100) {
                panicBtn.textContent = 'CRITICAL OVERHEAT! 🚨';
                setTimeout(() => {
                    // Trigger massive canvas burst
                    sounds.playExplosion();
                    particles.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);

                    // Shake and reset
                    panicBtn.textContent = 'Induce Chaos! 🚨';
                    panicValue = 25;
                    panicFill.style.width = '25%';
                }, 600);
            }
        }
    });

    // 5. Glitch transition & Don't Click button flow
    const dontClickBtn = document.getElementById('donot-click-btn');
    const secretOverlay = document.getElementById('secret-overlay');
    const typingContainer = document.getElementById('typing-container');
    const heartContainer = document.getElementById('heart-container');
    const restartBtn = document.getElementById('restart-btn');

    const secretText = `Jokes apart…\n\nYou’re not just our BGMI partner…\n\nYou’re our best friend.\n\nAnd we’re really lucky to have you.`;

    const startTypingEffect = (text, callback) => {
        typingContainer.innerHTML = '';
        typingContainer.classList.remove('typing-done');
        let index = 0;

        const typeChar = () => {
            if (index < text.length) {
                const char = text[index++];
                if (char === '\n') {
                    typingContainer.innerHTML += '<br>';
                } else {
                    typingContainer.innerHTML += char;
                }
                // Synthesize subtle keyboard key clicks
                sounds.playHover();
                setTimeout(typeChar, 70);
            } else {
                typingContainer.classList.add('typing-done');
                if (callback) callback();
            }
        };
        typeChar();
    };

    dontClickBtn.addEventListener('click', () => {
        sounds.playClick();
        sounds.playGlitchTransition();

        // Flash screen glitched layout
        document.body.classList.add('glitch-flash');

        setTimeout(() => {
            document.body.classList.remove('glitch-flash');
            // Open full secret layout modal
            secretOverlay.classList.add('active');

            // Start ambient synths in the background if audio is active
            if (sounds.isEnabled) {
                sounds.startAmbientPad();
            }

            // Start typewriter sequence
            setTimeout(() => {
                startTypingEffect(secretText, () => {
                    // Typewriter done -> Fade in heart signatures
                    setTimeout(() => {
                        heartContainer.classList.remove('hidden');
                    }, 500);
                });
            }, 500);
        }, 600);
    });

    // Replay memories restart trigger
    restartBtn.addEventListener('click', () => {
        sounds.playClick();
        sounds.stopAll();

        secretOverlay.classList.remove('active');
        heartContainer.classList.add('hidden');
        typingContainer.innerHTML = '';
        typingContainer.classList.remove('typing-done');

        // Scroll back to main hero banner
        document.getElementById('hero').scrollIntoView({ behavior: 'auto' });
    });

    // Pulsating heart interactive trigger
    const pulseHeart = document.querySelector('.pulse-heart');
    pulseHeart.addEventListener('click', (e) => {
        sounds.playPanic(1.5);
        particles.triggerExplosion(e.clientX, e.clientY);
    });
});

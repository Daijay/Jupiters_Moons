// ============================================
// JUPITER'S MOONS - Cutscene System
// Premium Cinematic Experience
// A Galileo Mission
// ============================================

class CutsceneManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentScene = 0;
        this.isPlaying = false;
        this.particles = [];
        this.stars = [];
        this.animationId = null;
        this.jupiterRotation = 0;
        this.probePosition = { x: 0, y: 0 };
        this.yearCounter = 1989;
        this.canSkip = false;
        this.skipRequested = false;
        this.sceneResolve = null;
        this.typingAudio = null;
        this.isTyping = false;
        this.initAudio();
    }

    initAudio() {
        this.audioCtx = null;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio not supported');
        }
    }

    playTypeSound() {
        if (!this.audioCtx) return;

        try {
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + 0.05);
        } catch (e) {
            // Ignore audio errors
        }
    }

    async typeText(element, text, speed = 30) {
        element.innerHTML = `<span class="typed-text"></span><span class="untyped-text" style="opacity:0">${text}</span>`;
        element.classList.add('visible');
        this.isTyping = true;

        const typedSpan = element.querySelector('.typed-text');
        const untypedSpan = element.querySelector('.untyped-text');

        let soundCounter = 0;
        for (let i = 0; i < text.length; i++) {
            if (this.skipRequested) {
                typedSpan.textContent = text;
                untypedSpan.textContent = '';
                break;
            }
            typedSpan.textContent = text.substring(0, i + 1);
            untypedSpan.textContent = text.substring(i + 1);

            if (text[i] !== ' ' && soundCounter % 2 === 0) {
                this.playTypeSound();
            }
            soundCounter++;

            let charDelay = speed;
            if (text[i] === '.' || text[i] === ',' || text[i] === '!' || text[i] === '?') {
                charDelay = speed * 3;
            }

            await this.delay(charDelay);
        }
        this.isTyping = false;
    }

    speakText(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.88;
        utterance.pitch = 1.15;
        utterance.volume = 1;

        const pickFemale = (voices) => {
            // Prefer named female / neutral voices, avoid explicitly male
            const priority = [
                v => v.name.includes('Zira'),
                v => v.name.includes('Samantha'),
                v => v.name.includes('Google UK English Female'),
                v => v.name.includes('Google US English') && !v.name.toLowerCase().includes('male'),
                v => v.name.includes('Female') || v.name.includes('female'),
                v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male') && !v.name.includes('David') && !v.name.includes('Mark') && !v.name.includes('James'),
                v => v.lang.startsWith('en'),
            ];
            for (const test of priority) {
                const found = voices.find(test);
                if (found) return found;
            }
            return null;
        };

        const doSpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            const voice = pickFemale(voices);
            if (voice) utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        };

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            doSpeak();
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.onvoiceschanged = null;
                doSpeak();
            };
            // Safety fallback if onvoiceschanged never fires
            setTimeout(() => {
                if (!window.speechSynthesis.speaking) doSpeak();
            }, 600);
        }
    }

    stopSpeaking() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    skipToNext() {
        if (this.canSkip) {
            this.skipRequested = true;
        }
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.generateStars();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 500; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    drawStarfield(time) {
        // Real NASA nebula image as deep space background
        if (!GameImages.drawCover(this.ctx, 'nebula', 0, 0, this.canvas.width, this.canvas.height)) {
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.ctx.fillStyle = 'rgba(0, 0, 10, 0.45)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const alpha = star.brightness * twinkle;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fill();

            if (star.size > 1.5) {
                const glow = this.ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, star.size * 4
                );
                glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
                glow.addColorStop(1, 'transparent');
                this.ctx.fillStyle = glow;
                this.ctx.fillRect(star.x - star.size * 4, star.y - star.size * 4, star.size * 8, star.size * 8);
            }
        });
    }

    drawJupiter(x, y, radius, rotation, showRings = true, ambient = 1) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x, y);

        // Planet body
        const bodyGradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
        bodyGradient.addColorStop(0, `rgba(240, 210, 165, ${ambient})`);
        bodyGradient.addColorStop(0.25, `rgba(210, 175, 120, ${ambient})`);
        bodyGradient.addColorStop(0.5, `rgba(180, 135, 85, ${ambient})`);
        bodyGradient.addColorStop(0.75, `rgba(150, 105, 60, ${ambient})`);
        bodyGradient.addColorStop(1, `rgba(100, 65, 30, ${ambient})`);

        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.95, 0, 0, Math.PI * 2);
        ctx.fillStyle = bodyGradient;
        ctx.fill();

        // Atmospheric bands — Jupiter's most iconic feature
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.95, 0, 0, Math.PI * 2);
        ctx.clip();

        const bands = [
            { y: -0.82, h: 0.11, color: [120, 70, 30], alpha: 0.55 },
            { y: -0.68, h: 0.08, color: [220, 185, 130], alpha: 0.3 },
            { y: -0.55, h: 0.14, color: [145, 85, 38], alpha: 0.5 },
            { y: -0.36, h: 0.09, color: [225, 192, 140], alpha: 0.28 },
            { y: -0.22, h: 0.17, color: [130, 72, 32], alpha: 0.48 },   // NEB
            { y:  0.02, h: 0.09, color: [215, 178, 120], alpha: 0.28 },
            { y:  0.16, h: 0.19, color: [140, 80, 36], alpha: 0.5 },    // SEB
            { y:  0.40, h: 0.11, color: [200, 162, 105], alpha: 0.28 },
            { y:  0.55, h: 0.14, color: [105, 58, 22], alpha: 0.4 },
            { y:  0.73, h: 0.10, color: [185, 148, 95], alpha: 0.25 }
        ];

        bands.forEach(band => {
            const bandY = band.y * radius + Math.sin(rotation * 0.8 + band.y * 3) * 2;
            const [r, g, b] = band.color;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${band.alpha * ambient})`;
            ctx.fillRect(-radius, bandY, radius * 2, band.h * radius);
        });

        // Great Red Spot
        const grsX = Math.cos(rotation * 0.2) * radius * 0.15;
        const grsY = radius * 0.19;
        const grsGrad = ctx.createRadialGradient(grsX, grsY, 0, grsX, grsY, radius * 0.22);
        grsGrad.addColorStop(0, `rgba(185, 58, 28, ${0.75 * ambient})`);
        grsGrad.addColorStop(0.4, `rgba(160, 45, 20, ${0.55 * ambient})`);
        grsGrad.addColorStop(0.8, `rgba(140, 35, 15, ${0.25 * ambient})`);
        grsGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = grsGrad;
        ctx.beginPath();
        ctx.ellipse(grsX, grsY, radius * 0.22, radius * 0.10, -0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Atmosphere glow
        const glowGradient = ctx.createRadialGradient(0, 0, radius * 0.9, 0, 0, radius * 1.15);
        glowGradient.addColorStop(0, 'transparent');
        glowGradient.addColorStop(0.5, `rgba(220, 180, 100, ${0.08 * ambient})`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(-radius * 1.5, -radius * 1.5, radius * 3, radius * 3);

        if (showRings) {
            // Jupiter's faint ring system — Halo, Main, Gossamer rings
            ctx.rotate(rotation * 0.005);
            this.drawJupiterRings(ctx, radius, -1, ambient);
            ctx.save();
            ctx.beginPath();
            ctx.rect(-radius * 2, 0, radius * 4, radius * 2);
            ctx.clip();
            this.drawJupiterRings(ctx, radius, 1, ambient);
            ctx.restore();
        }

        ctx.restore();
    }

    drawJupiterRings(ctx, planetRadius, side, ambient) {
        // Jupiter's rings are much thinner and fainter than Saturn's
        const rings = [
            { inner: 1.28, outer: 1.32, color: [160, 140, 100], opacity: 0.35 }, // Halo
            { inner: 1.32, outer: 1.42, color: [140, 120, 85], opacity: 0.25 },  // Main ring
            { inner: 1.42, outer: 1.65, color: [120, 100, 70], opacity: 0.12 },  // Gossamer
        ];

        rings.forEach(ring => {
            const ringGradient = ctx.createLinearGradient(
                -planetRadius * ring.outer, 0,
                planetRadius * ring.outer, 0
            );
            const [r, g, b] = ring.color;
            ringGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${ring.opacity * 0.4 * ambient})`);
            ringGradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${ring.opacity * ambient})`);
            ringGradient.addColorStop(0.5, `rgba(${r + 20}, ${g + 20}, ${b + 15}, ${ring.opacity * ambient})`);
            ringGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${ring.opacity * ambient})`);
            ringGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${ring.opacity * 0.4 * ambient})`);

            const outerRadiusY = Math.abs(planetRadius * ring.outer * 0.12);
            const innerRadiusY = Math.abs(planetRadius * ring.inner * 0.12);

            ctx.beginPath();
            if (side > 0) {
                ctx.ellipse(0, 0, planetRadius * ring.outer, outerRadiusY, 0, 0, Math.PI, false);
                ctx.ellipse(0, 0, planetRadius * ring.inner, innerRadiusY, 0, Math.PI, 0, true);
            } else {
                ctx.ellipse(0, 0, planetRadius * ring.outer, outerRadiusY, 0, Math.PI, Math.PI * 2, false);
                ctx.ellipse(0, 0, planetRadius * ring.inner, innerRadiusY, 0, Math.PI * 2, Math.PI, true);
            }
            ctx.closePath();
            ctx.fillStyle = ringGradient;
            ctx.fill();
        });
    }

    drawGalileo(x, y, scale = 1, angle = 0) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);

        // Main bus body
        ctx.fillStyle = '#b8b8b8';
        ctx.beginPath();
        ctx.roundRect(-14, -10, 28, 20, 3);
        ctx.fill();

        // Gold thermal blanket
        ctx.fillStyle = '#c8a040';
        ctx.fillRect(-11, -8, 22, 16);

        // Spin stripes
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-11, -8 + i * 5, 22, 2);
        }

        // High-gain antenna dish (large, partially deployed in reality)
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath();
        ctx.ellipse(0, -22, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Rib lines on dish
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, -22);
            ctx.lineTo(Math.cos(a) * 22, -22 + Math.sin(a) * 8);
            ctx.stroke();
        }

        // Antenna feed horn
        ctx.fillStyle = '#707070';
        ctx.fillRect(-2, -28, 4, 8);

        // Science boom
        ctx.strokeStyle = '#585858';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(42, -4);
        ctx.stroke();
        ctx.fillStyle = '#787878';
        ctx.fillRect(40, -7, 6, 6);

        // Two RTG booms (characteristic of Galileo)
        ctx.strokeStyle = '#505050';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-14, -4);
        ctx.lineTo(-28, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-14, 4);
        ctx.lineTo(-28, 8);
        ctx.stroke();
        ctx.fillStyle = '#383838';
        for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.roundRect(-34, -10 + i * 14, 8, 6, 2);
            ctx.fill();
        }

        // Engine nozzle
        ctx.fillStyle = '#282828';
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(16, 22);
        ctx.lineTo(-16, 22);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();

        if (this.showThrusterGlow) {
            const thrustGlow = ctx.createRadialGradient(0, 28, 0, 0, 28, 28);
            thrustGlow.addColorStop(0, 'rgba(100, 150, 255, 0.8)');
            thrustGlow.addColorStop(0.3, 'rgba(50, 100, 255, 0.4)');
            thrustGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = thrustGlow;
            ctx.fillRect(-28, 20, 56, 46);
        }

        ctx.restore();
    }

    drawMoon(x, y, radius, type, time) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        let gradient;
        switch (type) {
            case 'io':
                gradient = ctx.createRadialGradient(-radius * 0.2, -radius * 0.2, 0, 0, 0, radius);
                gradient.addColorStop(0, '#e8d020');
                gradient.addColorStop(0.4, '#d4a010');
                gradient.addColorStop(0.7, '#c06000');
                gradient.addColorStop(1, '#8a3000');
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                // Volcanic hotspot glow
                ctx.fillStyle = 'rgba(255, 80, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(radius * 0.3, radius * 0.2, radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'europa':
                gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
                gradient.addColorStop(0, '#f0f4f8');
                gradient.addColorStop(0.5, '#d8ecf8');
                gradient.addColorStop(1, '#a8c8e0');
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                // Crack lines
                ctx.strokeStyle = 'rgba(100, 70, 40, 0.6)';
                ctx.lineWidth = Math.max(1, radius * 0.03);
                for (let i = 0; i < 4; i++) {
                    const a = (i / 4) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
                    ctx.stroke();
                }
                break;

            case 'ganymede':
                gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.2, 0, 0, 0, radius);
                gradient.addColorStop(0, '#a0a0b0');
                gradient.addColorStop(0.4, '#808090');
                gradient.addColorStop(0.7, '#606070');
                gradient.addColorStop(1, '#404048');
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                // Grooved terrain streak
                ctx.strokeStyle = 'rgba(200, 210, 230, 0.4)';
                ctx.lineWidth = Math.max(1, radius * 0.04);
                ctx.beginPath();
                ctx.moveTo(-radius * 0.6, -radius * 0.2);
                ctx.lineTo(radius * 0.5, radius * 0.3);
                ctx.stroke();
                // Magnetic glow
                const magGlow = ctx.createRadialGradient(0, 0, radius * 0.85, 0, 0, radius * 1.25);
                magGlow.addColorStop(0, 'transparent');
                magGlow.addColorStop(0.5, 'rgba(80, 120, 255, 0.12)');
                magGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = magGlow;
                ctx.fillRect(-radius * 1.5, -radius * 1.5, radius * 3, radius * 3);
                break;

            case 'callisto':
                gradient = ctx.createRadialGradient(-radius * 0.2, -radius * 0.2, 0, 0, 0, radius);
                gradient.addColorStop(0, '#505055');
                gradient.addColorStop(0.4, '#383838');
                gradient.addColorStop(0.7, '#252525');
                gradient.addColorStop(1, '#151515');
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                // Heavy cratering
                ctx.save();
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.clip();
                for (let i = 0; i < 8; i++) {
                    const cx = (Math.sin(i * 1.3) * 0.6) * radius;
                    const cy = (Math.cos(i * 1.7) * 0.6) * radius;
                    const cr = radius * (0.08 + (i % 3) * 0.05);
                    ctx.strokeStyle = 'rgba(100, 90, 80, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(10, 8, 6, 0.5)';
                    ctx.fill();
                }
                ctx.restore();
                break;

            default:
                gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
                gradient.addColorStop(0, '#c0c0c0');
                gradient.addColorStop(1, '#606060');
        }

        if (!['io', 'europa', 'ganymede', 'callisto'].includes(type)) {
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        ctx.restore();
    }

    // Opening cutscene scenes
    getOpeningScenes() {
        return [
            {
                duration: 6000,
                text: "Jupiter sits 628 million kilometers from Earth, so far that sunlight takes over 40 minutes to reach it.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const scale = 0.3 + progress * 0.3;
                    const jx = this.canvas.width * 0.5;
                    const jy = this.canvas.height * 0.5;
                    const ambient = 0.3 + progress * 0.5;
                    this.drawJupiter(jx, jy, 150 * scale, time * 0.001, true, ambient);
                }
            },
            {
                duration: 5000,
                text: "For centuries, every human who ever looked up at Jupiter saw only a glowing point of light ... bright, massive, and completely mysterious.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const dotSize = 4 + Math.sin(time * 0.003) * 0.8;
                    this.ctx.beginPath();
                    this.ctx.arc(this.canvas.width * 0.5, this.canvas.height * 0.4, dotSize, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#fff8e8';
                    this.ctx.fill();
                    const glow = this.ctx.createRadialGradient(
                        this.canvas.width * 0.5, this.canvas.height * 0.4, 0,
                        this.canvas.width * 0.5, this.canvas.height * 0.4, 40
                    );
                    glow.addColorStop(0, 'rgba(255, 240, 200, 0.5)');
                    glow.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = glow;
                    this.ctx.fillRect(this.canvas.width * 0.5 - 40, this.canvas.height * 0.4 - 40, 80, 80);
                }
            },
            {
                duration: 7000,
                text: "",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;

                    const phase = Math.floor(progress * 3);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    ctx.save();
                    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

                    if (phase === 0) {
                        // Galileo Galilei's sketch of Jupiter and moons — 1610
                        ctx.fillStyle = '#d4c4a0';
                        ctx.fillRect(-200, -150, 400, 300);
                        ctx.strokeStyle = '#2a2010';
                        ctx.lineWidth = 2;
                        // Jupiter disk
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 30, 28, 0, 0, Math.PI * 2);
                        ctx.stroke();
                        // Four Galilean moons as dots with labels
                        const moonDots = [[-100, -8], [-60, 15], [80, -5], [130, 10]];
                        moonDots.forEach(([mx, my]) => {
                            ctx.beginPath();
                            ctx.arc(mx, my, 4, 0, Math.PI * 2);
                            ctx.fillStyle = '#2a2010';
                            ctx.fill();
                        });
                        ctx.font = 'italic 15px serif';
                        ctx.fillStyle = '#2a2010';
                        ctx.textAlign = 'center';
                        ctx.fillText('Galileo Galilei, 1610', 0, 100);
                        ctx.fillText('Four moons — proof the Earth is not the centre of everything', 0, 120);
                    } else if (phase === 1) {
                        // Pioneer 10 — 1973 first close image
                        ctx.fillStyle = '#0a0a12';
                        ctx.fillRect(-200, -150, 400, 300);
                        const pixelSize = 10;
                        for (let py = -70; py < 70; py += pixelSize) {
                            for (let px = -90; px < 90; px += pixelSize) {
                                const dist = Math.sqrt(px * px + py * py);
                                if (dist < 55) {
                                    const r = 200 + Math.random() * 40;
                                    const g = 160 + Math.random() * 30;
                                    const b = 80 + Math.random() * 30;
                                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                                    ctx.fillRect(px, py, pixelSize - 1, pixelSize - 1);
                                }
                            }
                        }
                        ctx.fillStyle = 'rgba(0,0,0,0.3)';
                        for (let i = -150; i < 150; i += 4) ctx.fillRect(-200, i, 400, 2);
                        ctx.font = '13px monospace';
                        ctx.fillStyle = '#00ff88';
                        ctx.textAlign = 'center';
                        ctx.fillText('PIONEER 10 // JUPITER FLYBY // 1973', 0, 110);
                    } else {
                        // Voyager 1 — 1979 (closest flyby before Galileo)
                        ctx.fillStyle = '#000';
                        ctx.fillRect(-200, -150, 400, 300);
                        const pxSz = 7;
                        for (let py = -80; py < 80; py += pxSz) {
                            for (let px = -110; px < 110; px += pxSz) {
                                const dist = Math.sqrt(px * px + py * py);
                                if (dist < 65) {
                                    const r = 210 + Math.random() * 35;
                                    const g = 170 + Math.random() * 30;
                                    const b = 95 + Math.random() * 25;
                                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                                    ctx.fillRect(px, py, pxSz - 1, pxSz - 1);
                                } else if (dist > 72 && dist < 100 && Math.abs(py) < 10) {
                                    ctx.fillStyle = `rgba(160,140,110,0.5)`;
                                    ctx.fillRect(px, py, pxSz - 1, pxSz - 1);
                                }
                            }
                        }
                        ctx.fillStyle = 'rgba(0,0,0,0.3)';
                        for (let i = -150; i < 150; i += 4) ctx.fillRect(-200, i, 400, 2);
                        ctx.font = '13px monospace';
                        ctx.fillStyle = '#00ff00';
                        ctx.textAlign = 'center';
                        ctx.fillText('VOYAGER 1 // JUPITER FLYBY // 1979', 0, 115);
                        ctx.fillText('Great Red Spot imaged for the first time in detail', 0, 133);
                    }
                    ctx.restore();
                }
            },
            {
                duration: 5000,
                text: "Each generation got closer. Each image raised more questions than it answered.",
                render: (time, progress) => {
                    const ctx = this.ctx;
                    // Real NASA Jupiter atmosphere image — zoomed in on cloud bands
                    GameImages.drawCover(ctx, 'jupiterAtmos', 0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + progress * 0.1})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    // GRS hint glow on top of image
                    const grsGlow = ctx.createRadialGradient(
                        this.canvas.width * 0.6, this.canvas.height * 0.5, 0,
                        this.canvas.width * 0.6, this.canvas.height * 0.5, 120
                    );
                    grsGlow.addColorStop(0, 'rgba(180, 60, 30, 0.25)');
                    grsGlow.addColorStop(0.5, 'rgba(140, 40, 20, 0.1)');
                    grsGlow.addColorStop(1, 'transparent');
                    ctx.fillStyle = grsGlow;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
            },
            {
                duration: 5500,
                text: "Scientists suspected oceans beneath frozen moons. Active volcanoes in the outer solar system. A magnetic field on a moon that had no right to have one.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;
                    // Icy moon surface with subsurface ocean hint
                    ctx.fillStyle = '#0a1828';
                    ctx.fillRect(0, this.canvas.height * 0.65, this.canvas.width, this.canvas.height * 0.35);
                    ctx.fillStyle = '#c8dce8';
                    ctx.fillRect(0, this.canvas.height * 0.65, this.canvas.width, 8);
                    // Crack lines
                    ctx.strokeStyle = 'rgba(100, 70, 40, 0.6)';
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 5; i++) {
                        const sx = (i * 200 + time * 0.01) % this.canvas.width;
                        ctx.beginPath();
                        ctx.moveTo(sx, this.canvas.height * 0.65);
                        ctx.lineTo(sx + 120, this.canvas.height * 0.65 + 40);
                        ctx.stroke();
                    }
                    // Ocean blue glow from below
                    const oceanGlow = ctx.createLinearGradient(0, this.canvas.height * 0.65, 0, this.canvas.height);
                    oceanGlow.addColorStop(0, 'rgba(0, 60, 120, 0.5)');
                    oceanGlow.addColorStop(1, 'rgba(0, 20, 50, 0.8)');
                    ctx.fillStyle = oceanGlow;
                    ctx.fillRect(0, this.canvas.height * 0.65 + 8, this.canvas.width, this.canvas.height * 0.35);
                }
            },
            {
                duration: 4000,
                text: "They needed to go there.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const glow = this.ctx.createRadialGradient(
                        this.canvas.width * 0.5, this.canvas.height * 0.5, 0,
                        this.canvas.width * 0.5, this.canvas.height * 0.5, 200
                    );
                    glow.addColorStop(0, 'rgba(200, 160, 80, 0.3)');
                    glow.addColorStop(0.5, 'rgba(180, 140, 60, 0.1)');
                    glow.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = glow;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.drawJupiter(this.canvas.width * 0.5, this.canvas.height * 0.5, 45, time * 0.001, true, 0.6);
                }
            },
            {
                duration: 6000,
                text: "October 18, 1989. Kennedy Space Center, Florida.",
                render: (time, progress) => {
                    const ctx = this.ctx;
                    // Real NASA Galileo launch image — Atlantis carrying Galileo
                    GameImages.drawCover(ctx, 'galileoLaunch', 0, 0, this.canvas.width, this.canvas.height);
                    // Darken slightly, revealing more as scene progresses
                    ctx.fillStyle = `rgba(0, 0, 5, ${0.45 - progress * 0.2})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    // Animated shuttle rising over the image
                    const rocketY = this.canvas.height * 0.52 - progress * this.canvas.height * 0.45;
                    if (rocketY > -80) {
                        ctx.fillStyle = 'rgba(220, 220, 220, 0.9)';
                        ctx.beginPath();
                        ctx.moveTo(this.canvas.width * 0.5, rocketY - 30);
                        ctx.lineTo(this.canvas.width * 0.485, rocketY + 10);
                        ctx.lineTo(this.canvas.width * 0.515, rocketY + 10);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillRect(this.canvas.width * 0.484, rocketY + 10, 14, 45);
                        ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
                        ctx.fillRect(this.canvas.width * 0.473, rocketY + 5, 8, 38);
                        ctx.fillRect(this.canvas.width * 0.519, rocketY + 5, 8, 38);
                    }

                    // Engine exhaust glow
                    const exhaustGlow = ctx.createRadialGradient(
                        this.canvas.width * 0.5, rocketY + 60, 0,
                        this.canvas.width * 0.5, rocketY + 60, 100 + progress * 80
                    );
                    exhaustGlow.addColorStop(0, 'rgba(255, 210, 120, 0.85)');
                    exhaustGlow.addColorStop(0.3, 'rgba(255, 150, 50, 0.5)');
                    exhaustGlow.addColorStop(0.6, 'rgba(255, 100, 40, 0.25)');
                    exhaustGlow.addColorStop(1, 'transparent');
                    ctx.fillStyle = exhaustGlow;
                    ctx.fillRect(this.canvas.width * 0.3, rocketY + 40, this.canvas.width * 0.4, 200);
                }
            },
            {
                duration: 6000,
                text: "NASA launched Galileo aboard Space Shuttle Atlantis — the first spacecraft designed to orbit Jupiter and study its moons up close.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;

                    // Blueprint background
                    ctx.fillStyle = 'rgba(0, 25, 55, 0.85)';
                    ctx.fillRect(this.canvas.width * 0.2, this.canvas.height * 0.15, this.canvas.width * 0.6, this.canvas.height * 0.7);

                    ctx.strokeStyle = 'rgba(80, 140, 200, 0.2)';
                    ctx.lineWidth = 1;
                    for (let i = 0; i < 20; i++) {
                        ctx.beginPath();
                        ctx.moveTo(this.canvas.width * 0.2 + i * 30, this.canvas.height * 0.15);
                        ctx.lineTo(this.canvas.width * 0.2 + i * 30, this.canvas.height * 0.85);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(this.canvas.width * 0.2, this.canvas.height * 0.15 + i * 30);
                        ctx.lineTo(this.canvas.width * 0.8, this.canvas.height * 0.15 + i * 30);
                        ctx.stroke();
                    }

                    ctx.save();
                    ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
                    ctx.rotate(time * 0.0005);
                    this.drawGalileo(0, 0, 3, 0);
                    ctx.restore();

                    ctx.font = '12px "Space Mono", monospace';
                    ctx.fillStyle = '#7ec8e3';
                    ctx.fillText('HIGH-GAIN ANTENNA', this.canvas.width * 0.55, this.canvas.height * 0.3);
                    ctx.fillText('RTG POWER SYSTEM', this.canvas.width * 0.55, this.canvas.height * 0.65);
                    ctx.fillText('SCIENCE BOOM', this.canvas.width * 0.58, this.canvas.height * 0.48);
                }
            },
            {
                duration: 6000,
                text: "Galileo carried 11 scientific instruments and a separate atmospheric probe — the first ever to descend into a gas giant's atmosphere.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;

                    ctx.save();
                    ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
                    ctx.rotate(Math.sin(time * 0.001) * 0.1);
                    this.drawGalileo(0, 0, 4, 0);

                    // Atmospheric probe attached
                    ctx.fillStyle = '#c8a040';
                    ctx.beginPath();
                    ctx.arc(-90, 25, 22, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#907020';
                    ctx.beginPath();
                    ctx.arc(-90, 25, 17, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.fillRect(this.canvas.width * 0.63, this.canvas.height * 0.3, 240, 190);
                    ctx.strokeStyle = '#c8a040';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.canvas.width * 0.63, this.canvas.height * 0.3, 240, 190);

                    ctx.font = '14px "Space Mono", monospace';
                    ctx.fillStyle = '#c8a040';
                    ctx.fillText('GALILEO ORBITER', this.canvas.width * 0.648, this.canvas.height * 0.35);
                    ctx.fillStyle = '#a0a0a0';
                    ctx.font = '11px "Space Mono", monospace';
                    ctx.fillText('Launch: Oct 18, 1989', this.canvas.width * 0.648, this.canvas.height * 0.4);
                    ctx.fillText('Mass: 2,562 kg', this.canvas.width * 0.648, this.canvas.height * 0.44);
                    ctx.fillText('Instruments: 11', this.canvas.width * 0.648, this.canvas.height * 0.48);
                    ctx.fillText('Journey: 628M km', this.canvas.width * 0.648, this.canvas.height * 0.52);
                    ctx.fillText('Mission: 8 years', this.canvas.width * 0.648, this.canvas.height * 0.56);
                }
            },
            {
                duration: 8000,
                text: "",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;

                    const centerX = this.canvas.width * 0.5;
                    const centerY = this.canvas.height * 0.5;

                    // Sun
                    const sunGlow = ctx.createRadialGradient(centerX * 0.3, centerY, 0, centerX * 0.3, centerY, 80);
                    sunGlow.addColorStop(0, '#ffff00');
                    sunGlow.addColorStop(0.3, '#ffaa00');
                    sunGlow.addColorStop(1, 'transparent');
                    ctx.fillStyle = sunGlow;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.beginPath();
                    ctx.arc(centerX * 0.3, centerY, 18, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffff00';
                    ctx.fill();

                    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
                    ctx.lineWidth = 1;
                    [90, 160, 260, 400].forEach(r => {
                        ctx.beginPath();
                        ctx.arc(centerX * 0.3, centerY, r, 0, Math.PI * 2);
                        ctx.stroke();
                    });

                    // Jupiter at distance
                    this.drawJupiter(centerX * 0.3 + 400, centerY, 28, time * 0.001, true, 0.8);

                    // Galileo trajectory with gravity assist path
                    const trajProgress = progress;
                    ctx.strokeStyle = '#00d4ff';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();

                    const pathPoints = [];
                    for (let t = 0; t <= trajProgress; t += 0.01) {
                        const angle = t * Math.PI * 2.2;
                        const radius = 90 + t * 310;
                        const x = centerX * 0.3 + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius * 0.25;
                        pathPoints.push({ x, y });
                    }
                    pathPoints.forEach((p, i) => {
                        if (i === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    });
                    ctx.stroke();
                    ctx.setLineDash([]);

                    if (pathPoints.length > 0) {
                        const pos = pathPoints[pathPoints.length - 1];
                        this.drawGalileo(pos.x, pos.y, 0.8, Math.atan2(
                            pathPoints.length > 1 ? pos.y - pathPoints[pathPoints.length - 2].y : 0,
                            pathPoints.length > 1 ? pos.x - pathPoints[pathPoints.length - 2].x : 1
                        ));
                    }

                    // Year counter 1989 → 1995
                    const year = Math.floor(1989 + progress * 6);
                    ctx.font = 'bold 48px "Orbitron", sans-serif';
                    ctx.fillStyle = '#c8a040';
                    ctx.textAlign = 'center';
                    ctx.fillText(year.toString(), centerX, this.canvas.height * 0.15);
                    ctx.textAlign = 'left';
                }
            },
            {
                duration: 5000,
                text: "While the world moved on, Galileo traveled in silence ... 628 million kilometers through the void, guided by orbital mechanics calculated years in advance.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;

                    ctx.fillStyle = '#0a0a0f';
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    this.stars.slice(0, 50).forEach(star => {
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, star.size * 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.3})`;
                        ctx.fill();
                    });

                    const blink = Math.sin(time * 0.005) > 0;
                    if (blink) {
                        const glow = ctx.createRadialGradient(
                            this.canvas.width * 0.5, this.canvas.height * 0.5, 0,
                            this.canvas.width * 0.5, this.canvas.height * 0.5, 20
                        );
                        glow.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
                        glow.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
                        glow.addColorStop(1, 'transparent');
                        ctx.fillStyle = glow;
                        ctx.fillRect(this.canvas.width * 0.4, this.canvas.height * 0.4, this.canvas.width * 0.2, this.canvas.height * 0.2);

                        ctx.beginPath();
                        ctx.arc(this.canvas.width * 0.5, this.canvas.height * 0.5, 3, 0, Math.PI * 2);
                        ctx.fillStyle = '#7ec8e3';
                        ctx.fill();
                    }
                }
            },
            {
                duration: 3000,
                text: "",
                render: (time, progress) => {
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
            },
            {
                duration: 8000,
                text: "",
                render: (time, progress) => {
                    // MONEY SHOT — real NASA Jupiter image erupts into frame
                    const ctx = this.ctx;
                    // Start dark, Jupiter zooms in
                    const darkAlpha = Math.max(0, 0.8 - progress * 1.2);
                    GameImages.drawCover(ctx, 'jupiterOrbit', 0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = `rgba(0, 0, 10, ${darkAlpha})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    // Lens flare as Jupiter fills frame
                    if (progress > 0.3) {
                        const flareAlpha = (progress - 0.3) * 0.4;
                        const flareGlow = ctx.createRadialGradient(
                            this.canvas.width * 0.28, this.canvas.height * 0.25, 0,
                            this.canvas.width * 0.28, this.canvas.height * 0.25, 150
                        );
                        flareGlow.addColorStop(0, `rgba(255, 220, 150, ${flareAlpha})`);
                        flareGlow.addColorStop(0.5, `rgba(220, 180, 90, ${flareAlpha * 0.4})`);
                        flareGlow.addColorStop(1, 'transparent');
                        ctx.fillStyle = flareGlow;
                        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    }
                }
            },
            {
                duration: 5000,
                text: "December 7, 1995. After six years and 628 million kilometers, Galileo entered Jupiter's orbit.",
                render: (time, progress) => {
                    // Real NASA Jupiter orbit image as background
                    GameImages.drawCover(this.ctx, 'jupiterOrbit', 0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    this.drawGalileo(
                        this.canvas.width * 0.28 + progress * 110,
                        this.canvas.height * 0.38,
                        1.5,
                        0.2
                    );
                }
            },
            {
                duration: 4000,
                text: "No probe had ever gone this far and stayed.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;

                    const jupiterRadius = this.canvas.height * 0.45 + progress * 80;
                    this.drawJupiter(this.canvas.width * 0.5, this.canvas.height * 0.6, jupiterRadius, time * 0.0003, true, 1);

                    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(50, 50, 210, 105);
                    ctx.font = '12px "Space Mono", monospace';
                    ctx.fillStyle = '#7ec8e3';
                    ctx.fillText('ALTITUDE: 214,000 km', 62, 76);
                    ctx.fillText('VELOCITY: 17.7 km/s', 62, 96);
                    ctx.fillText('ORBIT: STABLE', 62, 116);
                    ctx.fillText('STATUS: NOMINAL', 62, 136);
                }
            },
            {
                duration: 5000,
                text: "You are Galileo. Eight years of fuel. Thirty-five scheduled orbits. A mandate to answer everything Voyager left behind.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    this.drawJupiter(this.canvas.width * 0.5, this.canvas.height * 0.5, this.canvas.height * 0.32, time * 0.0003, true, 1);

                    const ctx = this.ctx;
                    ctx.strokeStyle = '#00d4ff';
                    ctx.lineWidth = 2;

                    ctx.beginPath();
                    ctx.arc(this.canvas.width * 0.5, this.canvas.height * 0.5, 100, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(this.canvas.width * 0.5 - 120, this.canvas.height * 0.5);
                    ctx.lineTo(this.canvas.width * 0.5 - 80, this.canvas.height * 0.5);
                    ctx.moveTo(this.canvas.width * 0.5 + 80, this.canvas.height * 0.5);
                    ctx.lineTo(this.canvas.width * 0.5 + 120, this.canvas.height * 0.5);
                    ctx.moveTo(this.canvas.width * 0.5, this.canvas.height * 0.5 - 120);
                    ctx.lineTo(this.canvas.width * 0.5, this.canvas.height * 0.5 - 80);
                    ctx.moveTo(this.canvas.width * 0.5, this.canvas.height * 0.5 + 80);
                    ctx.lineTo(this.canvas.width * 0.5, this.canvas.height * 0.5 + 120);
                    ctx.stroke();
                }
            },
            {
                duration: 5000,
                text: "Jupiter has 95 known moons ... each one a different world, each one hiding something no human has ever seen up close.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;
                    const centerX = this.canvas.width * 0.5;
                    const centerY = this.canvas.height * 0.5;

                    this.drawJupiter(centerX, centerY, 75, time * 0.001, true, 0.8);

                    const moons = [
                        { name: 'Io',       dist: 115, size: 9,  color: '#d4a010', id: 'io' },
                        { name: 'Europa',   dist: 140, size: 7,  color: '#d8eaf5', id: 'europa' },
                        { name: 'Ganymede', dist: 175, size: 11, color: '#808090', id: 'ganymede' },
                        { name: 'Callisto', dist: 220, size: 9,  color: '#404040', id: 'callisto' }
                    ];

                    moons.forEach((moon, i) => {
                        const angle = time * 0.0005 * (1 + i * 0.15) + i * 0.785;
                        const x = centerX + Math.cos(angle) * moon.dist;
                        const y = centerY + Math.sin(angle) * moon.dist * 0.3;

                        ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
                        ctx.beginPath();
                        ctx.ellipse(centerX, centerY, moon.dist, moon.dist * 0.3, 0, 0, Math.PI * 2);
                        ctx.stroke();

                        this.drawMoon(x, y, moon.size, moon.id, time);
                    });
                }
            },
            {
                duration: 5000,
                text: "Your mission covers four of them. What you find will rewrite the textbooks.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const ctx = this.ctx;
                    const centerX = this.canvas.width * 0.5;
                    const centerY = this.canvas.height * 0.5;

                    this.drawJupiter(centerX, centerY, 75, time * 0.001, true, 0.8);

                    const moons = [
                        { name: 'Io',       dist: 115, size: 9,  color: '#d4a010', id: 'io' },
                        { name: 'Europa',   dist: 140, size: 7,  color: '#d8eaf5', id: 'europa' },
                        { name: 'Ganymede', dist: 175, size: 11, color: '#808090', id: 'ganymede' },
                        { name: 'Callisto', dist: 220, size: 9,  color: '#404040', id: 'callisto' }
                    ];

                    ctx.strokeStyle = '#00d4ff';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();

                    moons.forEach((moon, i) => {
                        const angle = time * 0.0005 * (1 + i * 0.15) + i * 0.785;
                        const x = centerX + Math.cos(angle) * moon.dist;
                        const y = centerY + Math.sin(angle) * moon.dist * 0.3;

                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);

                        const glow = ctx.createRadialGradient(x, y, 0, x, y, moon.size * 2.5);
                        glow.addColorStop(0, moon.color);
                        glow.addColorStop(0.5, `${moon.color}88`);
                        glow.addColorStop(1, 'transparent');
                        ctx.save();
                        ctx.setLineDash([]);
                        ctx.fillStyle = glow;
                        ctx.fillRect(x - moon.size * 3, y - moon.size * 3, moon.size * 6, moon.size * 6);
                        this.drawMoon(x, y, moon.size, moon.id, time);
                        ctx.restore();
                    });

                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Galileo probe orbiting
                    const gIdx = Math.floor(progress * 4) % 4;
                    const tgtMoon = moons[gIdx];
                    const gAngle = time * 0.0005 * (1 + gIdx * 0.15) + gIdx * 0.785;
                    const gx = centerX + Math.cos(gAngle) * tgtMoon.dist - 28;
                    const gy = centerY + Math.sin(gAngle) * tgtMoon.dist * 0.3;
                    this.drawGalileo(gx, gy, 0.6, 0);
                }
            }
        ];
    }

    getMissionControlScene(moonName, fact) {
        return {
            duration: 8000,
            text: "",
            isMissionControl: true,
            moonName: moonName,
            fact: fact,
            render: (time, progress) => {
                const ctx = this.ctx;
                // Real NASA mission control room image
                GameImages.drawCover(ctx, 'missionControl', 0, 0, this.canvas.width, this.canvas.height);
                ctx.fillStyle = 'rgba(0, 8, 0, 0.65)';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                // CRT scanlines over image
                ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
                for (let i = 0; i < this.canvas.height; i += 3) {
                    ctx.fillRect(0, i, this.canvas.width, 1);
                }
            }
        };
    }

    async playOpeningCutscene(onComplete) {
        const scenes = this.getOpeningScenes();
        const textElement = document.getElementById('cutscene-text');
        const mcBox = document.getElementById('mission-control-box');
        const skipHint = document.querySelector('.skip-hint');

        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            const startTime = performance.now();
            this.skipRequested = false;
            this.canSkip = true;

            if (scene.text) {
                this.typeText(textElement, scene.text, 25);
            } else {
                textElement.textContent = '';
                textElement.classList.remove('visible');
            }

            if (skipHint) {
                skipHint.style.opacity = '1';
            }

            const self = this;
            await new Promise(resolve => {
                const minDuration = 500;
                let resolved = false;

                const animate = () => {
                    if (resolved) return;

                    const elapsed = performance.now() - startTime;
                    const progress = Math.min(elapsed / scene.duration, 1);

                    if (self.skipRequested && elapsed > minDuration) {
                        console.log('SKIPPING! elapsed:', elapsed);
                        resolved = true;
                        self.skipRequested = false;
                        resolve();
                        return;
                    }

                    try {
                        scene.render(performance.now(), progress);
                    } catch (e) {
                        console.warn('Render error:', e.message);
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        console.log('Scene ended naturally');
                        resolved = true;
                        resolve();
                    }
                };
                requestAnimationFrame(animate);
            });

            textElement.classList.remove('visible');
            await this.delay(150);
        }

        this.canSkip = false;

        textElement.classList.remove('visible');
        mcBox.classList.remove('hidden');

        // Apply real mission control room as background
        const mcImg = GameImages.get('missionControl');
        if (mcImg) {
            mcBox.style.backgroundImage = `url('${mcImg.src}')`;
            mcBox.style.backgroundSize = 'cover';
            mcBox.style.backgroundPosition = 'center';
        }

        const timestamp = document.querySelector('.mc-timestamp');
        const content = document.querySelector('.mc-content');
        timestamp.textContent = '[1995.341 // SIGNAL NOMINAL]';

        const message = `Galileo, this is Mission Control in Pasadena.

All systems are green. Primary survey sequence is now active.

First assignment is Io — Jupiter's innermost Galilean moon, the most volcanically active body we have ever observed.

The surface is unlike anything in our solar system.

Find out why.

Mission Control out.`;

        await this.typeWriter(content, message, 30);
        await this.delay(3000);

        mcBox.classList.add('hidden');
        onComplete();
    }

    async playArrivalCutscene(moonData, onComplete) {
        const textElement = document.getElementById('cutscene-text');
        const mcBox = document.getElementById('mission-control-box');
        this.canSkip = true;
        this.skipRequested = false;

        textElement.textContent = `Approaching ${moonData.name}...`;
        textElement.classList.add('visible');

        const startTime = performance.now();
        const duration = 4000;
        const minDuration = 1500;

        // Moon portrait key mapping
        const portraitKeys = { io: 'ioPortrait', europa: 'europaPortrait', ganymede: 'ganymedeFull', callisto: 'callistoPortrait' };
        const portraitKey = portraitKeys[moonData.id] || 'nebula';

        await new Promise(resolve => {
            this.sceneResolve = resolve;
            const animate = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Real NASA moon portrait — zooms in as we approach
                GameImages.drawCover(this.ctx, portraitKey, 0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = `rgba(0, 0, 15, ${0.6 - progress * 0.5})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Keep Galileo probe flying across the frame
                this.drawGalileo(
                    this.canvas.width * 0.2 + progress * this.canvas.width * 0.2,
                    this.canvas.height * 0.5 + Math.sin(progress * Math.PI) * 50,
                    1 + progress,
                    0.2
                );

                if (this.skipRequested && elapsed > minDuration) {
                    this.skipRequested = false;
                    resolve();
                    return;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });

        this.sceneResolve = null;
        textElement.classList.remove('visible');
        await this.delay(300);

        this.skipRequested = false;
        mcBox.classList.remove('hidden');

        // Apply real mission control room as background
        const mcImgArr = GameImages.get('missionControl');
        if (mcImgArr) {
            mcBox.style.backgroundImage = `url('${mcImgArr.src}')`;
            mcBox.style.backgroundSize = 'cover';
            mcBox.style.backgroundPosition = 'center';
        }

        const timestamp = document.querySelector('.mc-timestamp');
        const content = document.querySelector('.mc-content');
        timestamp.textContent = `[JUPITER ORBIT // ${moonData.name.toUpperCase()} APPROACH]`;

        this.speakText(moonData.missionControlMessage);

        await this.typeWriter(content, moonData.missionControlMessage, 15);

        const waitStart = performance.now();
        await new Promise(resolve => {
            this.sceneResolve = resolve;
            const checkSkip = () => {
                if (this.skipRequested || performance.now() - waitStart > 2000) {
                    resolve();
                } else {
                    requestAnimationFrame(checkSkip);
                }
            };
            checkSkip();
        });

        this.stopSpeaking();
        this.canSkip = false;
        this.sceneResolve = null;
        mcBox.classList.add('hidden');
        onComplete();
    }

    async playEndingCutscene(onComplete) {
        const scenes = this.getEndingScenes();
        const textElement = document.getElementById('cutscene-text');

        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            const startTime = performance.now();

            if (scene.text) {
                textElement.textContent = scene.text;
                textElement.classList.add('visible');
            } else {
                textElement.classList.remove('visible');
            }

            await new Promise(resolve => {
                const animate = () => {
                    const elapsed = performance.now() - startTime;
                    const progress = Math.min(elapsed / scene.duration, 1);

                    scene.render(performance.now(), progress);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                };
                animate();
            });

            textElement.classList.remove('visible');
            await this.delay(500);
        }

        onComplete();
    }

    getEndingScenes() {
        return [
            {
                duration: 5000,
                text: "September 21, 2003.",
                render: (time, progress) => {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
            },
            {
                duration: 7000,
                text: "To protect Europa — a moon that may harbour life beneath its ice — NASA could not risk Galileo drifting and contaminating it.",
                render: (time, progress) => {
                    // Real NASA Europa ocean image
                    GameImages.drawCover(this.ctx, 'europaOcean', 0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.fillStyle = `rgba(0, 5, 20, ${0.4 - progress * 0.15})`;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    // Keep Galileo probe entering frame
                    this.drawGalileo(
                        this.canvas.width * 0.12 + progress * this.canvas.width * 0.1,
                        this.canvas.height * 0.25,
                        1.2,
                        0.3
                    );
                }
            },
            {
                duration: 6000,
                text: "Galileo transmitted data until the last possible second, then disintegrated in Jupiter's crushing atmosphere.",
                render: (time, progress) => {
                    const ctx = this.ctx;
                    // Real NASA Jupiter atmosphere image — Galileo entering
                    GameImages.drawCover(ctx, 'jupiterAtmos', 0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = `rgba(0, 0, 5, ${0.2 + progress * 0.1})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    this.drawGalileo(
                        this.canvas.width * 0.22 + progress * this.canvas.width * 0.24,
                        this.canvas.height * 0.28 + progress * this.canvas.height * 0.18,
                        1.5 - progress * 0.5,
                        0.5 + progress * 0.4
                    );
                }
            },
            {
                duration: 6000,
                text: "In its final seconds, Galileo transmitted live data from inside Jupiter's atmosphere — composition readings no instrument had ever captured before.",
                render: (time, progress) => {
                    const ctx = this.ctx;
                    // Deep inside the atmosphere
                    GameImages.drawCover(ctx, 'jupiterAtmos', 0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = `rgba(10, 5, 0, ${0.15 + progress * 0.2})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    if (progress > 0.25) {
                        const entryProgress = (progress - 0.25) / 0.75;
                        const heatGlow = ctx.createRadialGradient(
                            this.canvas.width * 0.46, this.canvas.height * 0.38, 0,
                            this.canvas.width * 0.46, this.canvas.height * 0.38, 55 + entryProgress * 55
                        );
                        heatGlow.addColorStop(0, `rgba(255, 160, 50, ${entryProgress * 0.8})`);
                        heatGlow.addColorStop(0.5, `rgba(255, 100, 40, ${entryProgress * 0.35})`);
                        heatGlow.addColorStop(1, 'transparent');
                        ctx.fillStyle = heatGlow;
                        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    }

                    this.showThrusterGlow = false;
                    this.drawGalileo(
                        this.canvas.width * 0.46,
                        this.canvas.height * 0.34 + progress * this.canvas.height * 0.1,
                        1.2 - progress * 0.4,
                        0.9
                    );
                }
            },
            {
                duration: 4000,
                text: "Then the signal went silent.",
                render: (time, progress) => {
                    const ctx = this.ctx;
                    // Atmosphere fills frame — the last view
                    GameImages.drawCover(ctx, 'jupiterAtmos', 0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = `rgba(5, 3, 0, ${0.1 + progress * 0.5})`;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                    // Disintegration debris
                    for (let i = 0; i < 50; i++) {
                        const angle = (i / 50) * Math.PI * 2 + time * 0.01;
                        const dist = progress * 100 * (1 + Math.random());
                        const x = this.canvas.width * 0.46 + Math.cos(angle) * dist;
                        const y = this.canvas.height * 0.44 + Math.sin(angle) * dist;
                        const size = (1 - progress) * 5 * Math.random();

                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${1 - progress})`;
                        ctx.fill();
                    }

                    if (progress < 0.7) {
                        ctx.globalAlpha = 1 - progress / 0.7;
                        this.drawGalileo(this.canvas.width * 0.46, this.canvas.height * 0.44, 0.8, 0.9);
                        ctx.globalAlpha = 1;
                    }

                    // Signal static
                    if (progress > 0.5) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${(progress - 0.5) * 0.08 * Math.random()})`;
                        for (let i = 0; i < 100; i++) {
                            ctx.fillRect(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 2, 2);
                        }
                    }
                }
            },
            {
                duration: 5000,
                text: "",
                render: (time, progress) => {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
            },
            {
                duration: 5000,
                text: "Galileo. 1989 ... 2003.",
                render: (time, progress) => {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
            },
            {
                duration: 7000,
                text: "35 orbits. 8 years. Confirmed Europa's subsurface ocean. Changed the search for life forever.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    this.drawJupiter(this.canvas.width * 0.5, this.canvas.height * 0.5, 100, time * 0.0003, true, 0.5);
                }
            },
            {
                duration: 6000,
                text: "Some missions don't end. They become part of what we know.",
                render: (time, progress) => {
                    this.drawStarfield(time);
                    const glow = this.ctx.createRadialGradient(
                        this.canvas.width * 0.5, this.canvas.height * 0.5, 0,
                        this.canvas.width * 0.5, this.canvas.height * 0.5, 200
                    );
                    glow.addColorStop(0, `rgba(200, 160, 80, ${0.3 * (1 - progress)})`);
                    glow.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = glow;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }
            }
        ];
    }

    async typeWriter(element, text, speed) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await this.delay(speed);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.CutsceneManager = CutsceneManager;

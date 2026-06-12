// ============================================
// CALLISTO - Most Cratered Object in the Solar System
// Ancient dead surface, 4 billion years of impacts
// Level 4 - Hardest
// ============================================

const CallistoLevel = {
    id: 'callisto',
    name: 'Callisto',
    designation: 'Jupiter IV',
    distanceFromJupiter: '1,882,700 km',
    surfaceTemp: '-139°C',
    facts: [
        'Callisto\'s surface is the oldest unmodified terrain in the solar system — over 4 billion years old.',
        'It is the most heavily cratered object we have ever observed, with craters covering every inch of the surface.',
        'Callisto shows no signs of geological activity — no tectonics, no volcanism, nothing has changed in billions of years.',
        'Despite this ancient frozen surface, Callisto may also have a subsurface saltwater ocean beneath its crust.'
    ],
    hazardWarning: 'The most dangerous terrain of the mission. Overlapping crater pits cover every surface. Ancient impact debris continues to fall. Speed is at maximum. No safe ground.',
    missionControlMessage: `Galileo, this is your final assignment: Callisto.

The oldest, most beaten surface in the solar system. Every impact since the formation of the solar system is still visible — nothing has ever erased them.

The terrain is the densest obstacle environment you will face. Crater pits everywhere. Ancient debris still raining down.

This is the last one. Complete the survey.

Mission Control out.`,

    baseSpeed: 6,
    speedIncrement: 0.0006,
    maxSpeed: 10,
    gravity: 0.35,
    jumpForce: -12,

    colors: {
        sky: ['#020202', '#050505', '#080808'],
        ground: '#303030',
        groundAccent: '#282828',
        atmosphere: 'rgba(60, 50, 40, 0.05)',
        particles: ['#505050', '#686868', '#404040']
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.particles = [];
        this.surfaceCraters = this.generateSurfaceCraters();
        this.backgroundLayers = this.createBackground();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 220;
        this.groundCurveOffset = 0;
    },

    generateSurfaceCraters() {
        const craters = [];
        for (let i = 0; i < 60; i++) {
            craters.push({
                x: Math.random() * 2000,
                y: 0,
                radius: 4 + Math.random() * 20,
                depth: 0.3 + Math.random() * 0.5
            });
        }
        return craters;
    },

    createBackground() {
        return {
            farCraters: this.generateBgCraters(20, 0.3),
            midCraters: this.generateBgCraters(12, 0.55)
        };
    },

    generateBgCraters(count, opacity) {
        const craters = [];
        for (let i = 0; i < count; i++) {
            craters.push({
                x: (i / count) * this.canvas.width * 2,
                radius: 15 + Math.random() * 50,
                opacity
            });
        }
        return craters;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        this.updateParallax(this.backgroundLayers.farCraters, 0.15);
        this.updateParallax(this.backgroundLayers.midCraters, 0.4);
        this.surfaceCraters.forEach(c => {
            c.x -= this.speed * 0.5;
            if (c.x < -c.radius * 2) {
                c.x = this.canvas.width + Math.random() * 200;
                c.radius = 4 + Math.random() * 20;
            }
        });

        this.groundCurveOffset = Math.sin(this.distance * 0.002) * 6;

        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 180 + Math.random() * 140;
        }

        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            if (obs.type === 'impact_debris') {
                obs.y += obs.vy;
                obs.vy += 0.25;
                obs.x += obs.vx;
            }
            return obs.x > -obs.width - 100 && obs.y < this.canvas.height + 80;
        });

        // Dust particles from ancient surface
        if (Math.random() > 0.85) {
            this.particles.push({
                x: this.canvas.width + 10,
                y: this.groundY - 10 - Math.random() * 40,
                size: 1 + Math.random() * 2.5,
                speed: 0.5 + Math.random() * 1.2,
                opacity: 0.2 + Math.random() * 0.4,
                vy: -0.1 + Math.random() * 0.3
            });
        }
        this.particles = this.particles.filter(p => {
            p.x -= p.speed + this.speed * 0.3;
            p.y += p.vy;
            p.opacity -= 0.006;
            return p.x > -10 && p.opacity > 0 && p.y < this.groundY + 20;
        });

        return this.obstacles;
    },

    updateParallax(layer, factor) {
        layer.forEach(item => {
            item.x -= this.speed * factor;
            if (item.x < -(item.radius || item.width || 100) * 2) {
                item.x = this.canvas.width + Math.random() * 300;
                if (item.radius) item.radius = 15 + Math.random() * 50;
            }
        });
    },

    spawnObstacle() {
        const rand = Math.random();
        if (rand < 0.55) {
            // Crater pit gap — most common
            this.obstacles.push({
                type: 'crater_pit',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: 60 + Math.random() * 70,
                height: 20,
                dangerous: true
            });
        } else if (rand < 0.75) {
            // Crater rim wall
            const h = 50 + Math.random() * 50;
            this.obstacles.push({
                type: 'crater_rim',
                x: this.canvas.width + 50,
                y: this.groundY - h,
                width: 28 + Math.random() * 22,
                height: h,
                dangerous: true
            });
        } else {
            // Impact debris falling from above
            this.obstacles.push({
                type: 'impact_debris',
                x: this.canvas.width * 0.5 + Math.random() * this.canvas.width * 0.5,
                y: -40,
                width: 20 + Math.random() * 20,
                height: 20 + Math.random() * 20,
                vy: 2 + Math.random() * 2,
                vx: -1 - Math.random() * 1.5,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Real NASA Callisto surface image as background
        if (!GameImages.drawCover(ctx, 'callistoSurface', 0, 0, canvas.width, canvas.height)) {
            ctx.fillStyle = '#020202';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Dark overlay — strongest at top for readability
        ctx.fillStyle = 'rgba(3, 2, 2, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const calSkyDark = ctx.createLinearGradient(0, 0, 0, this.groundY);
        calSkyDark.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        calSkyDark.addColorStop(0.55, 'rgba(0, 0, 0, 0.2)');
        calSkyDark.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = calSkyDark;
        ctx.fillRect(0, 0, canvas.width, this.groundY);

        // Stars — dim and sparse (Callisto is the most distant of the 4)
        for (let i = 0; i < 100; i++) {
            const sx = (i * 61 + this.distance * 0.03) % canvas.width;
            const sy = (i * 41) % (canvas.height * 0.65);
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 4) * 0.3 + 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.06})`;
            ctx.fill();
        }

        // Jupiter — small and distant at this range
        const jx = canvas.width * 0.85;
        const jy = canvas.height * 0.15;
        const jr = 45;
        const jupGrad = ctx.createRadialGradient(jx - jr * 0.3, jy - jr * 0.2, 0, jx, jy, jr);
        jupGrad.addColorStop(0, 'rgba(190, 160, 120, 0.7)');
        jupGrad.addColorStop(0.5, 'rgba(160, 130, 90, 0.65)');
        jupGrad.addColorStop(1, 'rgba(110, 80, 50, 0.5)');
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.fillStyle = jupGrad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.clip();
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i % 2 === 0 ? 'rgba(140,100,55,0.35)' : 'rgba(200,165,110,0.2)';
            ctx.fillRect(jx - jr, jy - jr + (jr * 2 / 4) * i, jr * 2, jr * 0.45);
        }
        ctx.restore();

        // Ground — dark, ancient, layered
        const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, canvas.height);
        groundGrad.addColorStop(0, '#323232');
        groundGrad.addColorStop(0.3, '#282828');
        groundGrad.addColorStop(1, '#161616');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 20) {
            const curveY = this.groundY + Math.sin((x + this.distance) * 0.003) * 5 + this.groundCurveOffset;
            ctx.lineTo(x, curveY);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Surface craters covering the ground
        this.surfaceCraters.forEach(c => {
            const cy = this.groundY + c.radius * 0.3;
            // Rim
            ctx.strokeStyle = `rgba(80, 75, 70, 0.6)`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(c.x, cy, c.radius, c.radius * 0.25, 0, Math.PI, 0);
            ctx.stroke();
            // Interior shadow
            ctx.fillStyle = `rgba(15, 14, 13, ${c.depth})`;
            ctx.beginPath();
            ctx.ellipse(c.x, cy, c.radius * 0.85, c.radius * 0.2, 0, Math.PI, 0);
            ctx.fill();
        });

        // Dark brown mottled texture
        for (let i = 0; i < 50; i++) {
            const tx = (i * 59 + this.distance * 0.6) % canvas.width;
            const ty = this.groundY + 6 + (i % 6) * 9;
            ctx.fillStyle = `rgba(50, 45, 40, ${0.3 + (i % 4) * 0.1})`;
            ctx.fillRect(tx, ty, 12 + (i % 25), 2);
        }

        // Obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Dust particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 90, 80, ${p.opacity})`;
            ctx.fill();
        });

        // Vignette — oppressive darkness at edges
        const vig = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.height * 0.25,
            canvas.width / 2, canvas.height / 2, canvas.height * 0.9
        );
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // === CALLISTO UNIQUE ATMOSPHERE ===

        // Distant impact flash — rare, bright streak on horizon
        const fSeed = Math.sin(this.distance * 0.00031) * Math.sin(this.distance * 0.000073);
        if (fSeed > 0.92) {
            const fIntensity = (fSeed - 0.92) * 12;
            const fx = canvas.width * (0.2 + (Math.sin(this.distance * 0.00018) * 0.5 + 0.5) * 0.65);
            const fy = this.groundY - 8;
            const fGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 50 * fIntensity);
            fGlow.addColorStop(0, `rgba(255, 230, 200, ${Math.min(fIntensity, 0.9)})`);
            fGlow.addColorStop(0.4, `rgba(220, 170, 100, ${fIntensity * 0.4})`);
            fGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = fGlow;
            ctx.fillRect(fx - 70, fy - 60, 140, 80);
            // Ejecta streak upward
            ctx.strokeStyle = `rgba(255, 220, 180, ${fIntensity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + 15 * fIntensity, fy - 40 * fIntensity);
            ctx.stroke();
        }

        // Ancient slow dust motes drifting just above ground
        for (let i = 0; i < 22; i++) {
            const dx = ((i * 173.4 + this.distance * 0.22 + Math.sin(i * 2.7) * 25) % (canvas.width + 30)) - 15;
            const dy = this.groundY - 5 - (i % 7) * 8;
            const dAlpha = 0.08 + (i % 5) * 0.025;
            ctx.beginPath();
            ctx.arc(dx, dy, 0.7 + (i % 3) * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(90, 82, 72, ${dAlpha})`;
            ctx.fill();
        }

        // Crater surface shimmer — faint highlights on ancient rock
        for (let i = 0; i < 15; i++) {
            const rx = (i * 137 + this.distance * 0.4) % canvas.width;
            const ry = this.groundY + 8 + (i % 5) * 10;
            const rAlpha = 0.04 + Math.sin(this.distance * 0.002 + i * 1.4) * 0.02;
            ctx.fillStyle = `rgba(120, 110, 95, ${rAlpha})`;
            ctx.fillRect(rx, ry, 6 + (i % 15), 1);
        }

        // Deep space stars visible through thin atmosphere — barely visible
        for (let i = 0; i < 40; i++) {
            const sx = (i * 53.3 + this.distance * 0.015) % canvas.width;
            const sy = (i * 37.7) % (canvas.height * 0.6);
            const sAlpha = 0.06 + (i % 6) * 0.012;
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3) * 0.3 + 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
            ctx.fill();
        }
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'crater_pit') {
            // Deep crater gap
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(obs.x, obs.y, obs.width, 55);
            // Pit gradient
            const pitGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + 45);
            pitGrad.addColorStop(0, 'rgba(20, 18, 16, 0.9)');
            pitGrad.addColorStop(1, 'rgba(5, 4, 3, 0.98)');
            ctx.fillStyle = pitGrad;
            ctx.fillRect(obs.x + 2, obs.y, obs.width - 4, 40);
            // Rim highlights
            ctx.strokeStyle = 'rgba(90, 80, 70, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.stroke();
            // Inner rim shadow
            ctx.fillStyle = 'rgba(60, 55, 50, 0.4)';
            ctx.fillRect(obs.x, obs.y, 4, 10);
            ctx.fillRect(obs.x + obs.width - 4, obs.y, 4, 10);

        } else if (obs.type === 'crater_rim') {
            // Raised crater rim wall
            const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
            grad.addColorStop(0, '#505050');
            grad.addColorStop(0.4, '#3c3c3c');
            grad.addColorStop(1, '#282828');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.15, obs.y + 8);
            ctx.lineTo(obs.x + obs.width * 0.45, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.8, obs.y + 5);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();
            // Ancient texture — rough and pocked
            ctx.strokeStyle = 'rgba(70, 65, 60, 0.5)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const ly = obs.y + obs.height * (0.3 + i * 0.25);
                ctx.beginPath();
                ctx.moveTo(obs.x + 2, ly);
                ctx.lineTo(obs.x + obs.width - 2, ly + 2);
                ctx.stroke();
            }

        } else if (obs.type === 'impact_debris') {
            ctx.save();
            ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
            // Irregular rocky shape
            ctx.fillStyle = '#3a3530';
            ctx.beginPath();
            const sides = 5 + Math.floor(obs.width / 8);
            for (let i = 0; i < sides; i++) {
                const a = (i / sides) * Math.PI * 2;
                const r = obs.width / 2 * (0.6 + Math.sin(i * 2.3) * 0.4);
                if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(80, 70, 60, 0.7)';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Highlight
            ctx.fillStyle = 'rgba(80, 75, 65, 0.5)';
            ctx.beginPath();
            ctx.ellipse(-obs.width * 0.15, -obs.height * 0.2, obs.width * 0.2, obs.height * 0.12, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'crater_pit') {
            return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: 55, isGap: true };
        }
        if (obs.type === 'impact_debris') {
            return { x: obs.x + 3, y: obs.y, width: obs.width - 6, height: obs.height };
        }
        return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: obs.height };
    }
};

window.CallistoLevel = CallistoLevel;

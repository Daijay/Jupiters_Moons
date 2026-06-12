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

    baseSpeed: 5.5,
    speedIncrement: 0.00042,
    maxSpeed: 8.5,
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
        this.obstacleInterval = 300;
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
            this.obstacleInterval = 260 + Math.random() * 160;
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
        if (rand < 0.50) {
            // Crater pit gap — narrowed width
            this.obstacles.push({
                type: 'crater_pit',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: 52 + Math.random() * 52,
                height: 20,
                dangerous: true
            });
        } else if (rand < 0.78) {
            // Crater rim wall — shorter
            const h = 42 + Math.random() * 38;
            this.obstacles.push({
                type: 'crater_rim',
                x: this.canvas.width + 50,
                y: this.groundY - h,
                width: 24 + Math.random() * 18,
                height: h,
                dangerous: true
            });
        } else {
            // Impact debris — slower, smaller
            this.obstacles.push({
                type: 'impact_debris',
                x: this.canvas.width * 0.55 + Math.random() * this.canvas.width * 0.4,
                y: -40,
                width: 16 + Math.random() * 16,
                height: 16 + Math.random() * 16,
                vy: 1.5 + Math.random() * 1.5,
                vx: -0.8 - Math.random() * 1.2,
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

        // Meteorite streaks in upper sky — more frequent than other moons (most cratered)
        for (let ms = 0; ms < 3; ms++) {
            const mSeed = Math.sin(this.distance * (0.00021 + ms * 0.000037) + ms * 4.7);
            if (mSeed > 0.84) {
                const mI = (mSeed - 0.84) * 6;
                const mX = canvas.width * (0.15 + ((ms * 0.31 + this.distance * 0.000028) % 0.72));
                const mY = canvas.height * (0.04 + ms * 0.06);
                const mLen = 40 + mI * 25;
                const metGrad = ctx.createLinearGradient(mX, mY, mX + mLen, mY + mLen * 0.35);
                metGrad.addColorStop(0, `rgba(255, 240, 210, ${Math.min(mI * 0.6, 0.8)})`);
                metGrad.addColorStop(0.5, `rgba(200, 160, 100, ${mI * 0.3})`);
                metGrad.addColorStop(1, 'transparent');
                ctx.strokeStyle = metGrad;
                ctx.lineWidth = 1 + mI * 0.5;
                ctx.beginPath();
                ctx.moveTo(mX, mY);
                ctx.lineTo(mX + mLen, mY + mLen * 0.35);
                ctx.stroke();
            }
        }

        // Ancient surface layering — faint strata visible at ground level
        for (let st = 0; st < 5; st++) {
            const stY = this.groundY + 18 + st * 9;
            const stX = (st * 113 + this.distance * 0.38) % canvas.width;
            const stA = 0.08 + st * 0.025;
            ctx.fillStyle = `rgba(42, 38, 34, ${stA})`;
            ctx.fillRect(stX, stY, 55 + (st % 4) * 20, 2);
        }

        // Very faint nebula background haze — deep space at this distance
        const hazeGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.5);
        hazeGrad.addColorStop(0, `rgba(20, 15, 10, ${0.025 + Math.sin(this.distance * 0.0002) * 0.01})`);
        hazeGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'crater_pit') {
            // Callisto ancient crater — wide multi-ring basin
            const cx = obs.x + obs.width / 2;
            const rimY = obs.y;
            const w = obs.width;

            // Outer ejecta blanket — faint brightening around crater
            const ejectaGrad = ctx.createRadialGradient(cx, rimY, w * 0.4, cx, rimY, w * 1.0);
            ejectaGrad.addColorStop(0, 'rgba(70, 62, 55, 0.0)');
            ejectaGrad.addColorStop(0.6, 'rgba(55, 50, 44, 0.3)');
            ejectaGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = ejectaGrad;
            ctx.beginPath();
            ctx.ellipse(cx, rimY, w * 0.5 + 20, 14, 0, Math.PI, 0);
            ctx.fill();

            // Outer rim — raised rounded lip
            ctx.fillStyle = '#3a3530';
            ctx.beginPath();
            ctx.ellipse(cx, rimY - 3, w / 2 + 8, 11, 0, 0, Math.PI);
            ctx.fill();

            // Rim highlight
            ctx.strokeStyle = 'rgba(110, 100, 88, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, rimY - 3, w / 2 + 8, 11, 0, Math.PI, 0, true);
            ctx.stroke();

            // Pit void
            ctx.fillStyle = '#060504';
            ctx.fillRect(obs.x, rimY, w, 55);

            // Multi-ring bowl interior
            const bowlGrad = ctx.createLinearGradient(obs.x, rimY + 2, obs.x, rimY + 50);
            bowlGrad.addColorStop(0, 'rgba(45, 40, 36, 0.95)');
            bowlGrad.addColorStop(0.3, 'rgba(22, 19, 17, 0.97)');
            bowlGrad.addColorStop(1, 'rgba(4, 3, 2, 0.99)');
            ctx.fillStyle = bowlGrad;
            ctx.fillRect(obs.x + 2, rimY + 2, w - 4, 48);

            // Inner rings — secondary crater rings visible at scale
            for (let ring = 1; ring <= 2; ring++) {
                ctx.strokeStyle = `rgba(55, 50, 44, ${0.5 - ring * 0.1})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(obs.x + w * (0.08 * ring), rimY + 5 * ring);
                ctx.lineTo(obs.x + w * (1 - 0.08 * ring), rimY + 5 * ring);
                ctx.stroke();
            }

            // Central peak hint (large Callisto craters have central pits/peaks)
            ctx.fillStyle = 'rgba(35, 31, 28, 0.8)';
            ctx.beginPath();
            ctx.ellipse(cx, rimY + 40, w * 0.12, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(60, 55, 50, 0.4)';
            ctx.lineWidth = 0.8;
            ctx.stroke();

        } else if (obs.type === 'crater_rim') {
            // Ancient raised crater wall — weathered, layered, pocked
            const pts = [
                [obs.x, obs.y + obs.height],
                [obs.x + obs.width * 0.1, obs.y + obs.height * 0.6],
                [obs.x + obs.width * 0.25, obs.y + obs.height * 0.22],
                [obs.x + obs.width * 0.45, obs.y],
                [obs.x + obs.width * 0.62, obs.y + obs.height * 0.08],
                [obs.x + obs.width * 0.78, obs.y + obs.height * 0.32],
                [obs.x + obs.width * 0.9, obs.y + obs.height * 0.58],
                [obs.x + obs.width, obs.y + obs.height],
            ];

            // Base fill — ancient dark terrain
            const wallGrad = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            wallGrad.addColorStop(0, '#1e1c1a');
            wallGrad.addColorStop(0.4, '#2e2b28');
            wallGrad.addColorStop(0.75, '#3e3a36');
            wallGrad.addColorStop(1, '#4a4540');
            ctx.fillStyle = wallGrad;
            ctx.beginPath();
            pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            ctx.fill();

            // Shadow left face
            ctx.fillStyle = 'rgba(5, 4, 3, 0.4)';
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            ctx.lineTo(pts[2][0], pts[2][1]);
            ctx.lineTo(pts[3][0], pts[3][1]);
            ctx.lineTo(pts[0][0], pts[0][1]);
            ctx.fill();

            // Cliff drawing — stratigraphic layers
            ctx.save();
            ctx.beginPath();
            pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            ctx.clip();
            for (let l = 0; l < 4; l++) {
                const ly = obs.y + obs.height * (0.25 + l * 0.18);
                ctx.strokeStyle = `rgba(65, 60, 55, ${0.35 - l * 0.05})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(obs.x, ly);
                ctx.lineTo(obs.x + obs.width, ly + obs.height * 0.04);
                ctx.stroke();
            }
            // Impact pock marks on face
            for (let p = 0; p < 5; p++) {
                const px = obs.x + obs.width * (0.15 + p * 0.18);
                const py = obs.y + obs.height * (0.3 + (p % 3) * 0.2);
                ctx.strokeStyle = 'rgba(25, 22, 20, 0.6)';
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.arc(px, py, 2 + (p % 3), 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();

            // Bright crest highlight
            ctx.strokeStyle = 'rgba(95, 88, 80, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pts[2][0], pts[2][1]);
            ctx.lineTo(pts[3][0], pts[3][1]);
            ctx.lineTo(pts[4][0], pts[4][1]);
            ctx.stroke();

        } else if (obs.type === 'impact_debris') {
            ctx.save();
            ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

            const hw = obs.width / 2;
            const hh = obs.height / 2;

            // Re-entry heat trail — glowing streak behind
            const trailLen = hw * 3.5;
            const trailGrad = ctx.createLinearGradient(hw, 0, hw + trailLen, 0);
            trailGrad.addColorStop(0, `rgba(200, 120, 40, ${0.6 + Math.sin(Date.now() * 0.006) * 0.1})`);
            trailGrad.addColorStop(0.4, 'rgba(160, 70, 10, 0.3)');
            trailGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = trailGrad;
            ctx.beginPath();
            ctx.moveTo(hw, -hh * 0.5);
            ctx.lineTo(hw + trailLen, -2);
            ctx.lineTo(hw + trailLen, 2);
            ctx.lineTo(hw, hh * 0.5);
            ctx.closePath();
            ctx.fill();

            // Heat glow around rock
            const heatGlow = ctx.createRadialGradient(0, 0, hw * 0.4, 0, 0, hw * 1.8);
            heatGlow.addColorStop(0, 'rgba(255, 150, 50, 0.22)');
            heatGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = heatGlow;
            ctx.fillRect(-hw * 1.8, -hh * 1.8, hw * 3.6, hh * 3.6);

            // Irregular rocky silhouette
            const sides = 6 + Math.floor(hw / 4);
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const a = (i / sides) * Math.PI * 2 - 0.3;
                const r = hw * (0.65 + Math.sin(i * 2.7 + obs.x * 0.05) * 0.35);
                if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.85);
                else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.85);
            }
            ctx.closePath();
            // Dark interior with hot orange edges
            const rockGrad = ctx.createRadialGradient(-hw * 0.2, -hh * 0.2, 0, 0, 0, hw);
            rockGrad.addColorStop(0, '#2a2520');
            rockGrad.addColorStop(0.5, '#1e1a16');
            rockGrad.addColorStop(1, '#0e0c0a');
            ctx.fillStyle = rockGrad;
            ctx.fill();

            // Glowing molten edges
            ctx.strokeStyle = `rgba(210, 100, 20, ${0.5 + Math.sin(Date.now() * 0.008) * 0.15})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Surface facet highlight
            ctx.fillStyle = 'rgba(75, 68, 60, 0.6)';
            ctx.beginPath();
            ctx.ellipse(-hw * 0.25, -hh * 0.3, hw * 0.28, hh * 0.18, -0.5, 0, Math.PI * 2);
            ctx.fill();

            // Fragment sparks
            for (let sp = 0; sp < 4; sp++) {
                const sa = (sp / 4) * Math.PI + 0.2;
                const sd = hw * (0.9 + Math.sin(Date.now() * 0.01 + sp) * 0.15);
                ctx.beginPath();
                ctx.arc(Math.cos(sa) * sd * 1.1, Math.sin(sa) * sd * 0.7, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, ${140 + sp * 20}, 30, ${0.6 - sp * 0.1})`;
                ctx.fill();
            }

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

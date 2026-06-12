// ============================================
// GANYMEDE - Largest Moon in the Solar System
// Grooved icy terrain, magnetic field, dark ancient regions
// Level 3
// ============================================

const GanymedeLevel = {
    id: 'ganymede',
    name: 'Ganymede',
    designation: 'Jupiter III',
    distanceFromJupiter: '1,070,400 km',
    surfaceTemp: '-163°C',
    facts: [
        'Ganymede is the largest moon in the solar system, bigger than the planet Mercury.',
        'It is the only moon known to have its own magnetic field, creating its own miniature magnetosphere.',
        'The surface shows two distinct types of terrain: ancient dark regions and younger grooved bright terrain.',
        'Ganymede likely contains a saltwater ocean beneath its icy crust, sandwiched between layers of ice.'
    ],
    hazardWarning: 'Grooved terrain ridges rise suddenly from the surface. Magnetic pulse waves radiate outward from the core and must be avoided. Watch for crater pit gaps in the ancient dark terrain.',
    missionControlMessage: `Galileo, you are approaching Ganymede.

Largest moon in the solar system. Bigger than Mercury. And it has something no other moon has: its own magnetic field. We can detect it from here.

The surface is a mix of ancient dark terrain — billions of years old — and younger grooved regions where the ice has shifted.

Watch for terrain ridges. The magnetic field generates pulse waves across the surface that can be disrupted — stay clear of them.

Mission Control out.`,

    baseSpeed: 5.2,
    speedIncrement: 0.00032,
    maxSpeed: 7.5,
    gravity: 0.35,
    jumpForce: -12,

    colors: {
        sky: ['#030305', '#050810', '#08101a'],
        ground: '#484858',
        groundAccent: '#606070',
        atmosphere: 'rgba(80, 120, 200, 0.08)',
        particles: ['#6080b0', '#8090c0', '#4060a0']
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.particles = [];
        this.grooves = this.generateGrooves();
        this.backgroundLayers = this.createBackground();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 360;
        this.groundCurveOffset = 0;
        this.magneticTime = 0;
    },

    generateGrooves() {
        const grooves = [];
        for (let i = 0; i < 25; i++) {
            grooves.push({
                x: Math.random() * 2000,
                width: 3 + Math.random() * 8,
                length: 60 + Math.random() * 140,
                angle: Math.PI * 0.15 + Math.random() * 0.3,
                brightness: 0.3 + Math.random() * 0.5
            });
        }
        return grooves;
    },

    createBackground() {
        return {
            darkRegions: this.generateDarkRegions(12, 0.4),
            ridgesBg: this.generateRidgesBg(8, 0.5)
        };
    },

    generateDarkRegions(count, opacity) {
        const regions = [];
        for (let i = 0; i < count; i++) {
            regions.push({
                x: (i / count) * this.canvas.width * 2,
                width: 100 + Math.random() * 200,
                height: 30 + Math.random() * 80,
                opacity
            });
        }
        return regions;
    },

    generateRidgesBg(count, opacity) {
        const ridges = [];
        for (let i = 0; i < count; i++) {
            ridges.push({
                x: (i / count) * this.canvas.width * 2,
                width: 40 + Math.random() * 80,
                height: 25 + Math.random() * 60,
                opacity
            });
        }
        return ridges;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.magneticTime += 0.02;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        this.updateParallax(this.backgroundLayers.darkRegions, 0.2);
        this.updateParallax(this.backgroundLayers.ridgesBg, 0.5);
        this.grooves.forEach(g => {
            g.x -= this.speed * 0.4;
            if (g.x < -g.length) g.x = this.canvas.width + Math.random() * 300;
        });

        this.groundCurveOffset = Math.sin(this.distance * 0.0015) * 8;

        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 320 + Math.random() * 220;
        }

        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            if (obs.type === 'magnetic_pulse') {
                obs.pulseAge += 0.04;
            }
            return obs.x > -obs.width - 100;
        });

        // Magnetic aurora particles
        if (Math.random() > 0.9) {
            this.particles.push({
                x: this.canvas.width * 0.5 + (Math.random() - 0.5) * this.canvas.width,
                y: Math.random() * this.groundY * 0.5,
                size: 2 + Math.random() * 4,
                speed: 0.3 + Math.random() * 0.8,
                opacity: 0.4 + Math.random() * 0.4,
                vy: 0.2 + Math.random() * 0.4
            });
        }
        this.particles = this.particles.filter(p => {
            p.x -= p.speed + this.speed * 0.1;
            p.y += p.vy;
            p.opacity -= 0.006;
            return p.opacity > 0 && p.y < this.groundY;
        });

        return this.obstacles;
    },

    updateParallax(layer, factor) {
        layer.forEach(item => {
            item.x -= this.speed * factor;
            if (item.x < -item.width) {
                item.x = this.canvas.width + Math.random() * 200;
            }
        });
    },

    spawnObstacle() {
        const rand = Math.random();
        if (rand < 0.38) {
            // Grooved terrain ridge — slightly shorter
            const h = 50 + Math.random() * 42;
            this.obstacles.push({
                type: 'terrain_ridge',
                x: this.canvas.width + 50,
                y: this.groundY - h,
                width: 28 + Math.random() * 20,
                height: h,
                dangerous: true
            });
        } else if (rand < 0.72) {
            // Crater pit gap — narrower range
            this.obstacles.push({
                type: 'crater_pit',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: 58 + Math.random() * 38,
                height: 20,
                dangerous: true
            });
        } else {
            // Magnetic pulse wave — slightly shorter, looser hitbox
            const h = 55 + Math.random() * 40;
            this.obstacles.push({
                type: 'magnetic_pulse',
                x: this.canvas.width + 50,
                y: this.groundY - h,
                width: 10,
                height: h,
                pulseAge: 0,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Real NASA Ganymede surface image as background
        if (!GameImages.drawCover(ctx, 'ganymedeSurface', 0, 0, canvas.width, canvas.height)) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGrad.addColorStop(0, '#020205');
            skyGrad.addColorStop(0.5, '#040810');
            skyGrad.addColorStop(1, '#060d18');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Dark overlay — heavier at top for obstacle readability
        ctx.fillStyle = 'rgba(2, 4, 10, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const ganSkyDark = ctx.createLinearGradient(0, 0, 0, this.groundY);
        ganSkyDark.addColorStop(0, 'rgba(0, 4, 18, 0.55)');
        ganSkyDark.addColorStop(0.6, 'rgba(0, 3, 12, 0.18)');
        ganSkyDark.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ganSkyDark;
        ctx.fillRect(0, 0, canvas.width, this.groundY);

        // Stars
        for (let i = 0; i < 150; i++) {
            const sx = (i * 53 + this.distance * 0.04) % canvas.width;
            const sy = (i * 37) % (canvas.height * 0.65);
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3) * 0.35 + 0.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 6) * 0.08})`;
            ctx.fill();
        }

        // Magnetic aurora arcs across sky
        const auroraIntensity = 0.3 + Math.sin(this.magneticTime) * 0.15;
        for (let a = 0; a < 3; a++) {
            const ax = canvas.width * (0.2 + a * 0.3) + Math.sin(this.magneticTime + a) * 30;
            const ay = canvas.height * 0.15;
            const aGlow = ctx.createRadialGradient(ax, ay, 0, ax, ay, 80 + a * 20);
            aGlow.addColorStop(0, `rgba(80, 120, 255, ${auroraIntensity * 0.4})`);
            aGlow.addColorStop(0.5, `rgba(60, 100, 220, ${auroraIntensity * 0.15})`);
            aGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = aGlow;
            ctx.fillRect(ax - 100, ay - 80, 200, 160);
        }

        // Jupiter — distant but large
        const jx = canvas.width * 0.78;
        const jy = canvas.height * 0.2;
        const jr = 70;
        const jupGrad = ctx.createRadialGradient(jx - jr * 0.3, jy - jr * 0.2, 0, jx, jy, jr);
        jupGrad.addColorStop(0, 'rgba(210, 180, 140, 0.8)');
        jupGrad.addColorStop(0.5, 'rgba(180, 140, 95, 0.75)');
        jupGrad.addColorStop(1, 'rgba(130, 90, 55, 0.6)');
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.fillStyle = jupGrad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.clip();
        const bC = ['rgba(160,110,65,0.4)', 'rgba(210,175,120,0.25)', 'rgba(130,75,35,0.45)'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = bC[i % bC.length];
            ctx.fillRect(jx - jr, jy - jr + (jr * 2 / 5) * i, jr * 2, jr * 0.35);
        }
        ctx.fillStyle = 'rgba(180, 70, 35, 0.45)';
        ctx.beginPath();
        ctx.ellipse(jx + jr * 0.1, jy + jr * 0.05, jr * 0.25, jr * 0.12, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Ground
        const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, canvas.height);
        groundGrad.addColorStop(0, '#505060');
        groundGrad.addColorStop(0.3, '#404050');
        groundGrad.addColorStop(1, '#282830');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 20) {
            const curveY = this.groundY + Math.sin((x + this.distance) * 0.0025) * 7 + this.groundCurveOffset;
            ctx.lineTo(x, curveY);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Groove lines on surface
        this.grooves.forEach(g => {
            const sx = g.x;
            const sy = this.groundY + 5;
            ctx.strokeStyle = `rgba(160, 170, 190, ${g.brightness * 0.5})`;
            ctx.lineWidth = g.width * 0.4;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + g.length * Math.cos(g.angle), sy + g.length * Math.sin(g.angle) * 0.2);
            ctx.stroke();
        });

        // Surface craters — small pocks
        for (let i = 0; i < 30; i++) {
            const cx = (i * 67 + this.distance * 0.5) % canvas.width;
            const cy = this.groundY + 8 + (i % 5) * 10;
            const cr = 3 + (i % 4) * 3;
            ctx.strokeStyle = `rgba(100, 100, 120, 0.5)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Aurora particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 150, 255, ${p.opacity})`;
            ctx.fill();
        });

        // === GANYMEDE UNIQUE ATMOSPHERE ===

        // Magnetic field particle streams — arcing across sky
        const magT = this.magneticTime;
        for (let i = 0; i < 5; i++) {
            const startX = canvas.width * (0.1 + i * 0.2);
            const arcH = canvas.height * (0.08 + (i % 3) * 0.04);
            const phase = magT * 0.8 + i * 1.3;
            const streamAlpha = 0.06 + Math.sin(phase) * 0.03;
            ctx.beginPath();
            ctx.moveTo(startX, 0);
            ctx.quadraticCurveTo(
                startX + Math.sin(phase * 0.4) * 80,
                arcH,
                startX + Math.cos(phase * 0.3) * 60,
                canvas.height * 0.45
            );
            ctx.strokeStyle = `rgba(80, 130, 255, ${streamAlpha})`;
            ctx.lineWidth = 1.5 + (i % 2) * 0.5;
            ctx.stroke();
        }

        // Magnetic dust particles following field lines
        for (let i = 0; i < 20; i++) {
            const mx = ((i * 127.3 + magT * 18 * (i % 3 + 1)) % canvas.width);
            const my = canvas.height * (0.08 + (i % 6) * 0.085);
            const mAlpha = 0.1 + Math.sin(magT * 1.2 + i * 0.9) * 0.06;
            ctx.beginPath();
            ctx.arc(mx, my, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(90, 140, 255, ${mAlpha})`;
            ctx.fill();
        }

        // Grooved terrain parallax highlight lines
        for (let i = 0; i < 10; i++) {
            const gx = ((i * 183 + this.distance * 0.35) % (canvas.width + 250)) - 100;
            const angle = Math.PI * (0.16 + (i % 4) * 0.02);
            const gLen = 130 + (i % 3) * 50;
            const gAlpha = 0.08 + (i % 3) * 0.03;
            ctx.strokeStyle = `rgba(140, 155, 185, ${gAlpha})`;
            ctx.lineWidth = 0.8 + (i % 2) * 0.4;
            ctx.beginPath();
            ctx.moveTo(gx, this.groundY - 5);
            ctx.lineTo(gx + Math.cos(angle) * gLen, this.groundY - Math.sin(angle) * gLen * 0.45);
            ctx.stroke();
        }

        // Surface dust kicked up from ground — slow horizontal drift
        for (let i = 0; i < 15; i++) {
            const dx = ((i * 211.7 + this.distance * 0.6 + Math.sin(i * 2.1) * 20) % (canvas.width + 20)) - 10;
            const dy = this.groundY - 4 - (i % 5) * 6;
            const dAlpha = 0.06 + (i % 4) * 0.02;
            ctx.beginPath();
            ctx.arc(dx, dy, 1 + (i % 3) * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(120, 125, 145, ${dAlpha})`;
            ctx.fill();
        }

        // Distant aurora curtain in upper sky
        const aT = magT * 0.5;
        for (let x = 0; x < canvas.width; x += 5) {
            const waveA = Math.sin(x * 0.015 + aT) * 10;
            const waveB = Math.sin(x * 0.008 + aT * 1.3) * 8;
            const curveY = canvas.height * 0.07 + waveA + waveB;
            const curtainAlpha = 0.05 + Math.sin(x * 0.02 + aT) * 0.025;
            const curtainH = 20 + Math.sin(x * 0.018 + aT * 0.7) * 10;
            const aGrad = ctx.createLinearGradient(x, curveY - curtainH, x, curveY);
            aGrad.addColorStop(0, 'transparent');
            aGrad.addColorStop(0.5, `rgba(70, 120, 255, ${curtainAlpha})`);
            aGrad.addColorStop(1, `rgba(100, 80, 220, ${curtainAlpha * 0.5})`);
            ctx.fillStyle = aGrad;
            ctx.fillRect(x, curveY - curtainH, 4, curtainH);
        }

        // Magnetic polar oval — faint oval glow in upper sky
        const pOvalAlpha = 0.04 + Math.sin(magT * 0.6) * 0.02;
        const pOvalGrad = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.04, 20, canvas.width * 0.5, canvas.height * 0.04, canvas.width * 0.55);
        pOvalGrad.addColorStop(0, 'transparent');
        pOvalGrad.addColorStop(0.7, `rgba(60, 100, 240, ${pOvalAlpha})`);
        pOvalGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = pOvalGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.12);

        // Ground groove shadow detail — horizontal banding near surface
        for (let gb = 0; gb < 6; gb++) {
            const gbY = this.groundY + 12 + gb * 14;
            const gbX = (gb * 139 + this.distance * 0.45) % canvas.width;
            ctx.fillStyle = `rgba(30, 30, 40, ${0.18 + gb * 0.04})`;
            ctx.fillRect(gbX, gbY, 45 + (gb % 4) * 15, 3);
        }

        // Magnetospheric charged particle rain — ultra-faint streaks from sky
        for (let cr = 0; cr < 8; cr++) {
            const crX = ((cr * 97 + magT * 22 * (1 + cr * 0.15)) % canvas.width);
            const crY1 = canvas.height * (cr % 4) * 0.06;
            const crY2 = crY1 + 25 + (cr % 3) * 10;
            const crA = 0.04 + (cr % 3) * 0.015;
            ctx.strokeStyle = `rgba(120, 170, 255, ${crA})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(crX, crY1);
            ctx.lineTo(crX + 2, crY2);
            ctx.stroke();
        }
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'terrain_ridge') {
            // Ganymede grooved terrain ridge — two-tone: dark ancient region + bright grooved face
            const pts = [
                [obs.x, obs.y + obs.height],
                [obs.x + obs.width * 0.15, obs.y + obs.height * 0.5],
                [obs.x + obs.width * 0.32, obs.y + obs.height * 0.12],
                [obs.x + obs.width * 0.5, obs.y],
                [obs.x + obs.width * 0.68, obs.y + obs.height * 0.1],
                [obs.x + obs.width * 0.85, obs.y + obs.height * 0.42],
                [obs.x + obs.width, obs.y + obs.height],
            ];

            // Dark ancient terrain base
            const baseGrad = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            baseGrad.addColorStop(0, '#2a2a34');
            baseGrad.addColorStop(0.4, '#404050');
            baseGrad.addColorStop(0.8, '#565668');
            baseGrad.addColorStop(1, '#686878');
            ctx.fillStyle = baseGrad;
            ctx.beginPath();
            pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            ctx.fill();

            // Left dark face (shadowed)
            ctx.fillStyle = 'rgba(10, 10, 18, 0.35)';
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            ctx.lineTo(pts[2][0], pts[2][1]);
            ctx.lineTo(pts[3][0], pts[3][1]);
            ctx.lineTo(pts[0][0], pts[0][1]);
            ctx.fill();

            // Grooves — characteristic Ganymede parallel striations
            ctx.save();
            ctx.beginPath();
            pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            ctx.clip();
            ctx.strokeStyle = 'rgba(160, 165, 190, 0.35)';
            ctx.lineWidth = 1;
            for (let g = 0; g < 5; g++) {
                const gx = obs.x + obs.width * (0.22 + g * 0.14);
                ctx.beginPath();
                ctx.moveTo(gx, obs.y + obs.height);
                ctx.lineTo(gx - obs.height * 0.18, obs.y);
                ctx.stroke();
            }
            ctx.restore();

            // Bright icy highlight on top ridgeline
            ctx.strokeStyle = 'rgba(210, 220, 240, 0.7)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(pts[1][0], pts[1][1]);
            ctx.lineTo(pts[2][0], pts[2][1]);
            ctx.lineTo(pts[3][0], pts[3][1]);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(180, 195, 225, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[3][0], pts[3][1]);
            ctx.lineTo(pts[4][0], pts[4][1]);
            ctx.lineTo(pts[5][0], pts[5][1]);
            ctx.stroke();

            // Aurora tint reflection on ridge surface
            ctx.fillStyle = 'rgba(60, 100, 220, 0.06)';
            ctx.beginPath();
            pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            ctx.fill();

        } else if (obs.type === 'crater_pit') {
            // Ganymede crater — elliptical bowl with raised rim rings
            const cx = obs.x + obs.width / 2;
            const rimY = obs.y;
            const w = obs.width;

            // Outer raised rim shadow — sloped sides visible
            const rimGrad = ctx.createLinearGradient(obs.x, rimY - 8, obs.x, rimY + 10);
            rimGrad.addColorStop(0, 'rgba(90, 90, 108, 0.85)');
            rimGrad.addColorStop(0.5, 'rgba(60, 60, 75, 0.7)');
            rimGrad.addColorStop(1, 'rgba(20, 20, 28, 0.4)');
            ctx.fillStyle = rimGrad;
            ctx.beginPath();
            ctx.ellipse(cx, rimY - 2, w / 2 + 6, 10, 0, 0, Math.PI);
            ctx.fill();

            // Pit void
            ctx.fillStyle = '#0e0e16';
            ctx.fillRect(obs.x, rimY, w, 50);

            // Interior bowl gradient
            const bowlGrad = ctx.createLinearGradient(obs.x, rimY + 2, obs.x, rimY + 38);
            bowlGrad.addColorStop(0, 'rgba(50, 50, 65, 0.9)');
            bowlGrad.addColorStop(0.5, 'rgba(22, 22, 32, 0.95)');
            bowlGrad.addColorStop(1, 'rgba(8, 8, 12, 0.98)');
            ctx.fillStyle = bowlGrad;
            ctx.fillRect(obs.x + 2, rimY + 2, w - 4, 36);

            // Elliptical inner floor hint
            ctx.fillStyle = 'rgba(15, 15, 25, 0.95)';
            ctx.beginPath();
            ctx.ellipse(cx, rimY + 28, w * 0.32, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Rim highlight — bright lip
            ctx.strokeStyle = 'rgba(130, 135, 160, 0.75)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, rimY);
            ctx.lineTo(obs.x + w, rimY);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(80, 85, 105, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + 4, rimY + 4);
            ctx.lineTo(obs.x + w - 4, rimY + 4);
            ctx.stroke();

            // Aurora faint reflected glow at pit floor
            ctx.fillStyle = 'rgba(50, 80, 180, 0.05)';
            ctx.fillRect(obs.x + 3, rimY + 20, w - 6, 18);

        } else if (obs.type === 'magnetic_pulse') {
            const pulse = Math.sin(obs.pulseAge * 3) * 0.5 + 0.5;
            const cx = obs.x + obs.width / 2;

            // Expanding electromagnetic field rings
            for (let r = 3; r >= 0; r--) {
                const rAge = (obs.pulseAge * 0.7 + r * 0.5) % 2;
                const rScale = rAge / 2;
                const rAlpha = (1 - rScale) * (0.12 + pulse * 0.08);
                const rw = (25 + r * 15) * rScale;
                ctx.strokeStyle = `rgba(${80 + r * 20}, ${140 + r * 15}, 255, ${rAlpha})`;
                ctx.lineWidth = 1.5 - r * 0.2;
                ctx.beginPath();
                ctx.ellipse(cx, obs.y + obs.height / 2, rw, obs.height * 0.45 * (0.4 + rScale * 0.6), 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Field lines arcing vertically
            for (let fl = 0; fl < 3; fl++) {
                const flX = cx + (fl - 1) * 8;
                const flAlpha = 0.15 + pulse * 0.15 + fl * 0.04;
                ctx.strokeStyle = `rgba(100, 160, 255, ${flAlpha})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(flX, obs.y);
                ctx.bezierCurveTo(flX - 6, obs.y + obs.height * 0.3, flX + 6, obs.y + obs.height * 0.7, flX, obs.y + obs.height);
                ctx.stroke();
            }

            // Core plasma column
            const coreGrad = ctx.createLinearGradient(cx - 3, 0, cx + 3, 0);
            coreGrad.addColorStop(0, `rgba(180, 210, 255, ${0.5 + pulse * 0.35})`);
            coreGrad.addColorStop(0.5, `rgba(220, 240, 255, ${0.8 + pulse * 0.2})`);
            coreGrad.addColorStop(1, `rgba(180, 210, 255, ${0.5 + pulse * 0.35})`);
            ctx.fillStyle = coreGrad;
            ctx.fillRect(cx - 2.5, obs.y, 5, obs.height);

            // Outer diffuse glow halo
            const haloGrad = ctx.createLinearGradient(cx - 35, 0, cx + 35, 0);
            haloGrad.addColorStop(0, 'transparent');
            haloGrad.addColorStop(0.4, `rgba(70, 130, 255, ${0.07 + pulse * 0.1})`);
            haloGrad.addColorStop(0.6, `rgba(70, 130, 255, ${0.07 + pulse * 0.1})`);
            haloGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = haloGrad;
            ctx.fillRect(cx - 35, obs.y, 70, obs.height);

            // Charged particle sparks along the column
            for (let sp = 0; sp < 4; sp++) {
                const sy = obs.y + obs.height * (0.15 + sp * 0.22);
                const sw = 5 + pulse * (4 + sp * 2);
                ctx.strokeStyle = `rgba(160, 200, 255, ${0.4 + pulse * 0.3})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(cx - sw, sy);
                ctx.lineTo(cx + sw, sy);
                ctx.stroke();
            }
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'crater_pit') {
            return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: 50, isGap: true };
        }
        if (obs.type === 'magnetic_pulse') {
            return { x: obs.x, y: obs.y, width: obs.width, height: obs.height };
        }
        return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: obs.height };
    }
};

window.GanymedeLevel = GanymedeLevel;

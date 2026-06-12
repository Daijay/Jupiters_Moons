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

    baseSpeed: 5.5,
    speedIncrement: 0.0004,
    maxSpeed: 8,
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
        this.obstacleInterval = 300;
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
            this.obstacleInterval = 260 + Math.random() * 200;
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
        if (rand < 0.35) {
            // Grooved terrain ridge
            const h = 60 + Math.random() * 55;
            this.obstacles.push({
                type: 'terrain_ridge',
                x: this.canvas.width + 50,
                y: this.groundY - h,
                width: 30 + Math.random() * 25,
                height: h,
                dangerous: true
            });
        } else if (rand < 0.65) {
            // Crater pit gap
            this.obstacles.push({
                type: 'crater_pit',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: 70 + Math.random() * 45,
                height: 20,
                dangerous: true
            });
        } else {
            // Magnetic pulse wave — tall thin wall with blue glow
            const h = 70 + Math.random() * 50;
            this.obstacles.push({
                type: 'magnetic_pulse',
                x: this.canvas.width + 50,
                y: this.groundY - h,
                width: 12,
                height: h,
                pulseAge: 0,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Sky — near-black with faint blue tint
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#020205');
        skyGrad.addColorStop(0.5, '#040810');
        skyGrad.addColorStop(1, '#060d18');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        // Background dark ancient regions
        this.backgroundLayers.darkRegions.forEach(r => {
            ctx.globalAlpha = r.opacity;
            ctx.fillStyle = '#282830';
            ctx.fillRect(r.x, this.groundY - r.height, r.width, r.height + 5);
            ctx.globalAlpha = 1;
        });

        // Background grooved ridges
        this.backgroundLayers.ridgesBg.forEach(r => {
            ctx.globalAlpha = r.opacity;
            ctx.fillStyle = '#5a5a6a';
            ctx.beginPath();
            ctx.moveTo(r.x, this.groundY);
            ctx.lineTo(r.x + r.width * 0.3, this.groundY - r.height);
            ctx.lineTo(r.x + r.width * 0.7, this.groundY - r.height * 0.7);
            ctx.lineTo(r.x + r.width, this.groundY);
            ctx.fill();
            ctx.globalAlpha = 1;
        });

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
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'terrain_ridge') {
            const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
            grad.addColorStop(0, '#80808f');
            grad.addColorStop(0.4, '#606070');
            grad.addColorStop(1, '#404048');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.2, obs.y + 5);
            ctx.lineTo(obs.x + obs.width * 0.5, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.8, obs.y + 8);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();
            // Bright icy streak on top
            ctx.strokeStyle = 'rgba(200, 210, 230, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.2, obs.y + 5);
            ctx.lineTo(obs.x + obs.width * 0.5, obs.y);
            ctx.stroke();

        } else if (obs.type === 'crater_pit') {
            ctx.fillStyle = '#181820';
            ctx.fillRect(obs.x, obs.y, obs.width, 50);
            // Rim highlight
            ctx.strokeStyle = 'rgba(100, 100, 120, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.stroke();
            // Inner shadow
            const craterGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + 40);
            craterGrad.addColorStop(0, 'rgba(30, 30, 40, 0.8)');
            craterGrad.addColorStop(1, 'rgba(10, 10, 15, 0.95)');
            ctx.fillStyle = craterGrad;
            ctx.fillRect(obs.x + 2, obs.y, obs.width - 4, 35);

        } else if (obs.type === 'magnetic_pulse') {
            const pulse = Math.sin(obs.pulseAge * 3) * 0.5 + 0.5;
            // Outer glow
            const glowW = 20 + pulse * 30;
            const glow = ctx.createLinearGradient(obs.x - glowW, obs.y, obs.x + obs.width + glowW, obs.y);
            glow.addColorStop(0, 'transparent');
            glow.addColorStop(0.3, `rgba(60, 120, 255, ${0.1 + pulse * 0.15})`);
            glow.addColorStop(0.5, `rgba(100, 160, 255, ${0.2 + pulse * 0.2})`);
            glow.addColorStop(0.7, `rgba(60, 120, 255, ${0.1 + pulse * 0.15})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(obs.x - glowW, obs.y, obs.width + glowW * 2, obs.height);
            // Core wave line
            ctx.fillStyle = `rgba(150, 200, 255, ${0.6 + pulse * 0.4})`;
            ctx.fillRect(obs.x + obs.width / 2 - 2, obs.y, 4, obs.height);
            // Horizontal ripple marks
            ctx.strokeStyle = `rgba(100, 180, 255, ${0.3 + pulse * 0.3})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const ry = obs.y + i * obs.height / 5;
                const rw = 8 + pulse * 12;
                ctx.beginPath();
                ctx.moveTo(obs.x + obs.width / 2 - rw, ry);
                ctx.lineTo(obs.x + obs.width / 2 + rw, ry);
                ctx.stroke();
            }
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'crater_pit') {
            return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: 50, isGap: true };
        }
        if (obs.type === 'magnetic_pulse') {
            return { x: obs.x - 5, y: obs.y, width: obs.width + 10, height: obs.height };
        }
        return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: obs.height };
    }
};

window.GanymedeLevel = GanymedeLevel;

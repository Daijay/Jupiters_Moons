// ============================================
// EUROPA - Jupiter's Icy Ocean Moon
// Cracked ice shell over subsurface ocean
// Level 2
// ============================================

const EuropaLevel = {
    id: 'europa',
    name: 'Europa',
    designation: 'Jupiter II',
    distanceFromJupiter: '671,100 km',
    surfaceTemp: '-160°C',
    facts: [
        'Europa\'s subsurface ocean contains more liquid water than all of Earth\'s oceans combined.',
        'The surface is the smoothest object in the solar system — no mountains, only a cracked icy shell.',
        'The ice shell is estimated to be 10–30 km thick over a liquid water ocean up to 100 km deep.',
        'The cracked brown lines on the surface are where warm ice has pushed up through the shell from below.'
    ],
    hazardWarning: 'Ice ridges have pushed up from below along ancient crack lines. Gaps in the ice lead directly into the ocean below. Watch for ice shard debris drifting across the surface.',
    missionControlMessage: `Galileo, you are approaching Europa.

Of all the moons in our solar system, this one has kept us awake at night. Beneath that cracked ice shell, we believe there is a liquid ocean — possibly harbouring life.

The surface is the smoothest we have ever seen. No mountains. But those crack lines can form ridges and sudden gaps.

Do not fall through. What is beneath that ice is not our concern today.

Survey the surface. Stay on top.

Mission Control out.`,

    baseSpeed: 5,
    speedIncrement: 0.0003,
    maxSpeed: 7,
    gravity: 0.3,
    jumpForce: -11,

    colors: {
        sky: ['#050810', '#0a1020', '#101828'],
        ground: '#d8e8f0',
        groundAccent: '#8a9aaa',
        atmosphere: 'rgba(180, 210, 255, 0.1)',
        particles: ['#c0d8f0', '#e0f0ff', '#a0b8d0']
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.particles = [];
        this.cracks = this.generateCracks();
        this.backgroundLayers = this.createBackground();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 320;
        this.groundCurveOffset = 0;
    },

    generateCracks() {
        const cracks = [];
        for (let i = 0; i < 30; i++) {
            cracks.push({
                x: Math.random() * 2000,
                y1: Math.random() * 0.6,
                y2: Math.random() * 0.4 + 0.3,
                angle: -0.3 + Math.random() * 0.6,
                width: 1 + Math.random() * 3,
                color: `rgba(${100 + Math.floor(Math.random() * 60)}, ${70 + Math.floor(Math.random() * 40)}, ${40 + Math.floor(Math.random() * 30)}, ${0.4 + Math.random() * 0.4})`
            });
        }
        return cracks;
    },

    createBackground() {
        return {
            farIce: this.generateIceFields(20, 0.3),
            midIce: this.generateIceFields(12, 0.6),
        };
    },

    generateIceFields(count, opacity) {
        const fields = [];
        for (let i = 0; i < count; i++) {
            fields.push({
                x: (i / count) * this.canvas.width * 2,
                width: 60 + Math.random() * 120,
                height: 20 + Math.random() * 50,
                opacity
            });
        }
        return fields;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        this.updateParallax(this.backgroundLayers.farIce, 0.2);
        this.updateParallax(this.backgroundLayers.midIce, 0.5);
        this.cracks.forEach(c => {
            c.x -= this.speed * 0.4;
            if (c.x < -100) c.x = this.canvas.width + Math.random() * 400;
        });

        this.groundCurveOffset = Math.sin(this.distance * 0.001) * 5;

        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 280 + Math.random() * 200;
        }

        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            if (obs.type === 'ice_shard') {
                obs.y += obs.vy;
                obs.vy += 0.15;
                obs.rotation += obs.rotSpeed;
            }
            return obs.x > -200 && obs.y < this.canvas.height + 50;
        });

        // Ice crystal particles
        if (Math.random() > 0.92) {
            this.particles.push({
                x: this.canvas.width + 10,
                y: Math.random() * this.groundY * 0.8,
                size: 1 + Math.random() * 3,
                speed: 0.5 + Math.random() * 1,
                opacity: 0.3 + Math.random() * 0.5,
                color: this.colors.particles[Math.floor(Math.random() * this.colors.particles.length)],
                vy: 0.1 + Math.random() * 0.3
            });
        }
        this.particles = this.particles.filter(p => {
            p.x -= p.speed + this.speed * 0.2;
            p.y += p.vy;
            p.opacity -= 0.005;
            return p.x > -10 && p.opacity > 0 && p.y < this.groundY;
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
            // Ice ridge wall
            const h = 55 + Math.random() * 50;
            this.obstacles.push({
                type: 'ice_ridge',
                x: this.canvas.width + 50,
                y: this.groundY - h,
                width: 25 + Math.random() * 20,
                height: h,
                dangerous: true
            });
        } else if (rand < 0.70) {
            // Crack gap
            this.obstacles.push({
                type: 'crack_gap',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: 65 + Math.random() * 45,
                height: 20,
                dangerous: true
            });
        } else {
            // Ice shard falling from above
            this.obstacles.push({
                type: 'ice_shard',
                x: this.canvas.width * 0.6 + Math.random() * this.canvas.width * 0.4,
                y: -30,
                width: 18,
                height: 30,
                vy: 1 + Math.random() * 1.5,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: 0.03 + Math.random() * 0.05,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Real NASA Europa surface image as background
        if (!GameImages.drawCover(ctx, 'europaSurface', 0, 0, canvas.width, canvas.height)) {
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#020408');
            skyGradient.addColorStop(0.5, '#060c14');
            skyGradient.addColorStop(1, '#0a1420');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Dark overlay for gameplay readability
        ctx.fillStyle = 'rgba(0, 5, 15, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        for (let i = 0; i < 120; i++) {
            const sx = (i * 47 + this.distance * 0.05) % canvas.width;
            const sy = (i * 31) % (canvas.height * 0.65);
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3) * 0.4 + 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.1})`;
            ctx.fill();
        }

        // Jupiter overhead — massive and close
        const jx = canvas.width * 0.3;
        const jy = canvas.height * 0.18;
        const jr = 110;
        const jupGrad = ctx.createRadialGradient(jx - jr * 0.3, jy - jr * 0.2, 0, jx, jy, jr);
        jupGrad.addColorStop(0, 'rgba(230, 200, 160, 0.95)');
        jupGrad.addColorStop(0.4, 'rgba(200, 160, 110, 0.9)');
        jupGrad.addColorStop(0.8, 'rgba(160, 110, 70, 0.85)');
        jupGrad.addColorStop(1, 'rgba(100, 60, 30, 0.7)');
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.fillStyle = jupGrad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.clip();
        const bandC = ['rgba(170,120,70,0.4)', 'rgba(220,185,130,0.25)', 'rgba(140,80,40,0.45)', 'rgba(200,165,100,0.3)'];
        for (let i = 0; i < 7; i++) {
            const by = jy - jr + (jr * 2 / 7) * i;
            ctx.fillStyle = bandC[i % bandC.length];
            ctx.fillRect(jx - jr, by, jr * 2, jr * 0.28);
        }
        ctx.fillStyle = 'rgba(190, 80, 40, 0.5)';
        ctx.beginPath();
        ctx.ellipse(jx + jr * 0.15, jy + jr * 0.1, jr * 0.28, jr * 0.13, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        const jglow = ctx.createRadialGradient(jx, jy, jr * 0.9, jx, jy, jr * 1.6);
        jglow.addColorStop(0, 'rgba(180,140,80,0.15)');
        jglow.addColorStop(1, 'transparent');
        ctx.fillStyle = jglow;
        ctx.beginPath();
        ctx.arc(jx, jy, jr * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Ground — bright icy surface
        const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, canvas.height);
        groundGrad.addColorStop(0, '#ddeef8');
        groundGrad.addColorStop(0.2, '#c8dcea');
        groundGrad.addColorStop(1, '#a0b8cc');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 20) {
            const curveY = this.groundY + Math.sin((x + this.distance) * 0.002) * 4 + this.groundCurveOffset;
            ctx.lineTo(x, curveY);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Crack lines on the surface
        this.cracks.forEach(c => {
            const sx = c.x;
            const sy = this.groundY + c.y1 * 60;
            const ex = c.x + 80 * Math.cos(c.angle);
            const ey = sy + 80 * Math.sin(c.angle + 0.5);
            ctx.strokeStyle = c.color;
            ctx.lineWidth = c.width;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        });

        // Ice surface shimmer
        for (let i = 0; i < 60; i++) {
            const x = (i * 43 + this.distance * 0.7) % canvas.width;
            const y = this.groundY + 3 + (i % 8) * 7;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + (i % 5) * 0.03})`;
            ctx.fillRect(x, y, 8 + (i % 20), 1);
        }

        // Obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Particles (ice crystals)
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 240, 255, ${p.opacity})`;
            ctx.fill();
        });
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'ice_ridge') {
            const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
            grad.addColorStop(0, '#e8f4fc');
            grad.addColorStop(0.4, '#c0d8ec');
            grad.addColorStop(1, '#90b0c8');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.25, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.55, obs.y + 8);
            ctx.lineTo(obs.x + obs.width * 0.75, obs.y - 4);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();
            // Highlight edge
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.25, obs.y);
            ctx.stroke();
            // Brown crack line
            ctx.strokeStyle = 'rgba(120, 80, 50, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.4, obs.y + 4);
            ctx.lineTo(obs.x + obs.width * 0.6, obs.y + obs.height);
            ctx.stroke();

        } else if (obs.type === 'crack_gap') {
            // Dark gap through ice to ocean below
            ctx.fillStyle = '#040810';
            ctx.fillRect(obs.x, obs.y, obs.width, 50);
            // Ocean blue glow at depth
            const oceanGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + 40);
            oceanGrad.addColorStop(0, 'rgba(0, 40, 80, 0.95)');
            oceanGrad.addColorStop(0.5, 'rgba(0, 60, 120, 0.8)');
            oceanGrad.addColorStop(1, 'rgba(0, 30, 70, 0.95)');
            ctx.fillStyle = oceanGrad;
            ctx.fillRect(obs.x, obs.y, obs.width, 30);
            // Shimmer
            ctx.fillStyle = 'rgba(100, 180, 255, 0.2)';
            ctx.fillRect(obs.x + obs.width * 0.2, obs.y + 4, obs.width * 0.3, 3);
            // Crack edge detail on both sides
            ctx.strokeStyle = 'rgba(120, 80, 50, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.stroke();
            // Ice edge highlight
            ctx.strokeStyle = 'rgba(220, 240, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + 1, obs.y);
            ctx.lineTo(obs.x + obs.width - 1, obs.y);
            ctx.stroke();

        } else if (obs.type === 'ice_shard') {
            ctx.save();
            ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
            ctx.rotate(obs.rotation);
            const shardGrad = ctx.createLinearGradient(-obs.width / 2, -obs.height / 2, obs.width / 2, obs.height / 2);
            shardGrad.addColorStop(0, 'rgba(220, 240, 255, 0.9)');
            shardGrad.addColorStop(0.5, 'rgba(180, 215, 240, 0.85)');
            shardGrad.addColorStop(1, 'rgba(140, 190, 220, 0.8)');
            ctx.fillStyle = shardGrad;
            ctx.beginPath();
            ctx.moveTo(0, -obs.height / 2);
            ctx.lineTo(obs.width / 2, obs.height / 2);
            ctx.lineTo(-obs.width / 2 + 4, obs.height / 2 - 4);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'crack_gap') {
            return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: 50, isGap: true };
        }
        if (obs.type === 'ice_shard') {
            return { x: obs.x + 3, y: obs.y, width: obs.width - 6, height: obs.height };
        }
        return { x: obs.x + 4, y: obs.y, width: obs.width - 8, height: obs.height };
    }
};

window.EuropaLevel = EuropaLevel;

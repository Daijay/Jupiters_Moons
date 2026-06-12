// ============================================
// IO - Jupiter's Innermost Galilean Moon
// Volcanic sulfur plains, lava jets, no craters
// Level 1 - Easiest
// ============================================

const IoLevel = {
    id: 'io',
    name: 'Io',
    designation: 'Jupiter I',
    distanceFromJupiter: '421,700 km',
    surfaceTemp: '-130°C to 1,600°C near volcanoes',
    facts: [
        'Io is the most volcanically active body in the solar system, with over 400 active volcanoes.',
        'Lava constantly resurfaces Io, erasing all impact craters — the surface is always being renewed.',
        'Io\'s volcanoes shoot sulfur plumes up to 500 km into space.',
        'Io is caught in a gravitational tug-of-war between Jupiter and neighbouring moons, generating intense internal heat.'
    ],
    hazardWarning: 'Active lava jets erupt from surface vents without warning. Sulfur lava flows roll across the plains. The ground is never stable on Io.',
    missionControlMessage: `Galileo, you are approaching Io — Jupiter's innermost Galilean moon.

This is the most volcanically active body we have ever observed. Over 400 active volcanoes. Lava plains of liquid sulfur. No impact craters — the surface is resurfaced constantly by eruption.

Watch for lava jets firing upward from the surface. Sulfur flows will cut across your path.

Survey what you can. Get clear before the next eruption.

Mission Control out.`,

    baseSpeed: 4,
    speedIncrement: 0.0003,
    maxSpeed: 6,
    gravity: 0.4,
    jumpForce: -12,

    colors: {
        sky: ['#0a0500', '#1a0d00', '#2a1500'],
        ground: '#3a2a00',
        groundAccent: '#4a3800',
        atmosphere: 'rgba(200, 120, 20, 0.25)',
        particles: ['#d4a010', '#e8c030', '#c06000']
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.particles = [];
        this.lavaGlows = [];
        this.backgroundLayers = this.createBackground();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 350;
        this.groundCurveOffset = 0;
    },

    createBackground() {
        return {
            farPlains: this.generatePlains(15, 0.3, 40),
            midPlains: this.generatePlains(10, 0.5, 70),
            nearPlains: this.generatePlains(8, 0.7, 100)
        };
    },

    generatePlains(count, opacity, height) {
        const plains = [];
        for (let i = 0; i < count; i++) {
            plains.push({
                x: (i / count) * this.canvas.width * 2,
                width: 80 + Math.random() * 160,
                height: height * (0.5 + Math.random() * 0.5),
                opacity: opacity,
                isVolcano: Math.random() > 0.6
            });
        }
        return plains;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        this.updateParallax(this.backgroundLayers.farPlains, 0.2);
        this.updateParallax(this.backgroundLayers.midPlains, 0.5);
        this.updateParallax(this.backgroundLayers.nearPlains, 0.8);

        this.groundCurveOffset = Math.sin(this.distance * 0.002) * 10;

        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 300 + Math.random() * 200;
        }

        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            if (obs.type === 'lava_jet') {
                obs.phase = (obs.phase + 0.08) % (Math.PI * 2);
                obs.jetHeight = obs.baseHeight * (0.7 + Math.sin(obs.phase) * 0.3);
            }
            return obs.x > -obs.width - 100;
        });

        // Lava glow particles near vents
        if (Math.random() > 0.88) {
            this.particles.push({
                x: this.canvas.width + 10,
                y: this.groundY - 20 - Math.random() * 60,
                size: 3 + Math.random() * 5,
                speed: 0.8 + Math.random() * 1.5,
                opacity: 0.5 + Math.random() * 0.4,
                color: this.colors.particles[Math.floor(Math.random() * this.colors.particles.length)],
                vy: -0.5 - Math.random() * 0.5
            });
        }

        this.particles = this.particles.filter(p => {
            p.x -= p.speed + this.speed * 0.3;
            p.y += p.vy;
            p.opacity -= 0.008;
            return p.x > -10 && p.opacity > 0;
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
        if (rand < 0.5) {
            // Lava jet - shoots upward, player must jump over
            const jetH = 60 + Math.random() * 50;
            this.obstacles.push({
                type: 'lava_jet',
                x: this.canvas.width + 50,
                y: this.groundY - jetH,
                width: 20 + Math.random() * 15,
                height: jetH,
                baseHeight: jetH,
                jetHeight: jetH,
                phase: 0,
                dangerous: true
            });
        } else {
            // Sulfur lava flow - gap in the ground
            this.obstacles.push({
                type: 'lava_flow',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: 70 + Math.random() * 50,
                height: 20,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const time = Date.now();

        // Real NASA Io volcanic surface image as background
        if (!GameImages.drawCover(ctx, 'ioVolcanoes', 0, 0, canvas.width, canvas.height)) {
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#070300');
            skyGradient.addColorStop(0.5, '#140900');
            skyGradient.addColorStop(0.85, '#2a1200');
            skyGradient.addColorStop(1, '#3a1800');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Dark overlay for gameplay readability + preserve volcanic mood
        ctx.fillStyle = 'rgba(10, 5, 0, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Jupiter in sky — massive presence
        const jx = canvas.width * 0.75;
        const jy = canvas.height * 0.22;
        const jr = 90;
        const jupGrad = ctx.createRadialGradient(jx - jr * 0.3, jy - jr * 0.2, 0, jx, jy, jr);
        jupGrad.addColorStop(0, 'rgba(220, 190, 150, 0.9)');
        jupGrad.addColorStop(0.4, 'rgba(200, 160, 110, 0.85)');
        jupGrad.addColorStop(0.7, 'rgba(170, 120, 80, 0.8)');
        jupGrad.addColorStop(1, 'rgba(120, 80, 50, 0.6)');
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.fillStyle = jupGrad;
        ctx.fill();
        // Bands on Jupiter
        ctx.save();
        ctx.beginPath();
        ctx.arc(jx, jy, jr, 0, Math.PI * 2);
        ctx.clip();
        const bandColors = ['rgba(180,130,80,0.3)', 'rgba(220,180,130,0.2)', 'rgba(150,90,50,0.35)', 'rgba(200,160,100,0.25)'];
        for (let i = 0; i < 6; i++) {
            const by = jy - jr + (jr * 2 / 6) * i;
            ctx.fillStyle = bandColors[i % bandColors.length];
            ctx.fillRect(jx - jr, by, jr * 2, jr * 0.3);
        }
        // GRS hint
        ctx.fillStyle = 'rgba(180, 80, 40, 0.4)';
        ctx.beginPath();
        ctx.ellipse(jx + jr * 0.2, jy + jr * 0.1, jr * 0.25, jr * 0.12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Glow around Jupiter
        const jGlow = ctx.createRadialGradient(jx, jy, jr * 0.9, jx, jy, jr * 1.5);
        jGlow.addColorStop(0, 'rgba(200, 150, 80, 0.15)');
        jGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = jGlow;
        ctx.beginPath();
        ctx.arc(jx, jy, jr * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Horizon lava glow
        const horizonGlow = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
        horizonGlow.addColorStop(0, 'transparent');
        horizonGlow.addColorStop(0.5, 'rgba(255, 100, 0, 0.15)');
        horizonGlow.addColorStop(1, 'rgba(255, 60, 0, 0.35)');
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

        // Ground
        const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, canvas.height);
        groundGrad.addColorStop(0, '#3a2800');
        groundGrad.addColorStop(0.3, '#2a1a00');
        groundGrad.addColorStop(1, '#1a0e00');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 20) {
            const curveY = this.groundY + Math.sin((x + this.distance) * 0.003) * 6 + this.groundCurveOffset;
            ctx.lineTo(x, curveY);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Sulfur surface texture streaks
        for (let i = 0; i < 40; i++) {
            const x = (i * 53 + this.distance * 0.6) % canvas.width;
            const y = this.groundY + 4 + (i % 5) * 6;
            ctx.fillStyle = `rgba(${180 + (i % 40)}, ${120 + (i % 30)}, 0, 0.3)`;
            ctx.fillRect(x, y, 15 + (i % 30), 2);
        }

        // Obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba');
            ctx.fill();
        });
    },

    renderPlains(plains, baseColor, glowColor, opacity) {
        const ctx = this.ctx;
        plains.forEach(plain => {
            ctx.globalAlpha = opacity;
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.moveTo(plain.x, this.groundY);
            ctx.quadraticCurveTo(
                plain.x + plain.width * 0.5,
                this.groundY - plain.height,
                plain.x + plain.width,
                this.groundY
            );
            ctx.fill();

            if (plain.isVolcano) {
                // Distant volcano glow
                const glow = ctx.createRadialGradient(
                    plain.x + plain.width * 0.5,
                    this.groundY - plain.height,
                    0,
                    plain.x + plain.width * 0.5,
                    this.groundY - plain.height,
                    30
                );
                glow.addColorStop(0, 'rgba(255, 100, 0, 0.4)');
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.fillRect(plain.x, this.groundY - plain.height - 30, plain.width, 60);
            }
            ctx.globalAlpha = 1;
        });
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'lava_jet') {
            const x = obs.x + obs.width / 2;
            const topY = obs.y + (obs.height - obs.jetHeight);

            // Glow halo at base
            const baseGlow = ctx.createRadialGradient(x, this.groundY, 0, x, this.groundY, 40);
            baseGlow.addColorStop(0, 'rgba(255, 120, 0, 0.5)');
            baseGlow.addColorStop(0.5, 'rgba(255, 80, 0, 0.2)');
            baseGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = baseGlow;
            ctx.fillRect(x - 40, this.groundY - 40, 80, 60);

            // Jet column
            const jetGrad = ctx.createLinearGradient(x - obs.width / 2, topY, x + obs.width / 2, topY);
            jetGrad.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
            jetGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.9)');
            jetGrad.addColorStop(1, 'rgba(255, 200, 0, 0.3)');
            ctx.fillStyle = jetGrad;
            ctx.fillRect(obs.x, topY, obs.width, obs.jetHeight);

            // Core bright streak
            ctx.fillStyle = 'rgba(255, 240, 180, 0.85)';
            ctx.fillRect(x - 3, topY, 6, obs.jetHeight);

            // Tip glow
            const tipGlow = ctx.createRadialGradient(x, topY, 0, x, topY, 20);
            tipGlow.addColorStop(0, 'rgba(255, 255, 200, 0.7)');
            tipGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = tipGlow;
            ctx.fillRect(x - 20, topY - 20, 40, 40);

        } else if (obs.type === 'lava_flow') {
            // Pit filled with glowing lava
            ctx.fillStyle = '#100800';
            ctx.fillRect(obs.x, obs.y, obs.width, 50);

            const lavaGrad = ctx.createRadialGradient(
                obs.x + obs.width / 2, obs.y + 8, 0,
                obs.x + obs.width / 2, obs.y + 8, obs.width / 2
            );
            lavaGrad.addColorStop(0, 'rgba(255, 180, 0, 0.95)');
            lavaGrad.addColorStop(0.4, 'rgba(255, 80, 0, 0.9)');
            lavaGrad.addColorStop(1, 'rgba(150, 20, 0, 0.8)');
            ctx.fillStyle = lavaGrad;
            ctx.fillRect(obs.x, obs.y, obs.width, 20);

            // Surface shimmer
            ctx.fillStyle = 'rgba(255, 220, 100, 0.4)';
            ctx.fillRect(obs.x + obs.width * 0.15, obs.y + 2, obs.width * 0.35, 4);
            ctx.fillRect(obs.x + obs.width * 0.55, obs.y + 5, obs.width * 0.2, 3);

            // Edge glow
            const edgeGlow = ctx.createLinearGradient(obs.x, obs.y - 10, obs.x, obs.y + 5);
            edgeGlow.addColorStop(0, 'transparent');
            edgeGlow.addColorStop(1, 'rgba(255, 80, 0, 0.3)');
            ctx.fillStyle = edgeGlow;
            ctx.fillRect(obs.x - 10, obs.y - 10, obs.width + 20, 15);
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'lava_flow') {
            return { x: obs.x + 5, y: obs.y, width: obs.width - 10, height: 50, isGap: true };
        }
        if (obs.type === 'lava_jet') {
            const topY = obs.y + (obs.height - obs.jetHeight);
            return { x: obs.x + 3, y: topY, width: obs.width - 6, height: obs.jetHeight };
        }
        return { x: obs.x + 5, y: obs.y, width: obs.width - 10, height: obs.height };
    }
};

window.IoLevel = IoLevel;

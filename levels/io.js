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
        // Dark overlay — heavier at top so player/obstacles are readable
        ctx.fillStyle = 'rgba(10, 5, 0, 0.28)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const ioSkyDark = ctx.createLinearGradient(0, 0, 0, this.groundY);
        ioSkyDark.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        ioSkyDark.addColorStop(0.55, 'rgba(0, 0, 0, 0.18)');
        ioSkyDark.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ioSkyDark;
        ctx.fillRect(0, 0, canvas.width, this.groundY);

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

        // === IO UNIQUE ATMOSPHERE ===

        // Sulfur ash falling from sky — tiny particles drifting down
        for (let i = 0; i < 30; i++) {
            const drift = Math.sin(time * 0.0008 + i * 2.3) * 15;
            const ax = ((i * 137.5 + time * 0.018 * (1 + (i % 3) * 0.4) + drift) % (canvas.width + 40)) - 20;
            const ay = ((i * 89.3 + time * 0.022 * (1.5 + (i % 4) * 0.3)) % (this.groundY - 20));
            const alpha = 0.12 + Math.sin(i * 1.7 + time * 0.001) * 0.06;
            ctx.beginPath();
            ctx.arc(ax, ay, 0.8 + (i % 3) * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${190 + i % 40}, ${100 + i % 30}, ${i % 20}, ${alpha})`;
            ctx.fill();
        }

        // Distant pulsing volcano glows on horizon
        for (let i = 0; i < 5; i++) {
            const vx = canvas.width * (0.08 + i * 0.22);
            const vy = this.groundY + 5;
            const pulse = 0.25 + Math.sin(time * 0.0015 + i * 1.8) * 0.18;
            const vSize = 55 + i * 18;
            const vGlow = ctx.createRadialGradient(vx, vy, 0, vx, vy, vSize);
            vGlow.addColorStop(0, `rgba(255, ${60 + i * 10}, 0, ${pulse})`);
            vGlow.addColorStop(0.5, `rgba(200, 30, 0, ${pulse * 0.35})`);
            vGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = vGlow;
            ctx.fillRect(vx - vSize, vy - vSize * 0.7, vSize * 2, vSize);
        }

        // Sulfur gas wisps near surface — horizontal haze layers
        for (let i = 0; i < 3; i++) {
            const waveY = this.groundY - 18 - i * 12;
            const wOpacity = (0.06 - i * 0.015) * (0.8 + Math.sin(time * 0.0009 + i) * 0.2);
            const wHaze = ctx.createLinearGradient(0, waveY - 6, 0, waveY + 6);
            wHaze.addColorStop(0, 'transparent');
            wHaze.addColorStop(0.5, `rgba(180, 140, 10, ${wOpacity})`);
            wHaze.addColorStop(1, 'transparent');
            ctx.fillStyle = wHaze;
            ctx.fillRect(0, waveY - 6, canvas.width, 12);
        }

        // Heat shimmer lines above ground — short vertical distortion streaks
        ctx.save();
        ctx.globalAlpha = 0.07 + Math.sin(time * 0.003) * 0.03;
        for (let i = 0; i < 12; i++) {
            const hx = (i * 97 + this.distance * 0.5) % canvas.width;
            const hh = 8 + (i % 4) * 5;
            const hGrad = ctx.createLinearGradient(hx, this.groundY - hh, hx, this.groundY);
            hGrad.addColorStop(0, 'transparent');
            hGrad.addColorStop(1, 'rgba(255, 160, 40, 0.4)');
            ctx.fillStyle = hGrad;
            ctx.fillRect(hx - 1, this.groundY - hh, 2, hh);
        }
        ctx.restore();

        // Sulfur plume rising in background — tall column drifting
        for (let pl = 0; pl < 2; pl++) {
            const plX = canvas.width * (0.15 + pl * 0.6);
            const plH = canvas.height * 0.55;
            const sway = Math.sin(time * 0.0004 + pl * 2.1) * 18;
            for (let seg = 0; seg < 8; seg++) {
                const sy = this.groundY - seg * (plH / 8);
                const sw = (8 - seg) * 7 + 10;
                const sa = (0.06 - seg * 0.006) * (0.7 + Math.sin(time * 0.0007 + pl + seg) * 0.3);
                if (sa <= 0) break;
                const plumeGrad = ctx.createRadialGradient(plX + sway * (seg / 8), sy, 0, plX + sway * (seg / 8), sy, sw);
                plumeGrad.addColorStop(0, `rgba(220, 190, 80, ${sa})`);
                plumeGrad.addColorStop(0.6, `rgba(190, 140, 40, ${sa * 0.5})`);
                plumeGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = plumeGrad;
                ctx.fillRect(plX + sway * (seg / 8) - sw, sy - sw * 0.5, sw * 2, sw);
            }
        }

        // Ground lava rivulets — bright glowing threads on the surface
        for (let rv = 0; rv < 4; rv++) {
            const rx = (rv * 183 + this.distance * 0.55) % canvas.width;
            const rvAlpha = 0.25 + Math.sin(time * 0.002 + rv * 1.5) * 0.12;
            ctx.strokeStyle = `rgba(255, ${120 + rv * 15}, 0, ${rvAlpha})`;
            ctx.lineWidth = 1 + (rv % 2) * 0.5;
            ctx.beginPath();
            ctx.moveTo(rx, this.groundY + 6 + rv * 3);
            ctx.bezierCurveTo(rx - 20, this.groundY + 10 + rv * 3, rx + 30, this.groundY + 12 + rv * 3, rx + 50, this.groundY + 8 + rv * 3);
            ctx.stroke();
        }

        // Atmospheric SO2 tint — faint orange gradient across whole sky
        const atmoGrad = ctx.createLinearGradient(0, 0, 0, this.groundY * 0.7);
        atmoGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        atmoGrad.addColorStop(1, `rgba(80, 30, 0, ${0.06 + Math.sin(time * 0.0005) * 0.02})`);
        ctx.fillStyle = atmoGrad;
        ctx.fillRect(0, 0, canvas.width, this.groundY * 0.7);
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
        const t = Date.now();

        if (obs.type === 'lava_jet') {
            const x = obs.x + obs.width / 2;
            const topY = obs.y + (obs.height - obs.jetHeight);
            const halfW = obs.width / 2;

            // Ground vent caldera — dark oval crater mouth
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(x, this.groundY + 4, halfW + 6, 7, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0400';
            ctx.fill();
            ctx.strokeStyle = 'rgba(180, 60, 0, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // Wide ground glow radiating from vent
            const baseGlow = ctx.createRadialGradient(x, this.groundY, 0, x, this.groundY, 70);
            baseGlow.addColorStop(0, 'rgba(255, 140, 0, 0.55)');
            baseGlow.addColorStop(0.4, 'rgba(255, 60, 0, 0.22)');
            baseGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = baseGlow;
            ctx.fillRect(x - 70, this.groundY - 55, 140, 75);

            // Outer diffuse column
            const outerGrad = ctx.createLinearGradient(x - halfW * 2.5, 0, x + halfW * 2.5, 0);
            outerGrad.addColorStop(0, 'transparent');
            outerGrad.addColorStop(0.4, `rgba(255, 80, 0, ${0.12 + Math.sin(obs.phase) * 0.06})`);
            outerGrad.addColorStop(0.6, `rgba(255, 80, 0, ${0.12 + Math.sin(obs.phase) * 0.06})`);
            outerGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = outerGrad;
            ctx.fillRect(x - halfW * 2.5, topY + obs.jetHeight * 0.3, halfW * 5, obs.jetHeight * 0.7);

            // Main jet column — tapered path (wide at base, narrow at tip)
            ctx.beginPath();
            ctx.moveTo(x - halfW, this.groundY);
            ctx.quadraticCurveTo(x - halfW * 1.1, topY + obs.jetHeight * 0.5, x - halfW * 0.45, topY);
            ctx.lineTo(x + halfW * 0.45, topY);
            ctx.quadraticCurveTo(x + halfW * 1.1, topY + obs.jetHeight * 0.5, x + halfW, this.groundY);
            ctx.closePath();
            const jetGrad = ctx.createLinearGradient(0, this.groundY, 0, topY);
            jetGrad.addColorStop(0, 'rgba(255, 200, 20, 0.95)');
            jetGrad.addColorStop(0.35, 'rgba(255, 100, 0, 0.88)');
            jetGrad.addColorStop(0.75, 'rgba(220, 40, 0, 0.7)');
            jetGrad.addColorStop(1, 'rgba(180, 20, 0, 0.4)');
            ctx.fillStyle = jetGrad;
            ctx.fill();

            // Hot bright core streak
            const coreGrad = ctx.createLinearGradient(0, this.groundY, 0, topY);
            coreGrad.addColorStop(0, 'rgba(255, 255, 220, 0.95)');
            coreGrad.addColorStop(0.5, 'rgba(255, 220, 100, 0.7)');
            coreGrad.addColorStop(1, 'rgba(255, 180, 50, 0.2)');
            ctx.fillStyle = coreGrad;
            ctx.fillRect(x - 2, topY, 4, obs.jetHeight);

            // Flame tongue fringe — wiggly edges
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(obs.phase * 2) * 0.15;
            for (let f = 0; f < 5; f++) {
                const fy = topY + obs.jetHeight * (0.1 + f * 0.18);
                const fw = (halfW + 4) * (1 - f * 0.1) * (0.8 + Math.sin(obs.phase + f) * 0.2);
                ctx.fillStyle = `rgba(255, ${120 + f * 15}, 0, ${0.18 - f * 0.02})`;
                ctx.beginPath();
                ctx.ellipse(x, fy, fw, 3 + f, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // Tip explosion burst
            const tipGlow = ctx.createRadialGradient(x, topY, 0, x, topY, 28);
            tipGlow.addColorStop(0, `rgba(255, 255, 200, ${0.75 + Math.sin(obs.phase * 3) * 0.2})`);
            tipGlow.addColorStop(0.4, `rgba(255, 160, 30, 0.4)`);
            tipGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = tipGlow;
            ctx.fillRect(x - 30, topY - 28, 60, 56);

            // Ember sparks spraying from tip
            for (let e = 0; e < 6; e++) {
                const ex = x + Math.sin(obs.phase * 2 + e * 1.1) * (8 + e * 3);
                const ey = topY - 5 - e * 4 + Math.cos(t * 0.004 + e) * 4;
                ctx.beginPath();
                ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, ${180 + e * 10}, 0, ${0.6 - e * 0.08})`;
                ctx.fill();
            }

        } else if (obs.type === 'lava_flow') {
            const lTime = t * 0.001;
            // Fissure walls — dark rocky sides
            ctx.fillStyle = '#0c0602';
            ctx.beginPath();
            ctx.moveTo(obs.x - 4, obs.y);
            ctx.lineTo(obs.x, obs.y - 6);
            ctx.lineTo(obs.x, obs.y + 55);
            ctx.lineTo(obs.x - 4, obs.y + 55);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width + 4, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y - 6);
            ctx.lineTo(obs.x + obs.width, obs.y + 55);
            ctx.lineTo(obs.x + obs.width + 4, obs.y + 55);
            ctx.closePath();
            ctx.fill();

            // Deep pit
            ctx.fillStyle = '#060300';
            ctx.fillRect(obs.x, obs.y, obs.width, 55);

            // Molten lava surface — radial hot centre
            const lavaGrad = ctx.createRadialGradient(
                obs.x + obs.width * 0.5, obs.y + 6, 2,
                obs.x + obs.width * 0.5, obs.y + 10, obs.width * 0.65
            );
            lavaGrad.addColorStop(0, 'rgba(255, 220, 60, 0.98)');
            lavaGrad.addColorStop(0.25, 'rgba(255, 120, 0, 0.95)');
            lavaGrad.addColorStop(0.65, 'rgba(200, 40, 0, 0.9)');
            lavaGrad.addColorStop(1, 'rgba(80, 10, 0, 0.85)');
            ctx.fillStyle = lavaGrad;
            ctx.fillRect(obs.x, obs.y, obs.width, 22);

            // Cooling crust plates drifting across surface
            ctx.save();
            ctx.beginPath();
            ctx.rect(obs.x, obs.y, obs.width, 22);
            ctx.clip();
            for (let c = 0; c < 4; c++) {
                const cx = obs.x + ((obs.width * 0.18 * c + lTime * 12 * (c % 2 === 0 ? 1 : -0.7)) % (obs.width + 20)) - 5;
                const cw = obs.width * 0.14 + c * 4;
                ctx.fillStyle = `rgba(30, 15, 5, ${0.55 + c * 0.05})`;
                ctx.beginPath();
                ctx.moveTo(cx, obs.y + 3);
                ctx.lineTo(cx + cw, obs.y + 4);
                ctx.lineTo(cx + cw - 3, obs.y + 12);
                ctx.lineTo(cx + 2, obs.y + 11);
                ctx.closePath();
                ctx.fill();
                // Bright crack edge around crust
                ctx.strokeStyle = `rgba(255, 160, 30, 0.5)`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
            ctx.restore();

            // Bright lava shimmer moving highlight
            const shimX = obs.x + obs.width * (0.3 + Math.sin(lTime * 1.2) * 0.2);
            ctx.fillStyle = 'rgba(255, 230, 100, 0.45)';
            ctx.fillRect(shimX, obs.y + 1, obs.width * 0.22, 4);

            // Rim glow above surface — heat rising
            const rimGlow = ctx.createLinearGradient(obs.x, obs.y - 18, obs.x, obs.y + 5);
            rimGlow.addColorStop(0, 'transparent');
            rimGlow.addColorStop(0.6, `rgba(255, 80, 0, ${0.18 + Math.sin(lTime * 0.8) * 0.05})`);
            rimGlow.addColorStop(1, 'rgba(255, 100, 0, 0.08)');
            ctx.fillStyle = rimGlow;
            ctx.fillRect(obs.x - 8, obs.y - 18, obs.width + 16, 23);

            // Rim highlight — lava edge
            ctx.strokeStyle = `rgba(255, ${160 + Math.sin(lTime * 2) * 40}, 0, 0.85)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.stroke();

            // Steam wisps rising from edges
            for (let s = 0; s < 3; s++) {
                const sx = obs.x + (s === 0 ? 6 : s === 1 ? obs.width * 0.5 : obs.width - 6);
                const sRise = ((lTime * 18 * (1 + s * 0.3)) % 30);
                ctx.strokeStyle = `rgba(200, 160, 120, ${0.12 - sRise * 0.003})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sx, obs.y - sRise * 0.4);
                ctx.bezierCurveTo(sx + 4, obs.y - sRise * 0.7, sx - 3, obs.y - sRise, sx + 2, obs.y - sRise * 1.3);
                ctx.stroke();
            }
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

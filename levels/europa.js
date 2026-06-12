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
        const time = Date.now();

        // Real NASA Europa surface image as background
        if (!GameImages.drawCover(ctx, 'europaSurface', 0, 0, canvas.width, canvas.height)) {
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#020408');
            skyGradient.addColorStop(0.5, '#060c14');
            skyGradient.addColorStop(1, '#0a1420');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Dark overlay — heavier at top so player/obstacles are readable
        ctx.fillStyle = 'rgba(0, 5, 15, 0.22)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const eurSkyDark = ctx.createLinearGradient(0, 0, 0, this.groundY);
        eurSkyDark.addColorStop(0, 'rgba(0, 5, 20, 0.52)');
        eurSkyDark.addColorStop(0.6, 'rgba(0, 5, 15, 0.15)');
        eurSkyDark.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = eurSkyDark;
        ctx.fillRect(0, 0, canvas.width, this.groundY);

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

        // === EUROPA UNIQUE ATMOSPHERE ===

        // Subsurface ocean blue glow bleeding through ice cracks
        const crackGlow = ctx.createLinearGradient(0, this.groundY - 2, 0, this.groundY + 25);
        crackGlow.addColorStop(0, `rgba(0, 100, 200, ${0.22 + Math.sin(time * 0.001) * 0.04})`);
        crackGlow.addColorStop(0.5, 'rgba(0, 60, 140, 0.12)');
        crackGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = crackGlow;
        ctx.fillRect(0, this.groundY - 2, canvas.width, 27);

        // Ice crystal micro-sparkles on surface
        for (let i = 0; i < 60; i++) {
            const sx = (i * 83.7 + this.distance * 0.9) % canvas.width;
            const sy = this.groundY + 4 + (i % 7) * 9;
            const sparkle = Math.sin(time * 0.012 + i * 0.8);
            if (sparkle > 0.55) {
                const sAlpha = (sparkle - 0.55) * 2.2;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(210, 235, 255, ${sAlpha * 0.9})`;
                ctx.fill();
                // 4-point star burst
                ctx.strokeStyle = `rgba(180, 220, 255, ${sAlpha * 0.4})`;
                ctx.lineWidth = 0.6;
                for (let r = 0; r < 4; r++) {
                    const a = r * Math.PI / 2;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(sx + Math.cos(a) * 5, sy + Math.sin(a) * 5);
                    ctx.stroke();
                }
            }
        }

        // Drifting ice crystal particles from sky
        for (let i = 0; i < 18; i++) {
            const cx = ((i * 179.3 + time * 0.014 * (1 + (i % 3) * 0.5)) % (canvas.width + 20)) - 10;
            const cy = ((i * 97.1 + time * 0.019 * (1 + (i % 4) * 0.25)) % (this.groundY * 0.85));
            const cAlpha = 0.1 + (i % 5) * 0.03;
            ctx.beginPath();
            ctx.arc(cx, cy, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 225, 255, ${cAlpha})`;
            ctx.fill();
        }

        // Jupiter light caustic shimmer on ice surface
        const causticTime = time * 0.0006;
        for (let i = 0; i < 8; i++) {
            const cx = canvas.width * (0.05 + (i * 0.13 + Math.sin(causticTime + i) * 0.06));
            const cOpacity = 0.04 + Math.sin(causticTime * 1.3 + i * 1.1) * 0.025;
            const cGlow = ctx.createRadialGradient(cx, this.groundY, 0, cx, this.groundY, 30 + i * 8);
            cGlow.addColorStop(0, `rgba(180, 200, 240, ${cOpacity})`);
            cGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = cGlow;
            ctx.fillRect(cx - 50, this.groundY - 10, 100, 20);
        }

        // Thin aurora ribbon in upper sky (Jupiter's magnetosphere)
        const auroraY = canvas.height * 0.12;
        const auroraAlpha = 0.06 + Math.sin(time * 0.0007) * 0.03;
        for (let i = 0; i < canvas.width; i += 4) {
            const wave = Math.sin(i * 0.01 + time * 0.001) * 12;
            const aGrad = ctx.createLinearGradient(i, auroraY + wave - 8, i, auroraY + wave + 8);
            aGrad.addColorStop(0, 'transparent');
            aGrad.addColorStop(0.5, `rgba(100, 180, 255, ${auroraAlpha})`);
            aGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = aGrad;
            ctx.fillRect(i, auroraY + wave - 8, 3, 16);
        }

        // Second aurora band — slightly different frequency, greenish tint
        const aurora2Y = canvas.height * 0.08;
        const aurora2A = 0.035 + Math.sin(time * 0.0009 + 1.8) * 0.018;
        for (let i = 0; i < canvas.width; i += 5) {
            const wave2 = Math.sin(i * 0.007 + time * 0.00075) * 9;
            const a2Grad = ctx.createLinearGradient(i, aurora2Y + wave2 - 6, i, aurora2Y + wave2 + 6);
            a2Grad.addColorStop(0, 'transparent');
            a2Grad.addColorStop(0.5, `rgba(80, 220, 200, ${aurora2A})`);
            a2Grad.addColorStop(1, 'transparent');
            ctx.fillStyle = a2Grad;
            ctx.fillRect(i, aurora2Y + wave2 - 6, 4, 12);
        }

        // Ice plate background geometry — faint distant ridge network
        for (let ip = 0; ip < 6; ip++) {
            const ipX = (ip * 157 + this.distance * 0.12) % (canvas.width + 80) - 40;
            const ipY = this.groundY - 25 - (ip % 3) * 18;
            const ipA = 0.05 + (ip % 4) * 0.018;
            ctx.strokeStyle = `rgba(160, 190, 220, ${ipA})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(ipX, ipY + 20);
            ctx.lineTo(ipX + 12, ipY);
            ctx.lineTo(ipX + 28, ipY + 8);
            ctx.lineTo(ipX + 40, ipY + 3);
            ctx.stroke();
        }

        // Tidal flexing ground shudder glow — very subtle pulse at horizon
        const tidePulse = 0.04 + Math.sin(time * 0.00035) * 0.025;
        const tideGrad = ctx.createLinearGradient(0, this.groundY - 30, 0, this.groundY + 10);
        tideGrad.addColorStop(0, 'transparent');
        tideGrad.addColorStop(0.6, `rgba(0, 80, 160, ${tidePulse})`);
        tideGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = tideGrad;
        ctx.fillRect(0, this.groundY - 30, canvas.width, 40);
    },

    renderObstacle(obs) {
        const ctx = this.ctx;
        const t = Date.now();

        if (obs.type === 'ice_ridge') {
            // Ridge silhouette with multiple facets
            const pts = [
                [obs.x, obs.y + obs.height],
                [obs.x + obs.width * 0.12, obs.y + obs.height * 0.55],
                [obs.x + obs.width * 0.28, obs.y + obs.height * 0.15],
                [obs.x + obs.width * 0.42, obs.y],
                [obs.x + obs.width * 0.55, obs.y + obs.height * 0.08],
                [obs.x + obs.width * 0.7, obs.y - obs.height * 0.06],
                [obs.x + obs.width * 0.82, obs.y + obs.height * 0.12],
                [obs.x + obs.width, obs.y + obs.height],
            ];

            // Shadow/base fill
            const baseGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
            baseGrad.addColorStop(0, '#b8d8f0');
            baseGrad.addColorStop(0.3, '#98c4e8');
            baseGrad.addColorStop(0.65, '#70a8d0');
            baseGrad.addColorStop(1, '#4880b0');
            ctx.fillStyle = baseGrad;
            ctx.beginPath();
            pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            ctx.fill();

            // Facet shading — left dark, right lit
            ctx.fillStyle = 'rgba(20, 40, 80, 0.25)';
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            ctx.lineTo(pts[2][0], pts[2][1]);
            ctx.lineTo(pts[3][0], pts[3][1]);
            ctx.lineTo(pts[0][0], pts[0][1]);
            ctx.fill();

            // Subsurface blue glow — Jupiter light refracting through ice
            const iceGlow = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width * 0.5, obs.y + obs.height);
            iceGlow.addColorStop(0, 'rgba(100, 180, 255, 0.18)');
            iceGlow.addColorStop(1, 'rgba(40, 100, 200, 0.06)');
            ctx.fillStyle = iceGlow;
            ctx.beginPath();
            pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            ctx.fill();

            // Sharp bright highlight on windward faces
            ctx.strokeStyle = 'rgba(240, 252, 255, 0.85)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            ctx.lineTo(pts[2][0], pts[2][1]);
            ctx.lineTo(pts[3][0], pts[3][1]);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(200, 235, 255, 0.55)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[4][0], pts[4][1]);
            ctx.lineTo(pts[5][0], pts[5][1]);
            ctx.lineTo(pts[6][0], pts[6][1]);
            ctx.stroke();

            // Brown tholins crack line (Europa's characteristic markings)
            ctx.strokeStyle = 'rgba(110, 65, 35, 0.7)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(pts[3][0], pts[3][1]);
            ctx.bezierCurveTo(
                pts[3][0] + obs.width * 0.08, pts[3][1] + obs.height * 0.25,
                pts[3][0] + obs.width * 0.12, pts[3][1] + obs.height * 0.55,
                obs.x + obs.width * 0.5, obs.y + obs.height
            );
            ctx.stroke();

            // Frost glint sparkle at tip
            const tipX = pts[5][0], tipY = pts[5][1];
            const sparkA = 0.3 + Math.sin(t * 0.005 + obs.x * 0.01) * 0.25;
            const spk = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10);
            spk.addColorStop(0, `rgba(255, 255, 255, ${sparkA})`);
            spk.addColorStop(1, 'transparent');
            ctx.fillStyle = spk;
            ctx.fillRect(tipX - 10, tipY - 10, 20, 20);

        } else if (obs.type === 'crack_gap') {
            const lTime = t * 0.001;

            // Ice wall sides — visible fissure depth
            const leftWall = ctx.createLinearGradient(obs.x, 0, obs.x + 10, 0);
            leftWall.addColorStop(0, '#cce4f5');
            leftWall.addColorStop(1, '#6090b8');
            ctx.fillStyle = leftWall;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x - 5, obs.y + 10);
            ctx.lineTo(obs.x - 5, obs.y + 50);
            ctx.lineTo(obs.x, obs.y + 50);
            ctx.closePath();
            ctx.fill();
            const rightWall = ctx.createLinearGradient(obs.x + obs.width - 10, 0, obs.x + obs.width, 0);
            rightWall.addColorStop(0, '#6090b8');
            rightWall.addColorStop(1, '#cce4f5');
            ctx.fillStyle = rightWall;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width, obs.y);
            ctx.lineTo(obs.x + obs.width + 5, obs.y + 10);
            ctx.lineTo(obs.x + obs.width + 5, obs.y + 50);
            ctx.lineTo(obs.x + obs.width, obs.y + 50);
            ctx.closePath();
            ctx.fill();

            // Deep void
            ctx.fillStyle = '#020408';
            ctx.fillRect(obs.x, obs.y, obs.width, 55);

            // Subsurface ocean — layered deep blue
            const oceanGrad = ctx.createLinearGradient(obs.x, obs.y + 5, obs.x, obs.y + 40);
            oceanGrad.addColorStop(0, 'rgba(0, 60, 130, 0.9)');
            oceanGrad.addColorStop(0.4, 'rgba(0, 90, 170, 0.85)');
            oceanGrad.addColorStop(1, 'rgba(0, 40, 100, 0.95)');
            ctx.fillStyle = oceanGrad;
            ctx.fillRect(obs.x, obs.y + 8, obs.width, 32);

            // Animated water shimmer
            for (let w = 0; w < 3; w++) {
                const wx = obs.x + obs.width * (0.1 + w * 0.3 + Math.sin(lTime * 1.1 + w) * 0.07);
                const ww = obs.width * 0.15;
                ctx.fillStyle = `rgba(120, 200, 255, ${0.18 + Math.sin(lTime * 1.8 + w * 1.4) * 0.08})`;
                ctx.fillRect(wx, obs.y + 14, ww, 2);
            }

            // Frost crystals on rim
            ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
            ctx.lineWidth = 1;
            for (let f = 0; f < 5; f++) {
                const fx = obs.x + obs.width * (0.1 + f * 0.2);
                ctx.beginPath();
                ctx.moveTo(fx - 3, obs.y - 2);
                ctx.lineTo(fx, obs.y - 7);
                ctx.lineTo(fx + 3, obs.y - 2);
                ctx.stroke();
            }

            // Brown tholins at the crack edge
            ctx.strokeStyle = 'rgba(130, 85, 45, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.stroke();

            // Ice shelf highlight
            ctx.strokeStyle = 'rgba(230, 248, 255, 0.55)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + 1, obs.y - 1);
            ctx.lineTo(obs.x + obs.width - 1, obs.y - 1);
            ctx.stroke();

            // Steam rising from warm ocean below
            for (let s = 0; s < 4; s++) {
                const sx = obs.x + obs.width * (0.15 + s * 0.24);
                const rise = ((lTime * 15 + s * 7) % 28);
                ctx.strokeStyle = `rgba(180, 220, 255, ${0.15 - rise * 0.004})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(sx, obs.y - rise * 0.3);
                ctx.bezierCurveTo(sx + 3, obs.y - rise * 0.6, sx - 2, obs.y - rise * 0.9, sx + 1, obs.y - rise * 1.2);
                ctx.stroke();
            }

        } else if (obs.type === 'ice_shard') {
            ctx.save();
            ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
            ctx.rotate(obs.rotation);

            const hw = obs.width / 2;
            const hh = obs.height / 2;

            // Outer glow — ice catching light
            const shardGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, hw * 1.8);
            shardGlow.addColorStop(0, 'rgba(180, 220, 255, 0.2)');
            shardGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = shardGlow;
            ctx.fillRect(-hw * 1.8, -hh * 1.8, hw * 3.6, hh * 3.6);

            // Main crystal shard — elongated hexagonal
            const pts2 = [
                [0, -hh],
                [hw * 0.55, -hh * 0.3],
                [hw * 0.4, hh * 0.7],
                [hw * 0.1, hh],
                [-hw * 0.4, hh * 0.6],
                [-hw * 0.5, -hh * 0.25],
            ];
            ctx.beginPath();
            pts2.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
            const crystalGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
            crystalGrad.addColorStop(0, 'rgba(230, 248, 255, 0.95)');
            crystalGrad.addColorStop(0.3, 'rgba(185, 225, 250, 0.88)');
            crystalGrad.addColorStop(0.7, 'rgba(130, 185, 230, 0.82)');
            crystalGrad.addColorStop(1, 'rgba(80, 140, 200, 0.75)');
            ctx.fillStyle = crystalGrad;
            ctx.fill();

            // Internal refraction plane
            ctx.fillStyle = 'rgba(100, 180, 255, 0.18)';
            ctx.beginPath();
            ctx.moveTo(0, -hh);
            ctx.lineTo(hw * 0.55, -hh * 0.3);
            ctx.lineTo(hw * 0.1, hh * 0.1);
            ctx.closePath();
            ctx.fill();

            // Bright specular highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.beginPath();
            ctx.moveTo(-hw * 0.05, -hh * 0.95);
            ctx.lineTo(hw * 0.15, -hh * 0.5);
            ctx.lineTo(-hw * 0.12, -hh * 0.45);
            ctx.closePath();
            ctx.fill();

            // Edge outline
            ctx.strokeStyle = 'rgba(200, 235, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            pts2.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
            ctx.closePath();
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

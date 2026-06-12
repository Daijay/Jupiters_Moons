// ============================================
// HYPERION - The Chaotic Moon
// Spongy terrain, unpredictable bouncing, static discharge
// Level 10 - HARDEST
// ============================================

const HyperionLevel = {
    id: 'hyperion',
    name: 'Hyperion',
    designation: 'Saturn VII',
    distanceFromSaturn: '1,481,100 km',
    surfaceTemp: '-180°C (-292°F)',
    facts: [
        'Hyperion has completely chaotic, unpredictable rotation ... it tumbles through space with no fixed axis.',
        'The moon is the only object besides Earth\'s Moon confirmed to have a charged surface from static electricity.',
        'Its sponge-like appearance comes from deep, steep-walled craters that appear to have no floors.',
        'Hyperion\'s extremely low density suggests it is 40% empty space ... more porous than a sponge.'
    ],
    hazardWarning: 'EXTREME HAZARD: Hyperion\'s porous surface creates unpredictable bounce physics on every landing. Static discharge arcs randomly. Maintain maximum concentration.',
    missionControlMessage: `Cassini, this is your final survey before the mission concludes.

Hyperion. The chaos moon.

Nothing about this object makes sense. It tumbles through space with no predictable rotation. No stable axis. Completely random.

And the surface ... it's like a sponge. Craters so deep they seem bottomless. And something else: static electricity. The whole moon is charged.

Your landing physics will be... unpredictable. Every bounce is different.

This is the hardest one, Cassini. Complete this survey and we'll have done what we came to do.

Mission Control out.`,

    baseSpeed: 8.5,
    speedIncrement: 0.0015,
    maxSpeed: 15,
    gravity: 0.6,
    jumpForce: -14,

    colors: {
        sky: ['#0a0808', '#151210', '#201815'],
        ground: '#7a6855',
        groundAccent: '#5a4840',
        sponge: '#8b7355',
        static: '#00ffff'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.staticArcs = [];
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 100;
        this.chaosRotation = 0;
        this.backgroundCraters = this.generateBackgroundCraters();
        this.bounceZones = [];
    },

    generateBackgroundCraters() {
        const craters = [];
        for (let i = 0; i < 15; i++) {
            craters.push({
                x: Math.random() * this.canvas.width * 2,
                y: this.canvas.height * (0.25 + Math.random() * 0.35),
                width: 40 + Math.random() * 80,
                depth: 30 + Math.random() * 60,
                layer: Math.floor(Math.random() * 3)
            });
        }
        return craters;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Chaotic rotation effect
        this.chaosRotation += (Math.random() - 0.5) * 0.02;

        // Update background craters
        this.backgroundCraters.forEach(c => {
            c.x -= this.speed * (0.2 + c.layer * 0.15);
            if (c.x < -c.width) {
                c.x = this.canvas.width + Math.random() * 300;
                c.y = this.canvas.height * (0.25 + Math.random() * 0.35);
            }
        });

        // Spawn obstacles
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 80 + Math.random() * 60;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            return obs.x > -obs.width;
        });

        // Random static discharge
        if (Math.random() > 0.97) {
            this.createStaticArc();
        }

        // Update static arcs
        this.staticArcs = this.staticArcs.filter(arc => {
            arc.life -= 0.05;
            return arc.life > 0;
        });

        // Update bounce zones (they move with ground)
        this.bounceZones = this.bounceZones.filter(zone => {
            zone.x -= this.speed;
            return zone.x > -zone.width;
        });

        return this.obstacles;
    },

    spawnObstacle() {
        const types = ['sponge_pillar', 'deep_crater', 'static_zone'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'sponge_pillar') {
            this.obstacles.push({
                type: 'sponge_pillar',
                x: this.canvas.width + 50,
                y: this.groundY - 60 - Math.random() * 50,
                width: 40 + Math.random() * 30,
                height: 60 + Math.random() * 50,
                dangerous: true,
                holes: this.generateSpongeHoles()
            });
        } else if (type === 'deep_crater') {
            const width = 70 + Math.random() * 50;
            this.obstacles.push({
                type: 'deep_crater',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: width,
                height: 200,
                dangerous: true
            });
        } else {
            // Static zone - visual hazard
            this.obstacles.push({
                type: 'static_zone',
                x: this.canvas.width + 50,
                y: this.groundY - 100 - Math.random() * 80,
                width: 60 + Math.random() * 40,
                height: 100 + Math.random() * 80,
                dangerous: true,
                charge: Math.random() * Math.PI * 2
            });
        }

        // Add bounce zone occasionally
        if (Math.random() > 0.7) {
            this.bounceZones.push({
                x: this.canvas.width + 100 + Math.random() * 200,
                y: this.groundY,
                width: 80 + Math.random() * 60,
                bounceFactor: 0.3 + Math.random() * 0.5
            });
        }
    },

    generateSpongeHoles() {
        const holes = [];
        for (let i = 0; i < 6; i++) {
            holes.push({
                x: Math.random(),
                y: Math.random(),
                size: 0.1 + Math.random() * 0.2
            });
        }
        return holes;
    },

    createStaticArc() {
        const startX = Math.random() * this.canvas.width;
        const startY = Math.random() * this.groundY;

        this.staticArcs.push({
            startX: startX,
            startY: startY,
            endX: startX + (Math.random() - 0.5) * 200,
            endY: startY + (Math.random() - 0.5) * 200,
            life: 1,
            segments: this.generateArcSegments(startX, startY)
        });
    },

    generateArcSegments(startX, startY) {
        const segments = [];
        let x = startX;
        let y = startY;

        for (let i = 0; i < 5; i++) {
            const newX = x + (Math.random() - 0.5) * 80;
            const newY = y + (Math.random() - 0.5) * 80;
            segments.push({ x1: x, y1: y, x2: newX, y2: newY });
            x = newX;
            y = newY;
        }

        return segments;
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Space background with slight rotation effect
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.sin(this.chaosRotation) * 0.02);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, this.colors.sky[0]);
        skyGradient.addColorStop(0.5, this.colors.sky[1]);
        skyGradient.addColorStop(1, this.colors.sky[2]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100);

        ctx.restore();

        // Stars (slightly offset for chaos effect)
        for (let i = 0; i < 80; i++) {
            const offset = Math.sin(this.chaosRotation + i * 0.1) * 3;
            const x = (i * 37 + this.distance * 0.02 + offset) % canvas.width;
            const y = (i * 19) % (canvas.height * 0.5);
            ctx.beginPath();
            ctx.arc(x, y, (i % 2) * 0.3 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        // Background deep craters (sponge appearance)
        this.backgroundCraters
            .sort((a, b) => a.layer - b.layer)
            .forEach(c => this.renderBackgroundCrater(c));

        // Static arcs
        this.staticArcs.forEach(arc => this.renderStaticArc(arc));

        // Ground (porous, spongy)
        this.renderSpongyGround();

        // Bounce zones (subtle indicators)
        this.bounceZones.forEach(zone => {
            ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
            ctx.fillRect(zone.x, zone.y - 5, zone.width, 10);
        });

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Chaos overlay effect
        if (Math.random() > 0.95) {
            ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },

    renderBackgroundCrater(c) {
        const ctx = this.ctx;
        const opacity = 0.3 + c.layer * 0.15;

        // Deep bottomless crater
        const gradient = ctx.createRadialGradient(
            c.x + c.width / 2, c.y, 0,
            c.x + c.width / 2, c.y, c.width / 2
        );
        gradient.addColorStop(0, `rgba(10, 5, 5, ${opacity})`);
        gradient.addColorStop(0.7, `rgba(60, 50, 45, ${opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(100, 85, 70, ${opacity * 0.5})`);

        ctx.beginPath();
        ctx.ellipse(c.x + c.width / 2, c.y, c.width / 2, c.depth / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    },

    renderSpongyGround() {
        const ctx = this.ctx;

        // Main ground
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

        // Porous texture (holes)
        for (let i = 0; i < 50; i++) {
            const x = (i * 37 + this.distance * 0.8) % this.canvas.width;
            const y = this.groundY + 10 + (i % 8) * 6;
            const size = 3 + (i % 5) * 2;

            const holeGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            holeGradient.addColorStop(0, '#201510');
            holeGradient.addColorStop(1, this.colors.groundAccent);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = holeGradient;
            ctx.fill();
        }

        // Surface texture
        ctx.strokeStyle = this.colors.groundAccent;
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const x = (i * 67 + this.distance * 0.9) % this.canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, this.groundY);
            ctx.lineTo(x + 20, this.groundY + 5);
            ctx.stroke();
        }
    },

    renderStaticArc(arc) {
        const ctx = this.ctx;

        ctx.strokeStyle = `rgba(0, 255, 255, ${arc.life})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;

        arc.segments.forEach(seg => {
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
        });

        ctx.shadowBlur = 0;

        // Branch arcs
        ctx.strokeStyle = `rgba(0, 255, 255, ${arc.life * 0.5})`;
        ctx.lineWidth = 1;
        arc.segments.forEach((seg, i) => {
            if (i % 2 === 0) {
                ctx.beginPath();
                ctx.moveTo(seg.x2, seg.y2);
                ctx.lineTo(seg.x2 + (Math.random() - 0.5) * 40, seg.y2 + (Math.random() - 0.5) * 40);
                ctx.stroke();
            }
        });
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'sponge_pillar') {
            // Porous sponge-like pillar
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            gradient.addColorStop(0, '#5a4840');
            gradient.addColorStop(0.5, '#7a6855');
            gradient.addColorStop(1, '#8b7355');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + 5, obs.y + obs.height * 0.2);
            ctx.lineTo(obs.x + obs.width * 0.3, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.7, obs.y + 5);
            ctx.lineTo(obs.x + obs.width - 5, obs.y + obs.height * 0.15);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            // Holes in the sponge
            obs.holes.forEach(hole => {
                const hx = obs.x + hole.x * obs.width;
                const hy = obs.y + hole.y * obs.height;
                const size = hole.size * obs.width * 0.3;

                const holeGradient = ctx.createRadialGradient(hx, hy, 0, hx, hy, size);
                holeGradient.addColorStop(0, '#151010');
                holeGradient.addColorStop(1, '#3a3030');

                ctx.beginPath();
                ctx.arc(hx, hy, size, 0, Math.PI * 2);
                ctx.fillStyle = holeGradient;
                ctx.fill();
            });

        } else if (obs.type === 'deep_crater') {
            // Bottomless crater gap
            const gradient = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
            gradient.addColorStop(0, '#100805');
            gradient.addColorStop(0.5, '#080505');
            gradient.addColorStop(1, '#000000');

            ctx.fillStyle = gradient;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Crater rim
            ctx.fillStyle = '#6a5850';
            ctx.beginPath();
            ctx.moveTo(obs.x - 10, obs.y);
            ctx.lineTo(obs.x + 5, obs.y + 25);
            ctx.lineTo(obs.x, obs.y);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width + 10, obs.y);
            ctx.lineTo(obs.x + obs.width - 5, obs.y + 25);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.fill();

        } else if (obs.type === 'static_zone') {
            // Electrically charged zone
            obs.charge += 0.1;

            // Zone boundary
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(obs.charge) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
            ctx.setLineDash([]);

            // Interior static
            ctx.fillStyle = `rgba(0, 255, 255, ${0.1 + Math.sin(obs.charge * 2) * 0.05})`;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Random sparks inside
            for (let i = 0; i < 3; i++) {
                if (Math.random() > 0.7) {
                    const sx = obs.x + Math.random() * obs.width;
                    const sy = obs.y + Math.random() * obs.height;

                    ctx.beginPath();
                    ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#00ffff';
                    ctx.fill();

                    // Spark line
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 20);
                    ctx.stroke();
                }
            }
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'deep_crater') {
            return {
                x: obs.x,
                y: obs.y,
                width: obs.width,
                height: obs.height,
                isGap: true
            };
        }
        return {
            x: obs.x + 5,
            y: obs.y,
            width: obs.width - 10,
            height: obs.height
        };
    },

    getBounceZoneAt(x) {
        for (const zone of this.bounceZones) {
            if (x >= zone.x && x <= zone.x + zone.width) {
                return zone;
            }
        }
        return null;
    }
};

window.HyperionLevel = HyperionLevel;

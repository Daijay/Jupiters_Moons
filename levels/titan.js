// ============================================
// TITAN - Saturn's Largest Moon
// Orange hazy atmosphere, hydrocarbon dunes
// Level 1 - Easiest
// ============================================

const TitanLevel = {
    id: 'titan',
    name: 'Titan',
    designation: 'Saturn VI',
    distanceFromSaturn: '1,221,870 km',
    surfaceTemp: '-179°C (-290°F)',
    facts: [
        'Titan is the only moon in the solar system with a thick atmosphere and stable liquid on its surface.',
        'Its atmosphere is 1.5 times denser than Earth\'s, composed mainly of nitrogen with methane clouds.',
        'Rivers, lakes, and seas of liquid methane and ethane cover Titan\'s polar regions.',
        'The Huygens probe landed on Titan in 2005, transmitting for 72 minutes from the surface.'
    ],
    hazardWarning: 'Methane lake pools dot the surface between hydrocarbon dunes. Navigate carefully through the thick orange haze ... visibility is limited.',
    missionControlMessage: `Cassini, you're approaching Titan ... the largest of Saturn's moons.

Titan has something no other moon has: a thick nitrogen atmosphere, thicker than Earth's own. But what's beneath those orange clouds has been a mystery for decades.

We're detecting hydrocarbon lakes. Methane seas. And what appear to be sand dunes made of organic compounds.

Survey the surface. Watch for those methane pools.

Mission Control out.`,

    baseSpeed: 4,
    speedIncrement: 0.0003,
    maxSpeed: 6,
    gravity: 0.4,
    jumpForce: -12,

    colors: {
        sky: ['#2a1a0a', '#4a2a10', '#6a3a15'],
        ground: '#3a2810',
        groundAccent: '#4a3015',
        atmosphere: 'rgba(212, 118, 58, 0.3)',
        particles: ['#d4763a', '#c9933a', '#b85a20']
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.particles = [];
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
            farDunes: this.generateDunes(15, 0.3, 50),
            midDunes: this.generateDunes(10, 0.5, 80),
            nearDunes: this.generateDunes(8, 0.7, 120)
        };
    },

    generateDunes(count, opacity, height) {
        const dunes = [];
        for (let i = 0; i < count; i++) {
            dunes.push({
                x: (i / count) * this.canvas.width * 2,
                width: 100 + Math.random() * 200,
                height: height * (0.5 + Math.random() * 0.5),
                opacity: opacity
            });
        }
        return dunes;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update background layers (parallax)
        this.updateParallax(this.backgroundLayers.farDunes, 0.2);
        this.updateParallax(this.backgroundLayers.midDunes, 0.5);
        this.updateParallax(this.backgroundLayers.nearDunes, 0.8);

        // Update ground curve
        this.groundCurveOffset = Math.sin(this.distance * 0.002) * 15;

        // Spawn obstacles (less frequently)
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 300 + Math.random() * 200;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            return obs.x > -obs.width;
        });

        // Atmospheric particles
        if (Math.random() > 0.9) {
            this.particles.push({
                x: this.canvas.width + 10,
                y: Math.random() * this.groundY,
                size: 2 + Math.random() * 4,
                speed: 1 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.4,
                color: this.colors.particles[Math.floor(Math.random() * this.colors.particles.length)]
            });
        }

        this.particles = this.particles.filter(p => {
            p.x -= p.speed + this.speed * 0.3;
            p.y += Math.sin(p.x * 0.01) * 0.5;
            return p.x > -10;
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
        const types = ['methane_pool', 'dune_wall'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'methane_pool') {
            this.obstacles.push({
                type: 'methane_pool',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: 80 + Math.random() * 60,
                height: 15,
                dangerous: true
            });
        } else {
            this.obstacles.push({
                type: 'dune_wall',
                x: this.canvas.width + 50,
                y: this.groundY - 60 - Math.random() * 40,
                width: 40 + Math.random() * 30,
                height: 60 + Math.random() * 40,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, this.colors.sky[0]);
        skyGradient.addColorStop(0.5, this.colors.sky[1]);
        skyGradient.addColorStop(1, this.colors.sky[2]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Atmospheric haze layers
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = `rgba(212, 118, 58, ${0.05 + i * 0.02})`;
            ctx.fillRect(0, i * canvas.height * 0.15, canvas.width, canvas.height * 0.2);
        }

        // Far dunes (background)
        this.renderDunes(this.backgroundLayers.farDunes, '#2a1505', 0.3);

        // Mid dunes
        this.renderDunes(this.backgroundLayers.midDunes, '#3a2010', 0.5);

        // Near dunes
        this.renderDunes(this.backgroundLayers.nearDunes, '#4a2815', 0.8);

        // Ground with slight curvature
        ctx.fillStyle = this.colors.ground;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 20) {
            const curveY = this.groundY + Math.sin((x + this.distance) * 0.003) * 8 + this.groundCurveOffset;
            ctx.lineTo(x, curveY);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Ground texture
        ctx.fillStyle = this.colors.groundAccent;
        for (let i = 0; i < 50; i++) {
            const x = (i * 47 + this.distance * 0.5) % canvas.width;
            const curveY = this.groundY + Math.sin((x + this.distance) * 0.003) * 8 + this.groundCurveOffset;
            ctx.fillRect(x, curveY + 5, 20 + Math.random() * 30, 2);
        }

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Atmospheric particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba');
            ctx.fill();
        });

        // Top atmospheric glow
        const topGlow = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.3);
        topGlow.addColorStop(0, 'rgba(255, 180, 100, 0.2)');
        topGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3);
    },

    renderDunes(dunes, color, opacity) {
        const ctx = this.ctx;
        dunes.forEach(dune => {
            ctx.beginPath();
            ctx.moveTo(dune.x, this.groundY);
            ctx.quadraticCurveTo(
                dune.x + dune.width * 0.5,
                this.groundY - dune.height,
                dune.x + dune.width,
                this.groundY
            );
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'methane_pool') {
            // Draw a visible gap/pit in the ground for the methane lake
            // First draw the pit
            ctx.fillStyle = '#0a1520';
            ctx.fillRect(obs.x, obs.y, obs.width, 50);

            // Dark methane pool liquid surface
            const poolGradient = ctx.createRadialGradient(
                obs.x + obs.width / 2, obs.y + 10, 0,
                obs.x + obs.width / 2, obs.y + 10, obs.width / 2
            );
            poolGradient.addColorStop(0, 'rgba(20, 40, 70, 0.95)');
            poolGradient.addColorStop(0.5, 'rgba(30, 50, 80, 0.9)');
            poolGradient.addColorStop(1, 'rgba(15, 25, 45, 0.95)');

            ctx.fillStyle = poolGradient;
            ctx.fillRect(obs.x, obs.y, obs.width, 25);

            // Reflection shimmer on surface
            ctx.fillStyle = 'rgba(100, 150, 200, 0.2)';
            ctx.fillRect(obs.x + obs.width * 0.2, obs.y + 2, obs.width * 0.3, 4);
            ctx.fillRect(obs.x + obs.width * 0.55, obs.y + 5, obs.width * 0.25, 3);

            // Edge highlights
            ctx.strokeStyle = 'rgba(60, 90, 120, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.stroke();
        } else if (obs.type === 'dune_wall') {
            // Sandy dune wall
            const duneGradient = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
            duneGradient.addColorStop(0, '#5a3820');
            duneGradient.addColorStop(0.5, '#4a2815');
            duneGradient.addColorStop(1, '#3a2010');

            ctx.fillStyle = duneGradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.3, obs.y);
            ctx.quadraticCurveTo(obs.x + obs.width * 0.5, obs.y - 10, obs.x + obs.width * 0.7, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            // Wind-blown sand effect
            ctx.strokeStyle = 'rgba(212, 118, 58, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(obs.x + obs.width * 0.7, obs.y + i * 10);
                ctx.lineTo(obs.x + obs.width + 20, obs.y + i * 10 - 5);
                ctx.stroke();
            }
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'methane_pool') {
            // Pool is a gap in the ground - player falls in if they touch it
            return {
                x: obs.x + 5,
                y: obs.y,
                width: obs.width - 10,
                height: 50,
                isGap: true
            };
        }
        return {
            x: obs.x + 5,
            y: obs.y,
            width: obs.width - 10,
            height: obs.height
        };
    }
};

window.TitanLevel = TitanLevel;

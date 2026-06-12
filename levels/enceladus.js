// ============================================
// ENCELADUS - The Geyser Moon
// Bright white ice, blue geyser jets shooting up
// Level 6
// ============================================

const EnceladusLevel = {
    id: 'enceladus',
    name: 'Enceladus',
    designation: 'Saturn II',
    distanceFromSaturn: '238,020 km',
    surfaceTemp: '-201°C (-330°F)',
    facts: [
        'Geysers shoot over 100 kg of water per second into space, actively feeding Saturn\'s E ring.',
        'Beneath the icy crust lies a global subsurface ocean with hydrothermal vents on the seafloor.',
        'Cassini flew through the geyser plumes and detected organic molecules and molecular hydrogen.',
        'Enceladus is considered one of the most likely places in our solar system to find microbial life.'
    ],
    hazardWarning: 'Cryovolcanic geysers erupt unpredictably from the icy surface. The water vapor jets are timed obstacles ... watch for the telltale surface cracks before each eruption.',
    missionControlMessage: `Cassini, this is the big one.

Enceladus. We've been waiting to get a closer look at those geysers since we first spotted them in 2005.

Over a hundred jets of water vapor shooting into space from the south polar region. Not ancient ice ... fresh water. Still erupting.

There's an ocean under that ice. Something is keeping it warm.

Fly through those plumes if you can. Sample the spray. This moon might hold the answer to one of humanity's oldest questions.

Mission Control out.`,

    baseSpeed: 6.5,
    speedIncrement: 0.0009,
    maxSpeed: 11,
    gravity: 0.55,
    jumpForce: -14,

    colors: {
        sky: ['#050510', '#0a0a20', '#101030'],
        ground: '#f0f8ff',
        groundAccent: '#d8e8f8',
        geyser: '#00d4ff',
        geyserGlow: 'rgba(0, 212, 255, 0.3)',
        ice: '#e0f0ff'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.geysers = [];
        this.particles = [];
        this.tigerStripes = this.generateTigerStripes();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 150;
        this.backgroundGeysers = this.generateBackgroundGeysers();
    },

    generateTigerStripes() {
        const stripes = [];
        for (let i = 0; i < 8; i++) {
            stripes.push({
                x: Math.random() * this.canvas.width * 2,
                width: 3 + Math.random() * 5,
                length: 50 + Math.random() * 100
            });
        }
        return stripes;
    },

    generateBackgroundGeysers() {
        const geysers = [];
        for (let i = 0; i < 5; i++) {
            geysers.push({
                x: Math.random() * this.canvas.width,
                baseY: this.canvas.height * 0.65,
                height: 100 + Math.random() * 150,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02,
                opacity: 0.2 + Math.random() * 0.3
            });
        }
        return geysers;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update tiger stripes
        this.tigerStripes.forEach(stripe => {
            stripe.x -= this.speed * 0.6;
            if (stripe.x < -stripe.length) {
                stripe.x = this.canvas.width + Math.random() * 200;
            }
        });

        // Update background geysers
        this.backgroundGeysers.forEach(g => {
            g.x -= this.speed * 0.3;
            g.phase += g.speed;
            if (g.x < -50) {
                g.x = this.canvas.width + Math.random() * 200;
            }
        });

        // Spawn obstacles
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 120 + Math.random() * 100;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            if (obs.type === 'geyser') {
                obs.phase += 0.08;
                // Geyser timing - active for part of cycle
                obs.active = Math.sin(obs.phase) > 0.3;
            }
            return obs.x > -obs.width - 50;
        });

        // Update geyser particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx - this.speed * 0.1;
            p.y += p.vy;
            p.vy += 0.05; // Slight gravity on particles
            p.life -= 0.02;
            p.size *= 0.99;
            return p.life > 0 && p.y < this.groundY;
        });

        // Spawn new geyser particles for active geysers
        this.obstacles.forEach(obs => {
            if (obs.type === 'geyser' && obs.active && Math.random() > 0.5) {
                for (let i = 0; i < 3; i++) {
                    this.particles.push({
                        x: obs.x + obs.width / 2 + (Math.random() - 0.5) * 20,
                        y: this.groundY,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -8 - Math.random() * 6,
                        size: 2 + Math.random() * 4,
                        life: 1,
                        color: Math.random() > 0.5 ? '#ffffff' : '#a0e0ff'
                    });
                }
            }
        });

        return this.obstacles;
    },

    spawnObstacle() {
        const types = ['geyser', 'ice_mound'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'geyser') {
            this.obstacles.push({
                type: 'geyser',
                x: this.canvas.width + 50,
                y: this.groundY - 200,
                width: 60,
                height: 200,
                dangerous: true,
                phase: Math.random() * Math.PI * 2,
                active: false
            });
        } else {
            this.obstacles.push({
                type: 'ice_mound',
                x: this.canvas.width + 50,
                y: this.groundY - 40 - Math.random() * 30,
                width: 50 + Math.random() * 30,
                height: 40 + Math.random() * 30,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Space background with E-ring glow
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, this.colors.sky[0]);
        skyGradient.addColorStop(0.5, this.colors.sky[1]);
        skyGradient.addColorStop(1, this.colors.sky[2]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // E-ring particles in background (fed by geysers)
        for (let i = 0; i < 150; i++) {
            const x = (i * 29 + this.distance * 0.1) % canvas.width;
            const y = (i * 17) % (canvas.height * 0.5);
            const size = (i % 3) * 0.3 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 230, 255, ${0.3 + (i % 5) * 0.1})`;
            ctx.fill();
        }

        // Background geysers (distant)
        this.backgroundGeysers.forEach(g => this.renderBackgroundGeyser(g));

        // Tiger stripes (fractures where geysers emerge)
        this.tigerStripes.forEach(stripe => {
            ctx.strokeStyle = '#80a0c0';
            ctx.lineWidth = stripe.width;
            ctx.beginPath();
            ctx.moveTo(stripe.x, this.groundY - 10);
            ctx.lineTo(stripe.x + stripe.length, this.groundY - 5);
            ctx.stroke();

            // Glow around stripes
            ctx.strokeStyle = 'rgba(0, 180, 255, 0.2)';
            ctx.lineWidth = stripe.width + 6;
            ctx.beginPath();
            ctx.moveTo(stripe.x, this.groundY - 10);
            ctx.lineTo(stripe.x + stripe.length, this.groundY - 5);
            ctx.stroke();
        });

        // Ground (brilliant white ice)
        const groundGradient = ctx.createLinearGradient(0, this.groundY, 0, canvas.height);
        groundGradient.addColorStop(0, this.colors.ground);
        groundGradient.addColorStop(1, this.colors.groundAccent);
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ice surface shimmer
        for (let i = 0; i < 30; i++) {
            const x = (i * 67 + this.distance * 0.9) % canvas.width;
            const brightness = 0.3 + Math.sin(this.distance * 0.01 + i) * 0.2;
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.fillRect(x, this.groundY + 3, 30, 2);
        }

        // Render particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('#', 'rgba(').replace(/(..)(..)(..)/, (m, r, g, b) =>
                `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`
            );
            // Simplified particle rendering
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));
    },

    renderBackgroundGeyser(g) {
        const ctx = this.ctx;
        const activity = (Math.sin(g.phase) + 1) / 2;
        const height = g.height * activity;

        if (activity > 0.2) {
            // Geyser column
            const gradient = ctx.createLinearGradient(g.x, g.baseY, g.x, g.baseY - height);
            gradient.addColorStop(0, `rgba(200, 230, 255, ${g.opacity})`);
            gradient.addColorStop(0.5, `rgba(150, 200, 255, ${g.opacity * 0.7})`);
            gradient.addColorStop(1, `rgba(100, 180, 255, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(g.x - 15, g.baseY);
            ctx.quadraticCurveTo(g.x - 25, g.baseY - height / 2, g.x - 10, g.baseY - height);
            ctx.lineTo(g.x + 10, g.baseY - height);
            ctx.quadraticCurveTo(g.x + 25, g.baseY - height / 2, g.x + 15, g.baseY);
            ctx.fill();
        }
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'geyser') {
            // Geyser vent on ground
            ctx.fillStyle = '#6090c0';
            ctx.beginPath();
            ctx.ellipse(obs.x + obs.width / 2, this.groundY, obs.width / 2, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Vent glow
            const ventGlow = ctx.createRadialGradient(
                obs.x + obs.width / 2, this.groundY, 0,
                obs.x + obs.width / 2, this.groundY, obs.width
            );
            ventGlow.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
            ventGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = ventGlow;
            ctx.fillRect(obs.x - obs.width / 2, this.groundY - obs.width, obs.width * 2, obs.width * 2);

            if (obs.active) {
                // Active geyser jet
                const jetHeight = obs.height * (0.7 + Math.sin(obs.phase * 2) * 0.3);
                const gradient = ctx.createLinearGradient(
                    obs.x + obs.width / 2, this.groundY,
                    obs.x + obs.width / 2, this.groundY - jetHeight
                );
                gradient.addColorStop(0, 'rgba(200, 240, 255, 0.9)');
                gradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.7)');
                gradient.addColorStop(0.6, 'rgba(50, 150, 255, 0.4)');
                gradient.addColorStop(1, 'transparent');

                // Main jet
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(obs.x + obs.width * 0.3, this.groundY);
                ctx.quadraticCurveTo(
                    obs.x + obs.width * 0.2, this.groundY - jetHeight * 0.5,
                    obs.x + obs.width * 0.35, this.groundY - jetHeight
                );
                ctx.lineTo(obs.x + obs.width * 0.65, this.groundY - jetHeight);
                ctx.quadraticCurveTo(
                    obs.x + obs.width * 0.8, this.groundY - jetHeight * 0.5,
                    obs.x + obs.width * 0.7, this.groundY
                );
                ctx.fill();

                // Outer glow
                const glowGradient = ctx.createLinearGradient(
                    obs.x + obs.width / 2, this.groundY,
                    obs.x + obs.width / 2, this.groundY - jetHeight
                );
                glowGradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
                glowGradient.addColorStop(1, 'transparent');

                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.moveTo(obs.x, this.groundY);
                ctx.quadraticCurveTo(
                    obs.x - 20, this.groundY - jetHeight * 0.5,
                    obs.x + obs.width * 0.3, this.groundY - jetHeight - 20
                );
                ctx.lineTo(obs.x + obs.width * 0.7, this.groundY - jetHeight - 20);
                ctx.quadraticCurveTo(
                    obs.x + obs.width + 20, this.groundY - jetHeight * 0.5,
                    obs.x + obs.width, this.groundY
                );
                ctx.fill();
            }
        } else if (obs.type === 'ice_mound') {
            // Ice mound obstacle
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            gradient.addColorStop(0, '#c0d8f0');
            gradient.addColorStop(0.5, '#e0f0ff');
            gradient.addColorStop(1, '#ffffff');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.2, obs.y + obs.height * 0.3);
            ctx.lineTo(obs.x + obs.width * 0.5, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.8, obs.y + obs.height * 0.4);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            // Ice shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.35, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.45, obs.y + 5);
            ctx.lineTo(obs.x + obs.width * 0.55, obs.y + obs.height);
            ctx.fill();
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'geyser') {
            if (obs.active) {
                return {
                    x: obs.x + 10,
                    y: this.groundY - obs.height * 0.8,
                    width: obs.width - 20,
                    height: obs.height * 0.8
                };
            }
            return null; // Inactive geysers don't hurt
        }
        return {
            x: obs.x + 5,
            y: obs.y,
            width: obs.width - 10,
            height: obs.height
        };
    }
};

window.EnceladusLevel = EnceladusLevel;

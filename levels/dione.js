// ============================================
// DIONE - Wispy Terrain Moon
// Bright icy surface with wispy streak barriers
// Level 3
// ============================================

const DioneLevel = {
    id: 'dione',
    name: 'Dione',
    designation: 'Saturn IV',
    distanceFromSaturn: '377,400 km',
    surfaceTemp: '-186°C (-303°F)',
    facts: [
        'Dione is the densest of Saturn\'s moons besides Titan, suggesting a larger rocky core.',
        'Bright wispy terrain on the trailing hemisphere was once thought to be ice deposits from cryovolcanism.',
        'Cassini revealed the wisps are actually bright ice cliffs created by tectonic fractures.',
        'Dione possesses a thin oxygen atmosphere, detected by Cassini\'s instruments in 2010.'
    ],
    hazardWarning: 'Brilliant wispy ice formations create visual barriers across the terrain. These reflective streaks can appear suddenly ... maintain situational awareness.',
    missionControlMessage: `Cassini, Dione approach confirmed.

We're seeing something interesting ... those bright streaks on the trailing hemisphere. For years we thought they were cryovolcanic deposits. Ice from eruptions below the surface.

But now we're not so sure. They might be something else entirely.

Get closer. Find out what those wisps really are.

Mission Control out.`,

    baseSpeed: 5,
    speedIncrement: 0.0007,
    maxSpeed: 9,
    gravity: 0.5,
    jumpForce: -13,

    colors: {
        sky: ['#0a0a15', '#101020', '#151530'],
        ground: '#d0d0d0',
        groundAccent: '#b0b0b0',
        wispy: ['rgba(255, 255, 255, 0.8)', 'rgba(220, 230, 255, 0.6)', 'rgba(200, 220, 255, 0.4)'],
        ice: '#e0f0ff'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.wisps = [];
        this.iceFormations = this.generateIceFormations();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 170;
        this.generateBackgroundWisps();
    },

    generateIceFormations() {
        const formations = [];
        for (let i = 0; i < 20; i++) {
            formations.push({
                x: Math.random() * this.canvas.width * 2,
                height: 30 + Math.random() * 60,
                width: 5 + Math.random() * 15,
                layer: Math.floor(Math.random() * 3)
            });
        }
        return formations;
    },

    generateBackgroundWisps() {
        this.backgroundWisps = [];
        for (let i = 0; i < 15; i++) {
            this.backgroundWisps.push({
                x: Math.random() * this.canvas.width * 2,
                y: this.canvas.height * (0.2 + Math.random() * 0.4),
                length: 100 + Math.random() * 300,
                thickness: 2 + Math.random() * 8,
                angle: (Math.random() - 0.5) * 0.3,
                opacity: 0.2 + Math.random() * 0.4
            });
        }
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update background wisps
        this.backgroundWisps.forEach(wisp => {
            wisp.x -= this.speed * 0.4;
            if (wisp.x < -wisp.length) {
                wisp.x = this.canvas.width + Math.random() * 200;
                wisp.y = this.canvas.height * (0.2 + Math.random() * 0.4);
            }
        });

        // Update ice formations
        this.iceFormations.forEach(ice => {
            ice.x -= this.speed * (0.3 + ice.layer * 0.2);
            if (ice.x < -ice.width) {
                ice.x = this.canvas.width + Math.random() * 300;
            }
        });

        // Spawn obstacles
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 140 + Math.random() * 100;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            if (obs.type === 'wispy_barrier') {
                obs.shimmer = (obs.shimmer || 0) + 0.1;
            }
            return obs.x > -obs.width - 100;
        });

        return this.obstacles;
    },

    spawnObstacle() {
        const types = ['wispy_barrier', 'ice_terrain'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'wispy_barrier') {
            const yPos = this.groundY - 50 - Math.random() * 150;
            this.obstacles.push({
                type: 'wispy_barrier',
                x: this.canvas.width + 50,
                y: yPos,
                width: 150 + Math.random() * 100,
                height: 30 + Math.random() * 40,
                dangerous: true,
                shimmer: 0
            });
        } else {
            this.obstacles.push({
                type: 'ice_terrain',
                x: this.canvas.width + 50,
                y: this.groundY - 50 - Math.random() * 40,
                width: 40 + Math.random() * 40,
                height: 50 + Math.random() * 40,
                dangerous: true
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Space background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, this.colors.sky[0]);
        skyGradient.addColorStop(0.5, this.colors.sky[1]);
        skyGradient.addColorStop(1, this.colors.sky[2]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 80; i++) {
            const x = (i * 41 + this.distance * 0.03) % canvas.width;
            const y = (i * 29) % (canvas.height * 0.5);
            ctx.beginPath();
            ctx.arc(x, y, (i % 3) * 0.4 + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Background wisps
        this.backgroundWisps.forEach(wisp => this.renderBackgroundWisp(wisp));

        // Ice formations in background
        this.iceFormations
            .filter(ice => ice.layer === 0)
            .forEach(ice => this.renderIceFormation(ice, 0.3));

        this.iceFormations
            .filter(ice => ice.layer === 1)
            .forEach(ice => this.renderIceFormation(ice, 0.5));

        // Ground
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ground texture - subtle ice cracks
        ctx.strokeStyle = this.colors.groundAccent;
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
            const x = (i * 57 + this.distance * 0.8) % canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, this.groundY + 5);
            ctx.lineTo(x + 20, this.groundY + 25);
            ctx.lineTo(x + 40, this.groundY + 15);
            ctx.stroke();
        }

        // Near ice formations
        this.iceFormations
            .filter(ice => ice.layer === 2)
            .forEach(ice => this.renderIceFormation(ice, 0.8));

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));
    },

    renderBackgroundWisp(wisp) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(wisp.x, wisp.y);
        ctx.rotate(wisp.angle);

        const gradient = ctx.createLinearGradient(0, 0, wisp.length, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.2, `rgba(255, 255, 255, ${wisp.opacity})`);
        gradient.addColorStop(0.8, `rgba(255, 255, 255, ${wisp.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, -wisp.thickness / 2, wisp.length, wisp.thickness);

        // Glow
        const glowGradient = ctx.createLinearGradient(0, 0, wisp.length, 0);
        glowGradient.addColorStop(0, 'transparent');
        glowGradient.addColorStop(0.3, `rgba(200, 220, 255, ${wisp.opacity * 0.3})`);
        glowGradient.addColorStop(0.7, `rgba(200, 220, 255, ${wisp.opacity * 0.3})`);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, -wisp.thickness, wisp.length, wisp.thickness * 2);

        ctx.restore();
    },

    renderIceFormation(ice, opacity) {
        const ctx = this.ctx;
        const gradient = ctx.createLinearGradient(ice.x, this.groundY, ice.x, this.groundY - ice.height);
        gradient.addColorStop(0, `rgba(180, 200, 220, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 240, ${opacity})`);
        gradient.addColorStop(1, `rgba(220, 240, 255, ${opacity * 0.8})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(ice.x, this.groundY);
        ctx.lineTo(ice.x + ice.width * 0.3, this.groundY - ice.height);
        ctx.lineTo(ice.x + ice.width * 0.7, this.groundY - ice.height * 0.8);
        ctx.lineTo(ice.x + ice.width, this.groundY);
        ctx.closePath();
        ctx.fill();
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'wispy_barrier') {
            // Glowing wispy streak barrier
            const shimmerOffset = Math.sin(obs.shimmer) * 5;

            // Core wisp
            const gradient = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

            ctx.fillStyle = gradient;
            ctx.fillRect(obs.x, obs.y + shimmerOffset, obs.width, obs.height);

            // Outer glow
            const glowGradient = ctx.createLinearGradient(obs.x, obs.y - 20, obs.x, obs.y + obs.height + 20);
            glowGradient.addColorStop(0, 'transparent');
            glowGradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)');
            glowGradient.addColorStop(0.7, 'rgba(200, 220, 255, 0.4)');
            glowGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = glowGradient;
            ctx.fillRect(obs.x - 10, obs.y - 20 + shimmerOffset, obs.width + 20, obs.height + 40);

            // Sparkle effects
            for (let i = 0; i < 5; i++) {
                const sparkX = obs.x + Math.random() * obs.width;
                const sparkY = obs.y + Math.random() * obs.height + shimmerOffset;
                const sparkSize = 2 + Math.random() * 3;

                ctx.beginPath();
                ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
                ctx.fill();
            }
        } else if (obs.type === 'ice_terrain') {
            // Rocky ice terrain
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            gradient.addColorStop(0, '#a0b0c0');
            gradient.addColorStop(0.5, '#c0d0e0');
            gradient.addColorStop(1, '#e0f0ff');

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
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.3, obs.y + obs.height * 0.5);
            ctx.lineTo(obs.x + obs.width * 0.5, obs.y + 5);
            ctx.stroke();
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'wispy_barrier') {
            return {
                x: obs.x + 20,
                y: obs.y,
                width: obs.width - 40,
                height: obs.height
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

window.DioneLevel = DioneLevel;

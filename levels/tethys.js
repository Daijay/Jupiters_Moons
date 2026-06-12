// ============================================
// TETHYS - The Fractured Moon
// Deep Ithaca Chasma canyon, massive gap jumps
// Level 5
// ============================================

const TethysLevel = {
    id: 'tethys',
    name: 'Tethys',
    designation: 'Saturn III',
    distanceFromSaturn: '294,660 km',
    surfaceTemp: '-187°C (-305°F)',
    facts: [
        'Ithaca Chasma stretches three-quarters of the way around the entire moon ... over 2,000 km long.',
        'The canyon is up to 100 km wide and 3-5 km deep in places, dwarfing Earth\'s Grand Canyon.',
        'Tethys has one of the lowest densities of any moon, suggesting it is almost pure water ice.',
        'Odysseus crater on the opposite side is 450 km wide ... 2/5 of the moon\'s entire diameter.'
    ],
    hazardWarning: 'The Ithaca Chasma fracture system creates massive gaps in the terrain. Precise timing on jumps is critical ... the canyon walls offer no second chances.',
    missionControlMessage: `Cassini, Tethys approach vector confirmed.

What you're seeing is Ithaca Chasma ... the largest known canyon relative to body size in the entire solar system. It wraps three-quarters of the way around the moon.

We think it formed when Tethys froze and expanded, cracking its own surface. The whole moon nearly split in two.

Watch those gaps. They're deeper than they look.

Mission Control out.`,

    baseSpeed: 6,
    speedIncrement: 0.0008,
    maxSpeed: 10,
    gravity: 0.5,
    jumpForce: -13.5,

    colors: {
        sky: ['#080810', '#101018', '#181825'],
        ground: '#c8d0d8',
        groundAccent: '#a8b0b8',
        canyon: '#181820',
        canyonWall: '#404050'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.canyonSegments = this.generateCanyonBackground();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 200;
        this.dustParticles = [];
    },

    generateCanyonBackground() {
        const segments = [];
        for (let i = 0; i < 10; i++) {
            segments.push({
                x: i * 200,
                topY: this.canvas.height * 0.35 + Math.random() * 30,
                bottomY: this.canvas.height * 0.55 + Math.random() * 30,
                width: 180 + Math.random() * 40
            });
        }
        return segments;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update canyon background
        this.canyonSegments.forEach(seg => {
            seg.x -= this.speed * 0.4;
            if (seg.x < -seg.width) {
                seg.x = this.canvas.width + 100;
                seg.topY = this.canvas.height * 0.35 + Math.random() * 30;
                seg.bottomY = this.canvas.height * 0.55 + Math.random() * 30;
            }
        });

        // Spawn obstacles
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 160 + Math.random() * 120;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            return obs.x > -obs.width - 50;
        });

        // Canyon dust particles
        if (Math.random() > 0.93) {
            this.dustParticles.push({
                x: this.canvas.width + 10,
                y: this.canvas.height * (0.4 + Math.random() * 0.2),
                size: 1 + Math.random() * 2,
                speedX: 1 + Math.random() * 2,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: 0.2 + Math.random() * 0.3
            });
        }

        this.dustParticles = this.dustParticles.filter(p => {
            p.x -= p.speedX + this.speed * 0.3;
            p.y += p.speedY;
            p.opacity -= 0.002;
            return p.x > -10 && p.opacity > 0;
        });

        return this.obstacles;
    },

    spawnObstacle() {
        const types = ['fracture_gap', 'canyon_wall'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'fracture_gap') {
            const gapWidth = 80 + Math.random() * 70;
            this.obstacles.push({
                type: 'fracture_gap',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: gapWidth,
                height: 300,
                dangerous: true
            });
        } else {
            this.obstacles.push({
                type: 'canyon_wall',
                x: this.canvas.width + 50,
                y: this.groundY - 70 - Math.random() * 50,
                width: 45 + Math.random() * 35,
                height: 70 + Math.random() * 50,
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
        for (let i = 0; i < 100; i++) {
            const x = (i * 37 + this.distance * 0.02) % canvas.width;
            const y = (i * 19) % (canvas.height * 0.3);
            ctx.beginPath();
            ctx.arc(x, y, (i % 3) * 0.3 + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ithaca Chasma in background
        this.renderCanyonBackground();

        // Dust particles in canyon
        this.dustParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150, 160, 170, ${p.opacity})`;
            ctx.fill();
        });

        // Ground
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ground fracture lines
        ctx.strokeStyle = this.colors.groundAccent;
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            const x = (i * 73 + this.distance * 0.8) % canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, this.groundY + 3);
            ctx.lineTo(x + 15 + Math.random() * 20, this.groundY + 20 + Math.random() * 15);
            ctx.stroke();
        }

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));
    },

    renderCanyonBackground() {
        const ctx = this.ctx;

        // Canyon walls (Ithaca Chasma)
        this.canyonSegments.forEach(seg => {
            // Upper canyon rim
            const upperGradient = ctx.createLinearGradient(seg.x, 0, seg.x, seg.topY);
            upperGradient.addColorStop(0, 'transparent');
            upperGradient.addColorStop(0.7, this.colors.canyonWall);
            upperGradient.addColorStop(1, this.colors.canyon);

            ctx.fillStyle = upperGradient;
            ctx.beginPath();
            ctx.moveTo(seg.x, 0);
            ctx.lineTo(seg.x, seg.topY);
            ctx.lineTo(seg.x + seg.width, seg.topY + 20);
            ctx.lineTo(seg.x + seg.width, 0);
            ctx.fill();

            // Canyon floor (deep)
            ctx.fillStyle = this.colors.canyon;
            ctx.fillRect(seg.x, seg.topY, seg.width, seg.bottomY - seg.topY);

            // Lower canyon rim
            const lowerGradient = ctx.createLinearGradient(seg.x, seg.bottomY, seg.x, this.canvas.height * 0.7);
            lowerGradient.addColorStop(0, this.colors.canyon);
            lowerGradient.addColorStop(0.3, this.colors.canyonWall);
            lowerGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = lowerGradient;
            ctx.beginPath();
            ctx.moveTo(seg.x, seg.bottomY);
            ctx.lineTo(seg.x, this.canvas.height * 0.7);
            ctx.lineTo(seg.x + seg.width, this.canvas.height * 0.7);
            ctx.lineTo(seg.x + seg.width, seg.bottomY - 15);
            ctx.fill();

            // Canyon wall detail lines
            ctx.strokeStyle = 'rgba(100, 100, 120, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const lineY = seg.topY + (seg.bottomY - seg.topY) * (i / 5);
                ctx.beginPath();
                ctx.moveTo(seg.x, lineY);
                ctx.lineTo(seg.x + seg.width, lineY + 5);
                ctx.stroke();
            }
        });
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'fracture_gap') {
            // Deep fracture in the ground
            const gapGradient = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
            gapGradient.addColorStop(0, '#101015');
            gapGradient.addColorStop(0.3, '#080810');
            gapGradient.addColorStop(1, '#000005');

            ctx.fillStyle = gapGradient;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Fracture edge detail
            ctx.fillStyle = '#505060';
            ctx.beginPath();
            ctx.moveTo(obs.x - 8, obs.y);
            ctx.lineTo(obs.x, obs.y + 30);
            ctx.lineTo(obs.x, obs.y);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width + 8, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y + 30);
            ctx.lineTo(obs.x + obs.width, obs.y);
            ctx.fill();

            // Jagged edges
            ctx.strokeStyle = '#606070';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + 5, obs.y + 40);
            ctx.lineTo(obs.x - 3, obs.y + 80);
            ctx.lineTo(obs.x + 8, obs.y + 120);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width, obs.y);
            ctx.lineTo(obs.x + obs.width - 5, obs.y + 35);
            ctx.lineTo(obs.x + obs.width + 3, obs.y + 70);
            ctx.lineTo(obs.x + obs.width - 6, obs.y + 110);
            ctx.stroke();

        } else if (obs.type === 'canyon_wall') {
            // Rocky canyon wall obstacle
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            gradient.addColorStop(0, '#707080');
            gradient.addColorStop(0.5, '#909098');
            gradient.addColorStop(1, '#b0b0b8');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + 5, obs.y + obs.height * 0.3);
            ctx.lineTo(obs.x + obs.width * 0.3, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.6, obs.y + 10);
            ctx.lineTo(obs.x + obs.width * 0.8, obs.y + 5);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height * 0.4);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            // Rock face detail
            ctx.strokeStyle = 'rgba(60, 60, 70, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.2, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.3, obs.y + 5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.5, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.6, obs.y + 15);
            ctx.stroke();
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'fracture_gap') {
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
    }
};

window.TethysLevel = TethysLevel;

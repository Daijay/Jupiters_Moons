// ============================================
// MIMAS - The Death Star Moon
// Heavily cratered surface with Herschel Crater
// Level 2
// ============================================

const MimasLevel = {
    id: 'mimas',
    name: 'Mimas',
    designation: 'Saturn I',
    distanceFromSaturn: '185,520 km',
    surfaceTemp: '-209°C (-344°F)',
    facts: [
        'Herschel Crater is 130km wide ... nearly one-third of Mimas\' diameter ... and the impact nearly shattered the moon.',
        'Mimas is the smallest astronomical body known to be rounded due to its own gravity.',
        'The moon\'s low density suggests it may be mostly water ice with only a small rocky core.',
        'Mimas creates the Cassini Division ... the dark gap in Saturn\'s rings ... through gravitational resonance.'
    ],
    hazardWarning: 'The heavily cratered terrain creates treacherous gaps. Crater debris occasionally falls from unstable rim walls. Time your jumps carefully.',
    missionControlMessage: `Cassini, Mimas is coming into view.

You'll notice the resemblance immediately ... yes, it looks like the Death Star. That massive crater is Herschel, 130 kilometers across.

The impact that created it should have destroyed Mimas entirely. The fact that it didn't tells us something about this moon's internal structure.

Watch for crater gaps and falling debris.

Mission Control out.`,

    baseSpeed: 4.5,
    speedIncrement: 0.0006,
    maxSpeed: 8,
    gravity: 0.45,
    jumpForce: -12.5,

    colors: {
        sky: ['#0a0a10', '#151520', '#1a1a25'],
        ground: '#606060',
        groundAccent: '#505050',
        crater: '#404040',
        debris: '#808080'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.debris = [];
        this.craters = this.generateCraters();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 200;
        this.herschelX = -500;
    },

    generateCraters() {
        const craters = [];
        for (let i = 0; i < 30; i++) {
            craters.push({
                x: Math.random() * this.canvas.width * 3,
                y: this.canvas.height * (0.3 + Math.random() * 0.3),
                radius: 10 + Math.random() * 40,
                depth: 0.3 + Math.random() * 0.4
            });
        }
        return craters;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update Herschel crater position (giant background element)
        this.herschelX -= this.speed * 0.1;
        if (this.herschelX < -600) {
            this.herschelX = this.canvas.width + 500;
        }

        // Update craters parallax
        this.craters.forEach(crater => {
            crater.x -= this.speed * 0.3;
            if (crater.x < -crater.radius * 2) {
                crater.x = this.canvas.width + crater.radius + Math.random() * 200;
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
            return obs.x > -obs.width;
        });

        // Spawn falling debris occasionally
        if (Math.random() > 0.98) {
            this.debris.push({
                x: this.canvas.width + Math.random() * 200,
                y: -20,
                size: 5 + Math.random() * 15,
                speedX: -this.speed * 0.5,
                speedY: 2 + Math.random() * 3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        // Update debris
        this.debris = this.debris.filter(d => {
            d.x += d.speedX;
            d.y += d.speedY;
            d.rotation += d.rotationSpeed;
            return d.y < this.canvas.height && d.x > -50;
        });

        return this.obstacles;
    },

    spawnObstacle() {
        const types = ['crater_gap', 'debris_pile'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'crater_gap') {
            const gapWidth = 60 + Math.random() * 50;
            this.obstacles.push({
                type: 'crater_gap',
                x: this.canvas.width + 50,
                y: this.groundY,
                width: gapWidth,
                height: 200,
                dangerous: true
            });
        } else {
            this.obstacles.push({
                type: 'debris_pile',
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
            const x = (i * 37 + this.distance * 0.05) % canvas.width;
            const y = (i * 23) % (canvas.height * 0.6);
            const size = (i % 3) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Herschel crater in background (the Death Star feature)
        this.renderHerschelCrater();

        // Background craters
        this.craters.forEach(crater => this.renderCrater(crater));

        // Ground
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ground crater texture
        for (let i = 0; i < 20; i++) {
            const x = (i * 83 + this.distance * 0.7) % canvas.width;
            ctx.beginPath();
            ctx.arc(x, this.groundY + 15 + (i % 5) * 8, 5 + (i % 8), 0, Math.PI * 2);
            ctx.fillStyle = this.colors.groundAccent;
            ctx.fill();
        }

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Render falling debris
        this.debris.forEach(d => {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);
            ctx.fillStyle = this.colors.debris;
            ctx.beginPath();
            ctx.moveTo(-d.size, 0);
            ctx.lineTo(0, -d.size * 0.7);
            ctx.lineTo(d.size * 0.8, 0);
            ctx.lineTo(d.size * 0.3, d.size * 0.6);
            ctx.lineTo(-d.size * 0.5, d.size * 0.4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    },

    renderHerschelCrater() {
        const ctx = this.ctx;
        const x = this.herschelX;
        const y = this.canvas.height * 0.35;
        const radius = 250;

        // Outer crater rim
        const craterGradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
        craterGradient.addColorStop(0, '#303030');
        craterGradient.addColorStop(0.5, '#404040');
        craterGradient.addColorStop(0.8, '#505050');
        craterGradient.addColorStop(1, '#606060');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = craterGradient;
        ctx.fill();

        // Central peak
        const peakGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.15);
        peakGradient.addColorStop(0, '#707070');
        peakGradient.addColorStop(1, '#404040');

        ctx.beginPath();
        ctx.arc(x, y, radius * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = peakGradient;
        ctx.fill();

        // Rim highlight
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI * 0.8, Math.PI * 1.2);
        ctx.stroke();
    },

    renderCrater(crater) {
        const ctx = this.ctx;
        const gradient = ctx.createRadialGradient(
            crater.x, crater.y, 0,
            crater.x, crater.y, crater.radius
        );
        gradient.addColorStop(0, `rgba(40, 40, 40, ${crater.depth})`);
        gradient.addColorStop(0.7, `rgba(60, 60, 60, ${crater.depth * 0.7})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'crater_gap') {
            // Deep crater pit
            const gapGradient = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
            gapGradient.addColorStop(0, '#202020');
            gapGradient.addColorStop(1, '#000000');

            ctx.fillStyle = gapGradient;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Crater rim edges
            ctx.fillStyle = '#707070';
            ctx.beginPath();
            ctx.moveTo(obs.x - 10, obs.y);
            ctx.lineTo(obs.x + 5, obs.y + 20);
            ctx.lineTo(obs.x + 5, obs.y);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width + 10, obs.y);
            ctx.lineTo(obs.x + obs.width - 5, obs.y + 20);
            ctx.lineTo(obs.x + obs.width - 5, obs.y);
            ctx.fill();
        } else if (obs.type === 'debris_pile') {
            // Rocky debris pile
            const rocks = [
                { dx: 0, dy: 0, size: obs.width * 0.4 },
                { dx: obs.width * 0.3, dy: -5, size: obs.width * 0.35 },
                { dx: obs.width * 0.5, dy: 5, size: obs.width * 0.3 },
                { dx: obs.width * 0.15, dy: -obs.height * 0.3, size: obs.width * 0.25 }
            ];

            rocks.forEach((rock, i) => {
                const gradient = ctx.createRadialGradient(
                    obs.x + rock.dx, obs.y + rock.dy + obs.height - rock.size,
                    0,
                    obs.x + rock.dx, obs.y + rock.dy + obs.height - rock.size,
                    rock.size
                );
                gradient.addColorStop(0, '#808080');
                gradient.addColorStop(0.5, '#606060');
                gradient.addColorStop(1, '#404040');

                ctx.beginPath();
                ctx.arc(
                    obs.x + rock.dx + rock.size / 2,
                    obs.y + rock.dy + obs.height - rock.size / 2,
                    rock.size / 2,
                    0, Math.PI * 2
                );
                ctx.fillStyle = gradient;
                ctx.fill();
            });
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'crater_gap') {
            return {
                x: obs.x,
                y: obs.y,
                width: obs.width,
                height: obs.height,
                isGap: true
            };
        }
        return {
            x: obs.x,
            y: obs.y,
            width: obs.width,
            height: obs.height
        };
    }
};

window.MimasLevel = MimasLevel;

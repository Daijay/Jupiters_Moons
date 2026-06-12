// ============================================
// RHEA - Low Gravity Moon
// Pale blue-white icy surface with floaty physics
// Level 4
// ============================================

const RheaLevel = {
    id: 'rhea',
    name: 'Rhea',
    designation: 'Saturn V',
    distanceFromSaturn: '527,040 km',
    surfaceTemp: '-174°C (-281°F)',
    facts: [
        'Rhea\'s atmosphere is 5 trillion times less dense than Earth\'s ... barely there but scientifically significant.',
        'It is Saturn\'s second-largest moon and the ninth-largest moon in the solar system.',
        'Rhea may have had a tenuous ring system of its own ... which would make it the only moon known to have rings.',
        'The surface is heavily cratered and uniformly bright, suggesting it is almost pure water ice.'
    ],
    hazardWarning: 'Rhea\'s extremely low gravity creates floaty jump physics. Timing your landings becomes unpredictable ... tall ice cliff walls require precise jumps.',
    missionControlMessage: `Cassini, you're entering Rhea's sphere of influence.

This one's interesting. We're detecting what might be the thinnest atmosphere ever measured on a moon. Oxygen and carbon dioxide ... not much of it, but it's there.

And there's something else. Possible ring debris around Rhea itself. A moon with its own rings. We've never seen that before.

The gravity is low. Your jumps will feel different here.

Mission Control out.`,

    baseSpeed: 5.5,
    speedIncrement: 0.0007,
    maxSpeed: 9.5,
    gravity: 0.25,
    jumpForce: -10,

    colors: {
        sky: ['#080812', '#101025', '#181835'],
        ground: '#d8e8f8',
        groundAccent: '#c0d0e8',
        ice: '#e8f4ff',
        cliff: '#b8c8d8'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.particles = [];
        this.icebergs = this.generateIcebergs();
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 180;
        this.ringParticles = this.generateRingParticles();
    },

    generateIcebergs() {
        const icebergs = [];
        for (let i = 0; i < 15; i++) {
            icebergs.push({
                x: Math.random() * this.canvas.width * 2,
                y: this.canvas.height * (0.3 + Math.random() * 0.3),
                width: 40 + Math.random() * 80,
                height: 30 + Math.random() * 50,
                layer: Math.floor(Math.random() * 3)
            });
        }
        return icebergs;
    },

    generateRingParticles() {
        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height * 0.1 + Math.random() * this.canvas.height * 0.15,
                size: 1 + Math.random() * 3,
                speed: 0.5 + Math.random() * 1.5,
                brightness: 0.3 + Math.random() * 0.7
            });
        }
        return particles;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update icebergs parallax
        this.icebergs.forEach(ice => {
            ice.x -= this.speed * (0.2 + ice.layer * 0.2);
            if (ice.x < -ice.width) {
                ice.x = this.canvas.width + Math.random() * 300;
            }
        });

        // Update ring particles
        this.ringParticles.forEach(p => {
            p.x -= p.speed;
            if (p.x < -10) {
                p.x = this.canvas.width + 10;
                p.y = this.canvas.height * 0.1 + Math.random() * this.canvas.height * 0.15;
            }
        });

        // Spawn obstacles
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 150 + Math.random() * 100;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            return obs.x > -obs.width;
        });

        // Floating ice dust particles
        if (Math.random() > 0.95) {
            this.particles.push({
                x: this.canvas.width + 10,
                y: this.groundY - Math.random() * 200,
                size: 1 + Math.random() * 2,
                speedX: 0.5 + Math.random(),
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: 0.3 + Math.random() * 0.5
            });
        }

        this.particles = this.particles.filter(p => {
            p.x -= p.speedX + this.speed * 0.2;
            p.y += p.speedY;
            return p.x > -10;
        });

        return this.obstacles;
    },

    spawnObstacle() {
        // Rhea has tall ice cliffs as main obstacle
        const height = 80 + Math.random() * 60;
        this.obstacles.push({
            type: 'ice_cliff',
            x: this.canvas.width + 50,
            y: this.groundY - height,
            width: 35 + Math.random() * 25,
            height: height,
            dangerous: true
        });
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
        for (let i = 0; i < 120; i++) {
            const x = (i * 31 + this.distance * 0.02) % canvas.width;
            const y = (i * 17) % (canvas.height * 0.6);
            const twinkle = Math.sin(this.distance * 0.01 + i) * 0.3 + 0.7;
            ctx.globalAlpha = twinkle;
            ctx.beginPath();
            ctx.arc(x, y, (i % 3) * 0.4 + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Possible ring debris (thin band across sky)
        this.ringParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 210, 230, ${p.brightness})`;
            ctx.fill();
        });

        // Background icebergs
        this.icebergs
            .sort((a, b) => a.layer - b.layer)
            .forEach(ice => this.renderIceberg(ice));

        // Ground
        const groundGradient = ctx.createLinearGradient(0, this.groundY, 0, canvas.height);
        groundGradient.addColorStop(0, this.colors.ground);
        groundGradient.addColorStop(1, this.colors.groundAccent);
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ground texture - ice crystals
        for (let i = 0; i < 40; i++) {
            const x = (i * 43 + this.distance * 0.9) % canvas.width;
            const y = this.groundY + 5 + (i % 6) * 5;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 3) * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 3, y - 5);
            ctx.lineTo(x + 6, y);
            ctx.fill();
        }

        // Floating particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        });

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Low gravity indicator (subtle visual)
        ctx.fillStyle = 'rgba(200, 220, 255, 0.1)';
        ctx.fillRect(0, this.groundY - 150, canvas.width, 150);
    },

    renderIceberg(ice) {
        const ctx = this.ctx;
        const opacity = 0.3 + ice.layer * 0.25;

        const gradient = ctx.createLinearGradient(ice.x, ice.y + ice.height, ice.x, ice.y);
        gradient.addColorStop(0, `rgba(180, 200, 220, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 240, ${opacity})`);
        gradient.addColorStop(1, `rgba(230, 245, 255, ${opacity * 0.8})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(ice.x, ice.y + ice.height);
        ctx.lineTo(ice.x + ice.width * 0.15, ice.y + ice.height * 0.4);
        ctx.lineTo(ice.x + ice.width * 0.4, ice.y);
        ctx.lineTo(ice.x + ice.width * 0.6, ice.y + ice.height * 0.2);
        ctx.lineTo(ice.x + ice.width * 0.85, ice.y + ice.height * 0.3);
        ctx.lineTo(ice.x + ice.width, ice.y + ice.height);
        ctx.closePath();
        ctx.fill();
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'ice_cliff') {
            // Tall ice cliff wall
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            gradient.addColorStop(0, '#a0b8d0');
            gradient.addColorStop(0.3, '#b8d0e8');
            gradient.addColorStop(0.6, '#d0e8f8');
            gradient.addColorStop(1, '#e8f8ff');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + 5, obs.y + 10);
            ctx.lineTo(obs.x + obs.width * 0.3, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.7, obs.y + 5);
            ctx.lineTo(obs.x + obs.width - 5, obs.y + 15);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            // Ice cliff face detail
            ctx.strokeStyle = 'rgba(150, 180, 210, 0.5)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const lineY = obs.y + obs.height * (0.2 + i * 0.2);
                ctx.beginPath();
                ctx.moveTo(obs.x + 5, lineY);
                ctx.lineTo(obs.x + obs.width - 5, lineY + 5);
                ctx.stroke();
            }

            // Shine highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.2, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.25, obs.y + 20);
            ctx.lineTo(obs.x + obs.width * 0.35, obs.y + obs.height);
            ctx.fill();

            // Top ice crystals
            ctx.fillStyle = '#e8f8ff';
            for (let i = 0; i < 3; i++) {
                const cx = obs.x + obs.width * (0.2 + i * 0.3);
                ctx.beginPath();
                ctx.moveTo(cx, obs.y);
                ctx.lineTo(cx + 3, obs.y - 8 - Math.random() * 5);
                ctx.lineTo(cx + 6, obs.y);
                ctx.fill();
            }
        }
    },

    getCollisionBox(obs) {
        return {
            x: obs.x + 3,
            y: obs.y,
            width: obs.width - 6,
            height: obs.height
        };
    }
};

window.RheaLevel = RheaLevel;

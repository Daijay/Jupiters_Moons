// ============================================
// PROMETHEUS - The Ring Shepherd
// F-ring dominates background, fast ice particles
// Level 9
// ============================================

const PrometheusLevel = {
    id: 'prometheus',
    name: 'Prometheus',
    designation: 'Saturn XVI',
    distanceFromSaturn: '139,380 km',
    surfaceTemp: '-198°C (-324°F)',
    facts: [
        'Prometheus creates gravitational ripples that sculpt and define Saturn\'s F ring edges.',
        'The moon is only 86 km long and highly elongated ... shaped like a potato.',
        'Prometheus steals material from the F ring during close approaches, creating visible streamers.',
        'It shares its orbit with Pandora, the outer shepherd moon that confines the F ring\'s outer edge.'
    ],
    hazardWarning: 'Saturn\'s F ring passes dangerously close. Dense ice particles shoot horizontally at extreme velocity. The ring\'s gravitational streamers create unpredictable debris fields.',
    missionControlMessage: `Cassini, you're inside the F ring zone.

Prometheus is a shepherd moon ... it uses its gravity to keep Saturn's F ring in place. But it's a violent relationship.

Every time Prometheus swings close to the ring, it tears away material. Creates streamers. Gravitational chaos.

You're flying through active ring territory now. Ice particles everywhere. Keep your altitude precise.

Mission Control out.`,

    baseSpeed: 8,
    speedIncrement: 0.0012,
    maxSpeed: 14,
    gravity: 0.55,
    jumpForce: -14,

    colors: {
        sky: ['#080810', '#101020', '#181830'],
        ground: '#a0a0a8',
        groundAccent: '#888890',
        ring: ['#e8dcc4', '#d0c4b0', '#c8b8a0'],
        particle: '#f0e8d8'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.ringParticles = [];
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 120;
        this.ringY = canvas.height * 0.25;
        this.ringStreamers = this.generateRingStreamers();
    },

    generateRingStreamers() {
        const streamers = [];
        for (let i = 0; i < 5; i++) {
            streamers.push({
                x: Math.random() * this.canvas.width * 2,
                startY: this.canvas.height * 0.2,
                endY: this.canvas.height * 0.4 + Math.random() * 0.2 * this.canvas.height,
                width: 30 + Math.random() * 50,
                opacity: 0.2 + Math.random() * 0.3
            });
        }
        return streamers;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update ring streamers
        this.ringStreamers.forEach(s => {
            s.x -= this.speed * 0.6;
            if (s.x < -s.width) {
                s.x = this.canvas.width + Math.random() * 300;
                s.endY = this.canvas.height * 0.4 + Math.random() * 0.2 * this.canvas.height;
            }
        });

        // Spawn obstacles (fast horizontal ice particles)
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 80 + Math.random() * 80;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= obs.speed || this.speed;
            return obs.x > -obs.width - 50;
        });

        // Spawn ring particles constantly
        if (Math.random() > 0.7) {
            const y = this.ringY + (Math.random() - 0.5) * 100;
            this.ringParticles.push({
                x: this.canvas.width + 10,
                y: y,
                size: 1 + Math.random() * 3,
                speed: this.speed * 1.5 + Math.random() * 5,
                brightness: 0.5 + Math.random() * 0.5
            });
        }

        this.ringParticles = this.ringParticles.filter(p => {
            p.x -= p.speed;
            return p.x > -10;
        });

        return this.obstacles;
    },

    spawnObstacle() {
        const types = ['ice_cluster', 'ring_debris'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'ice_cluster') {
            // Fast-moving horizontal ice cluster
            const y = this.groundY - 80 - Math.random() * 120;
            this.obstacles.push({
                type: 'ice_cluster',
                x: this.canvas.width + 50,
                y: y,
                width: 40 + Math.random() * 30,
                height: 25 + Math.random() * 20,
                speed: this.speed * 2 + Math.random() * 3,
                dangerous: true,
                particles: this.generateClusterParticles()
            });
        } else {
            // Ground-based ring debris
            this.obstacles.push({
                type: 'ring_debris',
                x: this.canvas.width + 50,
                y: this.groundY - 45 - Math.random() * 35,
                width: 45 + Math.random() * 35,
                height: 45 + Math.random() * 35,
                dangerous: true
            });
        }
    },

    generateClusterParticles() {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            particles.push({
                offsetX: (Math.random() - 0.5) * 40,
                offsetY: (Math.random() - 0.5) * 25,
                size: 3 + Math.random() * 8
            });
        }
        return particles;
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
            const x = (i * 37 + this.distance * 0.02) % canvas.width;
            const y = (i * 19) % (canvas.height * 0.15);
            ctx.beginPath();
            ctx.arc(x, y, (i % 2) * 0.3 + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Saturn visible in background (large)
        this.renderSaturnBackground();

        // F-Ring (dominant visual element)
        this.renderFRing();

        // Ring streamers
        this.ringStreamers.forEach(s => this.renderStreamer(s));

        // Ring particles
        this.ringParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(240, 232, 216, ${p.brightness})`;
            ctx.fill();

            // Motion trail
            ctx.strokeStyle = `rgba(240, 232, 216, ${p.brightness * 0.3})`;
            ctx.lineWidth = p.size * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.speed * 3, p.y);
            ctx.stroke();
        });

        // Ground
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ground texture
        for (let i = 0; i < 30; i++) {
            const x = (i * 57 + this.distance * 0.9) % canvas.width;
            ctx.fillStyle = this.colors.groundAccent;
            ctx.fillRect(x, this.groundY + 5, 25, 3);
        }

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Warning indicators
        this.obstacles.forEach(obs => {
            if (obs.type === 'ice_cluster' && obs.x > canvas.width - 150) {
                ctx.fillStyle = 'rgba(255, 200, 100, 0.6)';
                ctx.beginPath();
                ctx.moveTo(canvas.width - 20, obs.y + obs.height / 2);
                ctx.lineTo(canvas.width - 40, obs.y + obs.height / 2 - 15);
                ctx.lineTo(canvas.width - 40, obs.y + obs.height / 2 + 15);
                ctx.fill();
            }
        });
    },

    renderSaturnBackground() {
        const ctx = this.ctx;
        const x = this.canvas.width * 0.7;
        const y = this.canvas.height * 0.3;
        const radius = 200;

        // Planet glow
        const glow = ctx.createRadialGradient(x, y, radius, x, y, radius * 1.5);
        glow.addColorStop(0, 'rgba(212, 168, 83, 0.1)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Planet body (partial, showing we're close)
        const gradient = ctx.createRadialGradient(x - radius * 0.3, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(232, 200, 150, 0.3)');
        gradient.addColorStop(0.5, 'rgba(190, 150, 90, 0.2)');
        gradient.addColorStop(1, 'rgba(140, 100, 60, 0.1)');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    },

    renderFRing() {
        const ctx = this.ctx;
        const ringY = this.ringY;

        // F-ring structure (multiple thin strands)
        for (let i = 0; i < 5; i++) {
            const y = ringY + (i - 2) * 15;
            const thickness = 3 + Math.sin(i) * 2;
            const opacity = 0.6 - Math.abs(i - 2) * 0.15;

            // Ring gradient
            const gradient = ctx.createLinearGradient(0, y, this.canvas.width, y);
            gradient.addColorStop(0, `rgba(232, 220, 196, ${opacity})`);
            gradient.addColorStop(0.3, `rgba(240, 230, 210, ${opacity})`);
            gradient.addColorStop(0.7, `rgba(240, 230, 210, ${opacity})`);
            gradient.addColorStop(1, `rgba(232, 220, 196, ${opacity})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, y - thickness / 2, this.canvas.width, thickness);
        }

        // Ring glow
        const glowGradient = ctx.createLinearGradient(0, ringY - 50, 0, ringY + 50);
        glowGradient.addColorStop(0, 'transparent');
        glowGradient.addColorStop(0.5, 'rgba(232, 220, 196, 0.1)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, ringY - 50, this.canvas.width, 100);
    },

    renderStreamer(s) {
        const ctx = this.ctx;

        // Gravitational streamer pulled from ring
        const gradient = ctx.createLinearGradient(s.x, s.startY, s.x, s.endY);
        gradient.addColorStop(0, `rgba(232, 220, 196, ${s.opacity})`);
        gradient.addColorStop(0.5, `rgba(200, 190, 170, ${s.opacity * 0.6})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(s.x, s.startY);
        ctx.quadraticCurveTo(s.x + s.width * 0.3, (s.startY + s.endY) / 2, s.x + 10, s.endY);
        ctx.lineTo(s.x + s.width - 10, s.endY);
        ctx.quadraticCurveTo(s.x + s.width * 0.7, (s.startY + s.endY) / 2, s.x + s.width, s.startY);
        ctx.fill();
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        if (obs.type === 'ice_cluster') {
            // Fast-moving ice cluster
            obs.particles.forEach(p => {
                const x = obs.x + obs.width / 2 + p.offsetX;
                const y = obs.y + obs.height / 2 + p.offsetY;

                // Ice chunk
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.5, '#e8e0d8');
                gradient.addColorStop(1, '#d0c8c0');

                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Motion blur
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = p.size * 0.6;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 30, y);
                ctx.stroke();
            });

            // Cluster glow
            const clusterGlow = ctx.createRadialGradient(
                obs.x + obs.width / 2, obs.y + obs.height / 2, 0,
                obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width
            );
            clusterGlow.addColorStop(0, 'rgba(255, 240, 220, 0.3)');
            clusterGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = clusterGlow;
            ctx.fillRect(obs.x - 20, obs.y - 20, obs.width + 40, obs.height + 40);

        } else if (obs.type === 'ring_debris') {
            // Accumulated ring debris on surface
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            gradient.addColorStop(0, '#908880');
            gradient.addColorStop(0.5, '#b0a8a0');
            gradient.addColorStop(1, '#d0c8c0');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + 5, obs.y + obs.height * 0.3);
            ctx.lineTo(obs.x + obs.width * 0.3, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.6, obs.y + obs.height * 0.1);
            ctx.lineTo(obs.x + obs.width * 0.8, obs.y + obs.height * 0.2);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            // Ice chunks on debris
            for (let i = 0; i < 4; i++) {
                const cx = obs.x + obs.width * (0.2 + i * 0.2);
                const cy = obs.y + obs.height * 0.4;
                ctx.beginPath();
                ctx.arc(cx, cy, 4 + Math.random() * 4, 0, Math.PI * 2);
                ctx.fillStyle = '#e8e0d8';
                ctx.fill();
            }
        }
    },

    getCollisionBox(obs) {
        if (obs.type === 'ice_cluster') {
            return {
                x: obs.x,
                y: obs.y,
                width: obs.width,
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

window.PrometheusLevel = PrometheusLevel;

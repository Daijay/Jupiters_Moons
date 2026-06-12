// ============================================
// PHOEBE - The Captured Object
// Dark rocky asteroid, flying debris
// Level 8
// ============================================

const PhoebeLevel = {
    id: 'phoebe',
    name: 'Phoebe',
    designation: 'Saturn IX',
    distanceFromSaturn: '12,952,000 km',
    surfaceTemp: '-198°C (-324°F)',
    facts: [
        'Phoebe is a captured Kuiper Belt object, not a native Saturn moon ... it orbits backwards.',
        'The dark material from Phoebe creates a vast debris ring that falls onto Iapetus\'s leading side.',
        'Phoebe\'s irregular shape and retrograde orbit suggest it was captured by Saturn\'s gravity.',
        'Cassini\'s flyby in 2004 was the first close encounter, revealing a heavily cratered surface.'
    ],
    hazardWarning: 'Phoebe\'s unstable orbit sheds dark debris constantly. Flying rock fragments approach at high velocity from multiple angles. Stay alert.',
    missionControlMessage: `Cassini, you're leaving the inner Saturn system.

Phoebe is way out there ... almost 13 million kilometers from Saturn. And it doesn't belong here.

This moon orbits backwards. Wrong direction. That's not how moons form. Phoebe was captured ... dragged in from the outer solar system billions of years ago.

It's been shedding material ever since. Dark debris spreading across the entire Saturn system.

Watch for incoming fragments. This one's hostile.

Mission Control out.`,

    baseSpeed: 7.5,
    speedIncrement: 0.0011,
    maxSpeed: 13,
    gravity: 0.55,
    jumpForce: -14,

    colors: {
        sky: ['#020204', '#050508', '#08080c'],
        ground: '#252020',
        groundAccent: '#1a1515',
        rock: '#302828',
        debris: '#404040'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.flyingDebris = [];
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 140;
        this.lastDebris = 0;
        this.debrisInterval = 80;
        this.backgroundRocks = this.generateBackgroundRocks();
    },

    generateBackgroundRocks() {
        const rocks = [];
        for (let i = 0; i < 20; i++) {
            rocks.push({
                x: Math.random() * this.canvas.width * 2,
                y: this.canvas.height * (0.2 + Math.random() * 0.4),
                size: 20 + Math.random() * 60,
                rotation: Math.random() * Math.PI * 2,
                layer: Math.floor(Math.random() * 3)
            });
        }
        return rocks;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Update background rocks
        this.backgroundRocks.forEach(rock => {
            rock.x -= this.speed * (0.1 + rock.layer * 0.15);
            rock.rotation += 0.002;
            if (rock.x < -rock.size) {
                rock.x = this.canvas.width + Math.random() * 300;
                rock.y = this.canvas.height * (0.2 + Math.random() * 0.4);
            }
        });

        // Spawn ground obstacles
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 120 + Math.random() * 80;
        }

        // Spawn flying debris
        if (this.distance - this.lastDebris > this.debrisInterval) {
            this.spawnFlyingDebris();
            this.lastDebris = this.distance;
            this.debrisInterval = 60 + Math.random() * 60;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            return obs.x > -obs.width;
        });

        // Update flying debris
        this.flyingDebris = this.flyingDebris.filter(d => {
            d.x += d.vx;
            d.y += d.vy;
            d.rotation += d.rotationSpeed;
            return d.x > -d.size && d.x < this.canvas.width + d.size &&
                d.y > -d.size && d.y < this.canvas.height + d.size;
        });

        return [...this.obstacles, ...this.flyingDebris.map(d => ({
            type: 'flying_debris',
            x: d.x - d.size / 2,
            y: d.y - d.size / 2,
            width: d.size,
            height: d.size,
            dangerous: true
        }))];
    },

    spawnObstacle() {
        this.obstacles.push({
            type: 'jagged_rock',
            x: this.canvas.width + 50,
            y: this.groundY - 50 - Math.random() * 50,
            width: 45 + Math.random() * 35,
            height: 50 + Math.random() * 50,
            dangerous: true
        });
    },

    spawnFlyingDebris() {
        const fromRight = Math.random() > 0.3;
        const targetY = this.groundY - 50 - Math.random() * 150;

        this.flyingDebris.push({
            x: fromRight ? this.canvas.width + 50 : -50,
            y: fromRight ? Math.random() * this.canvas.height * 0.3 : targetY,
            vx: fromRight ? -this.speed * 1.5 - Math.random() * 3 : this.speed * 0.5 + Math.random() * 2,
            vy: fromRight ? 2 + Math.random() * 3 : (Math.random() - 0.5) * 2,
            size: 15 + Math.random() * 25,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            vertices: this.generateRockVertices()
        });
    },

    generateRockVertices() {
        const vertices = [];
        const points = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = 0.6 + Math.random() * 0.4;
            vertices.push({
                angle: angle,
                radius: radius
            });
        }
        return vertices;
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Deep space background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, this.colors.sky[0]);
        skyGradient.addColorStop(0.5, this.colors.sky[1]);
        skyGradient.addColorStop(1, this.colors.sky[2]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Distant stars (fewer, dimmer)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 60; i++) {
            const x = (i * 43 + this.distance * 0.01) % canvas.width;
            const y = (i * 23) % (canvas.height * 0.5);
            ctx.beginPath();
            ctx.arc(x, y, (i % 2) * 0.3 + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Background floating rocks
        this.backgroundRocks
            .sort((a, b) => a.layer - b.layer)
            .forEach(rock => this.renderBackgroundRock(rock));

        // Phoebe ring dust (faint)
        for (let i = 0; i < 50; i++) {
            const x = (i * 37 + this.distance * 0.3) % canvas.width;
            const y = canvas.height * 0.3 + Math.sin(i * 0.5 + this.distance * 0.005) * 50;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(60, 50, 50, ${0.2 + Math.random() * 0.2})`;
            ctx.fill();
        }

        // Ground (dark, rocky)
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ground texture
        for (let i = 0; i < 40; i++) {
            const x = (i * 47 + this.distance * 0.9) % canvas.width;
            ctx.fillStyle = this.colors.groundAccent;
            ctx.beginPath();
            ctx.moveTo(x, this.groundY + 5);
            ctx.lineTo(x + 10, this.groundY + 15);
            ctx.lineTo(x + 25, this.groundY + 10);
            ctx.lineTo(x + 15, this.groundY + 5);
            ctx.fill();
        }

        // Render ground obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs));

        // Render flying debris
        this.flyingDebris.forEach(d => this.renderDebris(d));

        // Warning indicators for incoming debris
        this.flyingDebris.forEach(d => {
            if (d.x > canvas.width - 100 && d.vx < 0) {
                // Warning arrow
                ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
                ctx.beginPath();
                ctx.moveTo(canvas.width - 20, d.y);
                ctx.lineTo(canvas.width - 35, d.y - 10);
                ctx.lineTo(canvas.width - 35, d.y + 10);
                ctx.fill();
            }
        });
    },

    renderBackgroundRock(rock) {
        const ctx = this.ctx;
        const opacity = 0.2 + rock.layer * 0.15;

        ctx.save();
        ctx.translate(rock.x, rock.y);
        ctx.rotate(rock.rotation);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rock.size);
        gradient.addColorStop(0, `rgba(60, 50, 50, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(40, 35, 35, ${opacity})`);
        gradient.addColorStop(1, `rgba(25, 20, 20, ${opacity * 0.5})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();

        const points = 7;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = rock.size * (0.6 + Math.sin(angle * 3) * 0.2);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.fill();

        ctx.restore();
    },

    renderObstacle(obs) {
        const ctx = this.ctx;

        // Jagged rock formation
        const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
        gradient.addColorStop(0, '#201818');
        gradient.addColorStop(0.4, '#302525');
        gradient.addColorStop(0.7, '#3a3030');
        gradient.addColorStop(1, '#453838');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);

        // Jagged top
        const points = 5;
        for (let i = 0; i <= points; i++) {
            const px = obs.x + (obs.width / points) * i;
            const py = obs.y + Math.random() * obs.height * 0.3;
            ctx.lineTo(px, py);
        }

        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        // Rock texture lines
        ctx.strokeStyle = 'rgba(20, 15, 15, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * (0.2 + i * 0.3), obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * (0.25 + i * 0.25), obs.y + 10);
            ctx.stroke();
        }
    },

    renderDebris(d) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);

        // Irregular rock shape
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, d.size);
        gradient.addColorStop(0, '#505050');
        gradient.addColorStop(0.5, '#383030');
        gradient.addColorStop(1, '#252020');

        ctx.fillStyle = gradient;
        ctx.beginPath();

        d.vertices.forEach((v, i) => {
            const x = Math.cos(v.angle) * d.size * v.radius;
            const y = Math.sin(v.angle) * d.size * v.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.closePath();
        ctx.fill();

        // Motion blur effect
        ctx.strokeStyle = 'rgba(80, 70, 70, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d.size * 0.5, 0);
        ctx.lineTo(d.size * 1.5, 0);
        ctx.stroke();

        ctx.restore();
    },

    getCollisionBox(obs) {
        return {
            x: obs.x + 3,
            y: obs.y + 3,
            width: obs.width - 6,
            height: obs.height - 6
        };
    }
};

window.PhoebeLevel = PhoebeLevel;

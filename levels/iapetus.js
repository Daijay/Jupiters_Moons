// ============================================
// IAPETUS - The Two-Faced Moon
// Terrain flips between black and white
// Level 7
// ============================================

const IapetusLevel = {
    id: 'iapetus',
    name: 'Iapetus',
    designation: 'Saturn VIII',
    distanceFromSaturn: '3,560,820 km',
    surfaceTemp: '-143°C to -173°C (-226°F to -279°F)',
    facts: [
        'One hemisphere reflects 50% of sunlight while the other reflects only 3% ... the most extreme contrast in the solar system.',
        'The dark material is likely dust from Phoebe\'s ring that falls onto Iapetus\'s leading hemisphere.',
        'Iapetus has an enormous equatorial ridge up to 20 km high ... taller than Olympus Mons on Mars.',
        'Giovanni Cassini discovered Iapetus in 1671 and noted he could only see it on one side of Saturn.'
    ],
    hazardWarning: 'Iapetus\'s surface dramatically shifts between pitch black and brilliant white at unpredictable intervals. Visibility disruption is severe ... maintain focus through the transitions.',
    missionControlMessage: `Cassini, you're approaching the strangest moon in the Saturn system.

Iapetus. The two-faced moon. One side is as dark as coal, the other as bright as snow.

We've known about this since 1671 when Giovanni Cassini himself noticed he could only see it on one side of Saturn. The dark side was invisible.

Now we need to know why. What's covering half this moon in darkness?

Prepare for visual disruption. The contrast will be... disorienting.

Mission Control out.`,

    baseSpeed: 7,
    speedIncrement: 0.001,
    maxSpeed: 12,
    gravity: 0.55,
    jumpForce: -14,

    colors: {
        skyDark: ['#000000', '#050505', '#080808'],
        skyLight: ['#202030', '#303040', '#404050'],
        groundDark: '#1a1008',
        groundLight: '#f0f0f0',
        equatorialRidge: '#505050'
    },

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.obstacles = [];
        this.groundY = canvas.height * 0.75;
        this.distance = 0;
        this.speed = this.baseSpeed;
        this.lastObstacle = 0;
        this.obstacleInterval = 160;
        this.isDarkSide = true;
        this.transitionTimer = 0;
        this.transitionDuration = 500;
        this.sideChangeInterval = 300;
        this.lastSideChange = 0;
        this.transitionProgress = 0;
        this.isTransitioning = false;
    },

    update(deltaTime, playerY) {
        this.distance += this.speed;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * this.speedIncrement);

        // Check for side transition
        if (this.distance - this.lastSideChange > this.sideChangeInterval && !this.isTransitioning) {
            this.isTransitioning = true;
            this.transitionTimer = 0;
            this.lastSideChange = this.distance;
            this.sideChangeInterval = 250 + Math.random() * 200;
        }

        // Handle transition
        if (this.isTransitioning) {
            this.transitionTimer += deltaTime || 16;
            this.transitionProgress = Math.min(this.transitionTimer / this.transitionDuration, 1);

            if (this.transitionProgress >= 1) {
                this.isDarkSide = !this.isDarkSide;
                this.isTransitioning = false;
                this.transitionProgress = 0;
            }
        }

        // Spawn obstacles
        if (this.distance - this.lastObstacle > this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacle = this.distance;
            this.obstacleInterval = 140 + Math.random() * 100;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            return obs.x > -obs.width;
        });

        return this.obstacles;
    },

    spawnObstacle() {
        const types = ['ridge_section', 'terrain_block'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'ridge_section') {
            // Equatorial ridge
            this.obstacles.push({
                type: 'ridge_section',
                x: this.canvas.width + 50,
                y: this.groundY - 80 - Math.random() * 40,
                width: 50 + Math.random() * 40,
                height: 80 + Math.random() * 40,
                dangerous: true
            });
        } else {
            this.obstacles.push({
                type: 'terrain_block',
                x: this.canvas.width + 50,
                y: this.groundY - 50 - Math.random() * 40,
                width: 40 + Math.random() * 30,
                height: 50 + Math.random() * 40,
                dangerous: true,
                isDark: this.isDarkSide
            });
        }
    },

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Calculate current visual state
        let visualDark = this.isDarkSide;
        let blendFactor = 0;

        if (this.isTransitioning) {
            blendFactor = this.transitionProgress;
            // Flash effect during transition
            if (blendFactor > 0.4 && blendFactor < 0.6) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                return;
            }
        }

        const effectiveDark = this.isTransitioning ?
            (blendFactor < 0.5 ? this.isDarkSide : !this.isDarkSide) :
            this.isDarkSide;

        // Sky
        const skyColors = effectiveDark ? this.colors.skyDark : this.colors.skyLight;
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, skyColors[0]);
        skyGradient.addColorStop(0.5, skyColors[1]);
        skyGradient.addColorStop(1, skyColors[2]);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars (more visible on dark side)
        const starOpacity = effectiveDark ? 0.8 : 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity})`;
        for (let i = 0; i < 100; i++) {
            const x = (i * 31 + this.distance * 0.02) % canvas.width;
            const y = (i * 19) % (canvas.height * 0.6);
            ctx.beginPath();
            ctx.arc(x, y, (i % 3) * 0.4 + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Equatorial ridge in background
        this.renderEquatorialRidge(effectiveDark);

        // Ground
        const groundColor = effectiveDark ? this.colors.groundDark : this.colors.groundLight;
        ctx.fillStyle = groundColor;
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Ground texture
        if (effectiveDark) {
            // Dark side - organic material texture
            for (let i = 0; i < 30; i++) {
                const x = (i * 53 + this.distance * 0.8) % canvas.width;
                ctx.fillStyle = `rgba(30, 20, 10, ${0.3 + Math.random() * 0.3})`;
                ctx.fillRect(x, this.groundY + 5, 20 + Math.random() * 30, 3);
            }
        } else {
            // Light side - ice texture
            for (let i = 0; i < 30; i++) {
                const x = (i * 53 + this.distance * 0.8) % canvas.width;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`;
                ctx.fillRect(x, this.groundY + 5, 20 + Math.random() * 30, 2);
            }
        }

        // Render obstacles
        this.obstacles.forEach(obs => this.renderObstacle(obs, effectiveDark));

        // Transition effect overlay
        if (this.isTransitioning) {
            const flashIntensity = Math.sin(this.transitionProgress * Math.PI);
            ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.3})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Screen tear effect
            for (let i = 0; i < 10; i++) {
                const y = Math.random() * canvas.height;
                const offset = (Math.random() - 0.5) * 50 * flashIntensity;
                ctx.drawImage(canvas, 0, y, canvas.width, 5, offset, y, canvas.width, 5);
            }
        }
    },

    renderEquatorialRidge(isDark) {
        const ctx = this.ctx;
        const ridgeY = this.canvas.height * 0.5;
        const ridgeHeight = 60;

        // Ridge silhouette
        const ridgeColor = isDark ? '#0a0805' : '#a0a0a0';
        const ridgeHighlight = isDark ? '#151010' : '#c0c0c0';

        ctx.fillStyle = ridgeColor;
        ctx.beginPath();
        ctx.moveTo(0, ridgeY + ridgeHeight);

        for (let x = 0; x < this.canvas.width; x += 30) {
            const peakHeight = ridgeHeight * (0.6 + Math.sin((x + this.distance * 0.2) * 0.02) * 0.4);
            ctx.lineTo(x, ridgeY + ridgeHeight - peakHeight);
        }

        ctx.lineTo(this.canvas.width, ridgeY + ridgeHeight);
        ctx.closePath();
        ctx.fill();

        // Ridge highlight
        ctx.strokeStyle = ridgeHighlight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < this.canvas.width; x += 30) {
            const peakHeight = ridgeHeight * (0.6 + Math.sin((x + this.distance * 0.2) * 0.02) * 0.4);
            if (x === 0) ctx.moveTo(x, ridgeY + ridgeHeight - peakHeight);
            else ctx.lineTo(x, ridgeY + ridgeHeight - peakHeight);
        }
        ctx.stroke();
    },

    renderObstacle(obs, effectiveDark) {
        const ctx = this.ctx;

        if (obs.type === 'ridge_section') {
            // Part of the equatorial ridge
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);
            if (effectiveDark) {
                gradient.addColorStop(0, '#1a1510');
                gradient.addColorStop(0.5, '#252015');
                gradient.addColorStop(1, '#302518');
            } else {
                gradient.addColorStop(0, '#808080');
                gradient.addColorStop(0.5, '#a0a0a0');
                gradient.addColorStop(1, '#c0c0c0');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.2, obs.y + obs.height * 0.4);
            ctx.lineTo(obs.x + obs.width * 0.4, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.6, obs.y + obs.height * 0.1);
            ctx.lineTo(obs.x + obs.width * 0.8, obs.y + obs.height * 0.3);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

        } else if (obs.type === 'terrain_block') {
            // Terrain that matches current side
            const gradient = ctx.createLinearGradient(obs.x, obs.y + obs.height, obs.x, obs.y);

            if (effectiveDark) {
                gradient.addColorStop(0, '#100805');
                gradient.addColorStop(0.5, '#1a1008');
                gradient.addColorStop(1, '#25150a');
            } else {
                gradient.addColorStop(0, '#d0d0d0');
                gradient.addColorStop(0.5, '#e8e8e8');
                gradient.addColorStop(1, '#ffffff');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x + 5, obs.y + obs.height * 0.3);
            ctx.lineTo(obs.x + obs.width * 0.4, obs.y);
            ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height * 0.2);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height * 0.5);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();

            // Surface detail
            if (effectiveDark) {
                ctx.strokeStyle = 'rgba(40, 30, 20, 0.5)';
            } else {
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * 0.3, obs.y + obs.height);
            ctx.lineTo(obs.x + obs.width * 0.4, obs.y + 5);
            ctx.stroke();
        }
    },

    getCollisionBox(obs) {
        return {
            x: obs.x + 5,
            y: obs.y,
            width: obs.width - 10,
            height: obs.height
        };
    }
};

window.IapetusLevel = IapetusLevel;

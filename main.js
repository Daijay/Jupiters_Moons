// ============================================
// JUPITER'S MOONS - Main Game Controller
// Developed by Jayden and Baraa
// A Galileo Mission
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('level-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.titleCanvas = null;
        this.titleCtx = null;

        this.currentLevel = 0;
        this.levels = [
            IoLevel,
            EuropaLevel,
            GanymedeLevel,
            CallistoLevel
        ];

        this.player = {
            x: 150,
            y: 0,
            width: 50,
            height: 35,
            velocityY: 0,
            isJumping: false,
            isGrounded: false
        };

        this.gameState = 'title';
        this.completedLevels = [];
        this.distance = 0;
        this.levelDistance = 5000;

        this.cutsceneManager = new CutsceneManager();
        this.transitionManager = new TransitionManager();
        this.dossierManager = new DossierManager();
        this.deathScreenManager = new DeathScreenManager();

        this.mapCanvas = document.getElementById('map-canvas');
        this.mapCtx = this.mapCanvas.getContext('2d');

        this.init();
    }

    async init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        await GameImages.load();
        this.setupTitleScreen();
        this.setupEventListeners();
        this.gameLoop();
    }

    resize() {
        const screens = ['level-canvas', 'map-canvas', 'cutscene-canvas'];
        screens.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        });

        if (this.titleCanvas) {
            this.titleCanvas.width = window.innerWidth;
            this.titleCanvas.height = window.innerHeight;
        }
    }

    setupTitleScreen() {
        const container = document.getElementById('title-bg-canvas');
        this.titleCanvas = document.createElement('canvas');
        this.titleCanvas.width = window.innerWidth;
        this.titleCanvas.height = window.innerHeight;
        container.appendChild(this.titleCanvas);
        this.titleCtx = this.titleCanvas.getContext('2d');

        this.titleStars = [];
        for (let i = 0; i < 400; i++) {
            this.titleStars.push({
                x: Math.random() * this.titleCanvas.width,
                y: Math.random() * this.titleCanvas.height,
                size: Math.random() * 2.5 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.05 + 0.02,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }

        this.shootingStars = [];
        this.titleParticles = [];
        this.nebulaOffset = 0;
        this.jupiterAngle = 0;
        this.jupiterScale = 1;
        this.bandOffset = 0;
    }

    setupEventListeners() {
        document.getElementById('play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.startGame();
        });
        document.getElementById('begin-mission-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.beginMission();
        });
        document.getElementById('retry-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.retryLevel();
        });
        document.getElementById('abort-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.abortToMap();
        });

        const handleInput = (e) => {
            if (e.target.tagName === 'BUTTON') return;

            console.log('handleInput called, gameState:', this.gameState);

            if (this.gameState === 'title') {
                this.startGame();
            } else if (this.gameState === 'playing') {
                this.jump();
            } else if (this.gameState === 'cutscene') {
                console.log('Calling cutsceneManager.skipToNext()');
                this.cutsceneManager.skipToNext();
            }
        };

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleInput(e);
            }
        });

        document.addEventListener('click', (e) => {
            handleInput(e);
        });

        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                handleInput(e);
            }
        });
    }

    async startGame() {
        if (this.gameState !== 'title') return;
        this.gameState = 'cutscene';

        await this.transitionManager.transitionTo('cutscene');
        this.cutsceneManager.init('cutscene-canvas');

        await new Promise(resolve => {
            this.cutsceneManager.playOpeningCutscene(resolve);
        });

        this.showSystemMap(true);
    }

    async showSystemMap(firstTime = false) {
        await this.transitionManager.transitionTo('map');
        this.gameState = 'map';

        if (firstTime) {
            await this.animateMapIntro();
        }

        await this.delay(1000);
        this.showDossier();
    }

    async animateMapIntro() {
        const startTime = performance.now();
        const duration = 3000;

        await new Promise(resolve => {
            const animate = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.renderSystemMap(progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    renderSystemMap(animProgress = 1) {
        const ctx = this.mapCtx;
        const canvas = this.mapCanvas;

        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        for (let i = 0; i < 200; i++) {
            const x = (i * 37) % canvas.width;
            const y = (i * 23) % canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, (i % 3) * 0.3 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 5) * 0.1})`;
            ctx.fill();
        }

        const centerX = canvas.width * 0.5;
        const centerY = canvas.height * 0.5;

        // Jupiter on map
        this.drawJupiterOnMap(centerX, centerY, 80 * animProgress);

        // Galilean moon positions
        const moonPositions = [
            { name: 'Io',       angle: 0.3,  dist: 120, size: 9,  color: '#d4a010' },
            { name: 'Europa',   angle: 1.3,  dist: 150, size: 8,  color: '#d8eaf5' },
            { name: 'Ganymede', angle: 2.4,  dist: 190, size: 12, color: '#808090' },
            { name: 'Callisto', angle: 3.8,  dist: 240, size: 10, color: '#404040' }
        ];

        moonPositions.forEach((moon, index) => {
            const x = centerX + Math.cos(moon.angle) * moon.dist * animProgress;
            const y = centerY + Math.sin(moon.angle) * moon.dist * 0.3 * animProgress;

            // Orbit line
            ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, moon.dist, moon.dist * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();

            const isCompleted = this.completedLevels.includes(index);
            const isCurrent = index === this.currentLevel;

            ctx.beginPath();
            ctx.arc(x, y, moon.size * animProgress, 0, Math.PI * 2);

            if (isCompleted) {
                ctx.fillStyle = '#00ff00';
            } else if (isCurrent) {
                ctx.fillStyle = moon.color;
                ctx.shadowColor = moon.color;
                ctx.shadowBlur = 20;
            } else {
                ctx.fillStyle = `rgba(${this.hexToRgb(moon.color)}, 0.5)`;
            }

            ctx.fill();
            ctx.shadowBlur = 0;

            if (animProgress > 0.5) {
                ctx.font = '12px "Space Mono", monospace';
                ctx.fillStyle = isCurrent ? '#d4a853' : '#808080';
                ctx.textAlign = 'center';
                ctx.fillText(moon.name.toUpperCase(), x, y + moon.size + 15);
            }
        });

        // Mission path
        if (animProgress > 0.7) {
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();

            for (let i = 0; i <= this.currentLevel && i < moonPositions.length; i++) {
                const moon = moonPositions[i];
                const x = centerX + Math.cos(moon.angle) * moon.dist;
                const y = centerY + Math.sin(moon.angle) * moon.dist * 0.3;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.font = '14px "Space Mono", monospace';
        ctx.fillStyle = '#d4a853';
        ctx.textAlign = 'left';
        ctx.fillText(`SURVEYS COMPLETED: ${this.completedLevels.length}/4`, 30, 80);
    }

    drawJupiterOnMap(x, y, radius) {
        const ctx = this.mapCtx;

        // Planet body
        const gradient = ctx.createRadialGradient(x - radius * 0.3, y, 0, x, y, radius);
        gradient.addColorStop(0, '#e8d0a0');
        gradient.addColorStop(0.4, '#c8a870');
        gradient.addColorStop(0.7, '#a87840');
        gradient.addColorStop(1, '#704820');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Atmospheric bands
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();
        const bandColors = ['rgba(160,100,50,0.4)', 'rgba(220,185,130,0.3)', 'rgba(130,70,30,0.5)', 'rgba(200,160,100,0.35)'];
        for (let i = 0; i < 6; i++) {
            const by = y - radius + (radius * 2 / 6) * i;
            ctx.fillStyle = bandColors[i % bandColors.length];
            ctx.fillRect(x - radius, by, radius * 2, radius * 0.3);
        }
        // Great Red Spot
        ctx.fillStyle = 'rgba(180, 70, 40, 0.6)';
        ctx.beginPath();
        ctx.ellipse(x + radius * 0.2, y + radius * 0.15, radius * 0.28, radius * 0.13, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Faint rings (much thinner than Saturn's)
        ctx.beginPath();
        ctx.ellipse(x, y, radius * 1.4, radius * 1.4 * 0.08, 0, Math.PI, 0, true);
        ctx.ellipse(x, y, radius * 1.15, radius * 1.15 * 0.08, 0, 0, Math.PI, false);
        ctx.fillStyle = 'rgba(180, 160, 130, 0.25)';
        ctx.fill();
    }

    async showDossier() {
        const levelData = this.levels[this.currentLevel];
        this.dossierManager.displayMoonData(levelData);

        await this.transitionManager.transitionTo('dossier');
        this.gameState = 'dossier';
    }

    async beginMission() {
        const levelData = this.levels[this.currentLevel];
        this.gameState = 'cutscene';

        await this.transitionManager.transitionTo('cutscene');
        this.cutsceneManager.init('cutscene-canvas');

        await new Promise(resolve => {
            this.cutsceneManager.playArrivalCutscene(levelData, resolve);
        });

        await this.transitionManager.transitionTo('game');
        await this.showCountdown();
        this.startLevel();
    }

    async showCountdown() {
        const countdown = document.getElementById('countdown');
        const number = document.getElementById('countdown-number');
        const moonLabel = document.getElementById('countdown-moon-label');
        const levelData = this.levels[this.currentLevel];

        if (moonLabel && levelData) {
            moonLabel.textContent = levelData.name.toUpperCase();
        }
        // Also update HUD moon name immediately so it's correct during countdown
        const hudMoon = document.getElementById('current-moon');
        if (hudMoon && levelData) {
            hudMoon.textContent = levelData.name.toUpperCase();
        }

        for (let i = 3; i >= 1; i--) {
            number.textContent = i;
            countdown.classList.remove('hidden');
            countdown.style.animation = 'none';
            countdown.offsetHeight;
            countdown.style.animation = 'countdownPulse 1s ease-in-out';

            await this.delay(1000);
        }

        countdown.classList.add('hidden');
    }

    startLevel() {
        const level = this.levels[this.currentLevel];
        level.init(this.canvas, this.ctx);

        this.player.y = level.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;

        this.distance = 0;
        this.gameState = 'playing';

        document.getElementById('current-moon').textContent = level.name.toUpperCase();
    }

    jump() {
        if (this.player.isGrounded && this.gameState === 'playing') {
            const level = this.levels[this.currentLevel];
            this.player.velocityY = level.jumpForce;
            this.player.isGrounded = false;
            this.player.isJumping = true;
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        const level = this.levels[this.currentLevel];

        this.player.velocityY += level.gravity;
        this.player.y += this.player.velocityY;

        if (this.player.y >= level.groundY - this.player.height) {
            this.player.y = level.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.isGrounded = true;
            this.player.isJumping = false;
        }

        const obstacles = level.update(deltaTime, this.player.y);

        const playerBox = {
            x: this.player.x + 10,
            y: this.player.y + 5,
            width: this.player.width - 20,
            height: this.player.height - 10
        };

        for (const obs of obstacles) {
            if (!obs.dangerous) continue;

            const obsBox = level.getCollisionBox(obs);
            if (!obsBox) continue;

            if (this.checkCollision(playerBox, obsBox)) {
                if (obsBox.isGap) {
                    if (this.player.y + this.player.height > obsBox.y) {
                        this.playerDied();
                        return;
                    }
                } else {
                    this.playerDied();
                    return;
                }
            }
        }

        if (this.player.y > this.canvas.height) {
            this.playerDied();
            return;
        }

        this.distance += level.speed;
        document.getElementById('distance-traveled').textContent =
            `${Math.floor(this.distance / 10)} km`;

        if (this.distance >= this.levelDistance) {
            this.levelComplete();
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    async playerDied() {
        this.gameState = 'dead';

        const levelData = this.levels[this.currentLevel];
        await this.transitionManager.transitionTo('death');
        this.deathScreenManager.show(
            levelData,
            () => this.retryLevel(),
            () => this.abortToMap()
        );
    }

    async retryLevel() {
        await this.transitionManager.transitionTo('game');
        await this.showCountdown();
        this.startLevel();
    }

    async abortToMap() {
        this.showSystemMap();
    }

    async levelComplete() {
        this.gameState = 'complete';

        const levelData = this.levels[this.currentLevel];
        this.completedLevels.push(this.currentLevel);

        await this.transitionManager.transitionTo('complete');
        document.getElementById('complete-moon-name').textContent = levelData.name.toUpperCase();

        this.createCelebrationParticles();

        await this.delay(3000);

        if (this.currentLevel >= 3) {
            await this.playEndingSequence();
        } else {
            this.currentLevel++;
            this.showSystemMap();
        }
    }

    createCelebrationParticles() {
        const container = document.getElementById('complete-particles');
        container.innerHTML = '';

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                left: ${50 + (Math.random() - 0.5) * 200}%;
                top: ${50 + (Math.random() - 0.5) * 200}%;
                width: ${5 + Math.random() * 10}px;
                height: ${5 + Math.random() * 10}px;
                background: ${['#d4a853', '#00ff00', '#ffffff', '#00d4ff'][Math.floor(Math.random() * 4)]};
                animation-delay: ${Math.random() * 0.5}s;
            `;
            container.appendChild(particle);
        }
    }

    async playEndingSequence() {
        await this.transitionManager.transitionTo('cutscene');
        this.cutsceneManager.init('cutscene-canvas');

        await new Promise(resolve => {
            this.cutsceneManager.playEndingCutscene(resolve);
        });

        this.showCredits();
    }

    showCredits() {
        this.transitionManager.transitionTo('credits');

        const creditsScroll = document.getElementById('credits-scroll');
        creditsScroll.innerHTML = `
            <h1>JUPITER'S MOONS</h1>
            <p>A Galileo Mission</p>

            <h2>DEVELOPED BY</h2>
            <p>Jayden</p>
            <p>Baraa</p>

            <h2>GALILEO MISSION MILESTONES</h2>

            <div class="milestone"><span class="year">Oct 18, 1989</span><span class="event">Launch from Kennedy Space Center aboard Space Shuttle Atlantis</span></div>
            <div class="milestone"><span class="year">Feb 1990</span><span class="event">Venus flyby — gravity assist</span></div>
            <div class="milestone"><span class="year">Dec 1990</span><span class="event">First Earth flyby — gravity assist</span></div>
            <div class="milestone"><span class="year">Oct 1991</span><span class="event">Asteroid Gaspra flyby — first close-up of an asteroid</span></div>
            <div class="milestone"><span class="year">Dec 1992</span><span class="event">Second Earth flyby — final gravity assist</span></div>
            <div class="milestone"><span class="year">Jul 1994</span><span class="event">Observed Comet Shoemaker–Levy 9 impact Jupiter</span></div>
            <div class="milestone"><span class="year">Dec 7, 1995</span><span class="event">Jupiter orbit insertion — atmospheric probe released</span></div>
            <div class="milestone"><span class="year">1996</span><span class="event">First close flybys of Io, Europa, Ganymede, Callisto</span></div>
            <div class="milestone"><span class="year">1997</span><span class="event">Evidence of Europa's subsurface ocean confirmed</span></div>
            <div class="milestone"><span class="year">1998</span><span class="event">Ganymede's magnetic field confirmed</span></div>
            <div class="milestone"><span class="year">1999</span><span class="event">Io volcanic activity imaged in unprecedented detail</span></div>
            <div class="milestone"><span class="year">2000</span><span class="event">Cassini joint observations of Jupiter during flyby</span></div>
            <div class="milestone"><span class="year">2001</span><span class="event">Extended mission — Galileo Millennium Mission</span></div>
            <div class="milestone"><span class="year">2002</span><span class="event">Final Io flyby — closest approach to a volcanic moon</span></div>
            <div class="milestone"><span class="year">Sep 21, 2003</span><span class="event">Final plunge into Jupiter's atmosphere — mission end</span></div>

            <h2>35 ORBITS. 8 YEARS.</h2>
            <p>Confirmed Europa's subsurface ocean.</p>
            <p>Changed the search for life forever.</p>

            <h2>THANK YOU FOR PLAYING</h2>
        `;
    }

    render() {
        if (this.gameState === 'title') {
            this.renderTitleScreen();
        } else if (this.gameState === 'map') {
            this.renderSystemMap();
        } else if (this.gameState === 'playing') {
            const level = this.levels[this.currentLevel];
            level.render();
            this.renderPlayer();
        }
    }

    renderTitleScreen() {
        if (!this.titleCtx) return;

        const ctx = this.titleCtx;
        const canvas = this.titleCanvas;
        const time = Date.now();

        // Real NASA nebula image — deep space background
        this.nebulaOffset += 0.0005;
        if (!GameImages.drawCover(ctx, 'nebula', 0, 0, canvas.width, canvas.height)) {
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Dark overlay to deepen space look and make stars visible
        ctx.fillStyle = 'rgba(5, 5, 20, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        this.titleStars.forEach(star => {
            star.x -= star.speed;
            if (star.x < 0) {
                star.x = canvas.width;
                star.y = Math.random() * canvas.height;
            }

            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.4 + 0.6;
            const finalBrightness = star.brightness * twinkle;

            if (star.size > 1.5 && finalBrightness > 0.6) {
                const starGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
                starGlow.addColorStop(0, `rgba(255, 255, 255, ${finalBrightness * 0.3})`);
                starGlow.addColorStop(0.5, `rgba(200, 220, 255, ${finalBrightness * 0.1})`);
                starGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = starGlow;
                ctx.fillRect(star.x - star.size * 4, star.y - star.size * 4, star.size * 8, star.size * 8);
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${finalBrightness})`;
            ctx.fill();
        });

        // Shooting stars
        if (Math.random() > 0.995) {
            this.shootingStars.push({
                x: canvas.width + 50,
                y: Math.random() * canvas.height * 0.5,
                speed: 15 + Math.random() * 10,
                length: 80 + Math.random() * 120,
                life: 1
            });
        }

        this.shootingStars = this.shootingStars.filter(star => {
            star.x -= star.speed;
            star.y += star.speed * 0.3;
            star.life -= 0.02;

            if (star.life > 0) {
                const gradient = ctx.createLinearGradient(
                    star.x, star.y,
                    star.x + star.length, star.y - star.length * 0.3
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life})`);
                gradient.addColorStop(0.3, `rgba(200, 220, 255, ${star.life * 0.5})`);
                gradient.addColorStop(1, 'transparent');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x + star.length, star.y - star.length * 0.3);
                ctx.stroke();
            }

            return star.life > 0 && star.x > -star.length;
        });

        // Jupiter — slowly breathing
        this.jupiterAngle += 0.001;
        this.jupiterScale = 1 + Math.sin(time * 0.0003) * 0.05;
        this.bandOffset += 0.0008;

        const jx = canvas.width * 0.5;
        const jy = canvas.height * 0.58;
        const jRadius = 160 * this.jupiterScale;

        // Outer atmosphere glow
        for (let i = 3; i >= 0; i--) {
            const glowRadius = jRadius * (1.3 + i * 0.2);
            const glow = ctx.createRadialGradient(jx, jy, jRadius * 0.8, jx, jy, glowRadius);
            glow.addColorStop(0, `rgba(200, 160, 80, ${0.08 - i * 0.015})`);
            glow.addColorStop(0.5, `rgba(160, 120, 50, ${0.04 - i * 0.008})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(jx, jy, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Real NASA Jupiter image — clipped to circle with breathing animation
        ctx.save();
        ctx.beginPath();
        ctx.arc(jx, jy, jRadius, 0, Math.PI * 2);
        ctx.clip();
        if (!GameImages.drawCover(ctx, 'jupiterOrbit', jx - jRadius, jy - jRadius, jRadius * 2, jRadius * 2)) {
            // Fallback: canvas-drawn Jupiter
            const bodyGradient = ctx.createRadialGradient(jx - jRadius * 0.3, jy - jRadius * 0.2, 0, jx, jy, jRadius);
            bodyGradient.addColorStop(0, '#f0e0c0');
            bodyGradient.addColorStop(0.5, '#c8a870');
            bodyGradient.addColorStop(1, '#603010');
            ctx.fillStyle = bodyGradient;
            ctx.fillRect(jx - jRadius, jy - jRadius, jRadius * 2, jRadius * 2);
        }
        ctx.restore();

        // Atmosphere shimmer overlay on top of image
        const shimmer = ctx.createRadialGradient(
            jx - jRadius * 0.4, jy - jRadius * 0.3, 0,
            jx, jy, jRadius
        );
        shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
        shimmer.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
        shimmer.addColorStop(1, 'transparent');
        ctx.fillStyle = shimmer;
        ctx.beginPath();
        ctx.arc(jx, jy, jRadius, 0, Math.PI * 2);
        ctx.fill();

        // Jupiter's faint ring system
        const ringOpacity = 0.15 + Math.sin(time * 0.001) * 0.03;
        ctx.save();

        // Back rings
        ctx.beginPath();
        ctx.ellipse(jx, jy, jRadius * 1.45, jRadius * 1.45 * 0.07, 0, Math.PI, 0);
        ctx.ellipse(jx, jy, jRadius * 1.18, jRadius * 1.18 * 0.07, 0, 0, Math.PI);
        ctx.fillStyle = `rgba(180, 160, 120, ${ringOpacity * 0.5})`;
        ctx.fill();

        // Front rings (over planet)
        ctx.beginPath();
        ctx.rect(jx - jRadius * 2, jy, jRadius * 4, jRadius * 2);
        ctx.clip();
        ctx.beginPath();
        ctx.ellipse(jx, jy, jRadius * 1.45, jRadius * 1.45 * 0.07, 0, 0, Math.PI);
        ctx.ellipse(jx, jy, jRadius * 1.18, jRadius * 1.18 * 0.07, 0, Math.PI, 0);
        ctx.fillStyle = `rgba(180, 160, 120, ${ringOpacity})`;
        ctx.fill();

        ctx.restore();

        // Lens flare
        const flareX = jx - jRadius * 0.7;
        const flareY = jy - jRadius * 0.5;
        const flareIntensity = 0.12 + Math.sin(time * 0.002) * 0.04;
        const flare = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 50);
        flare.addColorStop(0, `rgba(255, 240, 200, ${flareIntensity})`);
        flare.addColorStop(0.3, `rgba(255, 220, 150, ${flareIntensity * 0.5})`);
        flare.addColorStop(1, 'transparent');
        ctx.fillStyle = flare;
        ctx.fillRect(flareX - 50, flareY - 50, 100, 100);

        // Vignette
        const vignette = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
            canvas.width / 2, canvas.height / 2, canvas.height * 0.9
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Floating dust particles
        if (Math.random() > 0.95) {
            this.titleParticles.push({
                x: Math.random() * canvas.width,
                y: canvas.height + 10,
                size: 1 + Math.random() * 2,
                speedY: -0.5 - Math.random() * 1,
                speedX: (Math.random() - 0.5) * 0.5,
                opacity: 0.2 + Math.random() * 0.3
            });
        }

        this.titleParticles = this.titleParticles.filter(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.opacity -= 0.002;

            if (p.opacity > 0 && p.y > -10) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 180, 140, ${p.opacity})`;
                ctx.fill();
                return true;
            }
            return false;
        });
    }

    renderPlayer() {
        const ctx = this.ctx;
        const p = this.player;

        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

        const tilt = this.player.velocityY * 0.02;
        ctx.rotate(tilt);

        // Galileo probe body — spin-stabilized hexagonal bus
        ctx.fillStyle = '#b0b0b0';
        ctx.beginPath();
        ctx.roundRect(-p.width / 2 + 5, -p.height / 2 + 5, p.width - 10, p.height - 10, 4);
        ctx.fill();

        // Gold thermal blanket
        ctx.fillStyle = '#c8a040';
        ctx.fillRect(-p.width / 2 + 8, -p.height / 2 + 8, p.width - 16, p.height - 16);

        // Spin mechanism stripes (Galileo was spin-stabilized)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-p.width / 2 + 8, -p.height / 2 + 8 + i * 5, p.width - 16, 2);
        }

        // High-gain antenna dish (large, the famous one that didn't fully open)
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.ellipse(0, -p.height / 2 - 6, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Antenna ribs (folded dish structure)
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, -p.height / 2 - 6);
            ctx.lineTo(Math.cos(angle) * 18, -p.height / 2 - 6 + Math.sin(angle) * 7);
            ctx.stroke();
        }

        // Antenna feed horn
        ctx.fillStyle = '#707070';
        ctx.fillRect(-2, -p.height / 2 - 12, 4, 7);

        // Science boom (magnetometer / plasma wave antenna)
        ctx.strokeStyle = '#505050';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.width / 2 - 5, -2);
        ctx.lineTo(p.width / 2 + 18, -5);
        ctx.stroke();
        ctx.fillStyle = '#707070';
        ctx.fillRect(p.width / 2 + 16, -8, 5, 6);

        // RTG (two, on a shorter boom for Galileo)
        ctx.fillStyle = '#303030';
        ctx.beginPath();
        ctx.roundRect(-p.width / 2 - 12, 2, 12, 8, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-p.width / 2 - 12, -10, 12, 8, 2);
        ctx.fill();
        // RTG boom
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-p.width / 2 + 5, -2);
        ctx.lineTo(-p.width / 2 - 6, -2);
        ctx.stroke();

        // Engine glow when jumping
        if (this.player.isJumping && this.player.velocityY < 0) {
            const thrustGlow = ctx.createRadialGradient(0, p.height / 2 + 5, 0, 0, p.height / 2 + 5, 20);
            thrustGlow.addColorStop(0, 'rgba(100, 180, 255, 0.8)');
            thrustGlow.addColorStop(0.5, 'rgba(50, 120, 255, 0.4)');
            thrustGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = thrustGlow;
            ctx.fillRect(-20, p.height / 2, 40, 30);
        }

        ctx.restore();
    }

    gameLoop() {
        const now = performance.now();
        const deltaTime = now - (this.lastTime || now);
        this.lastTime = now;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '255, 255, 255';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

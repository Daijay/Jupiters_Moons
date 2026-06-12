// ============================================
// SATURN'S MOONS - Death Screen System
// Dramatic signal loss visualization
// ============================================

class DeathScreenManager {
    constructor() {
        this.screen = document.getElementById('death-screen');
        this.factElement = document.getElementById('death-fact');
        this.retryBtn = document.getElementById('retry-btn');
        this.abortBtn = document.getElementById('abort-btn');
        this.staticElement = document.querySelector('.death-static');
        this.signalLost = document.querySelector('.signal-lost');
    }

    show(moonData, onRetry, onAbort) {
        // Set real NASA space nebula as death screen background
        const img = GameImages.get('nebula');
        if (img) {
            this.screen.style.backgroundImage = `url('${img.src}')`;
            this.screen.style.backgroundSize = 'cover';
            this.screen.style.backgroundPosition = 'center';
        }

        // Display a random fact about the moon
        const randomFact = moonData.facts[Math.floor(Math.random() * moonData.facts.length)];
        this.factElement.textContent = `DID YOU KNOW? ${randomFact}`;

        // Add crack effect
        this.addCrackEffect();

        // Static noise animation
        this.startStaticNoise();

        // Signal lost glitch effect
        this.startGlitchEffect();

        // Button handlers
        this.retryBtn.onclick = () => {
            this.stopEffects();
            onRetry();
        };

        this.abortBtn.onclick = () => {
            this.stopEffects();
            onAbort();
        };
    }

    addCrackEffect() {
        const overlay = document.querySelector('.death-overlay');
        overlay.innerHTML = '';

        // Create SVG cracks
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';

        // Generate random cracks emanating from center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < 8; i++) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let d = `M ${centerX} ${centerY}`;

            let x = centerX;
            let y = centerY;
            const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;

            for (let j = 0; j < 5; j++) {
                const dist = 50 + Math.random() * 100;
                x += Math.cos(angle + (Math.random() - 0.5) * 0.5) * dist;
                y += Math.sin(angle + (Math.random() - 0.5) * 0.5) * dist;
                d += ` L ${x} ${y}`;

                // Branch cracks
                if (Math.random() > 0.5) {
                    const branchPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const branchAngle = angle + (Math.random() - 0.5) * 1.5;
                    let bx = x;
                    let by = y;
                    let bd = `M ${x} ${y}`;

                    for (let k = 0; k < 3; k++) {
                        const bdist = 20 + Math.random() * 40;
                        bx += Math.cos(branchAngle) * bdist;
                        by += Math.sin(branchAngle) * bdist;
                        bd += ` L ${bx} ${by}`;
                    }

                    branchPath.setAttribute('d', bd);
                    branchPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
                    branchPath.setAttribute('stroke-width', '1');
                    branchPath.setAttribute('fill', 'none');
                    svg.appendChild(branchPath);
                }
            }

            path.setAttribute('d', d);
            path.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            svg.appendChild(path);
        }

        overlay.appendChild(svg);
    }

    startStaticNoise() {
        this.staticInterval = setInterval(() => {
            const noise = [];
            for (let i = 0; i < 50; i++) {
                const y = Math.random() * 100;
                const opacity = Math.random() * 0.3;
                noise.push(`${y}% { background-position: 0 ${Math.random() * 100}%; opacity: ${opacity}; }`);
            }

            const style = document.createElement('style');
            style.textContent = `
                @keyframes staticNoise {
                    ${noise.join('\n')}
                }
            `;
            if (this.staticStyle) this.staticStyle.remove();
            this.staticStyle = style;
            document.head.appendChild(style);
        }, 100);
    }

    startGlitchEffect() {
        this.glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                this.signalLost.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 5}px)`;
                this.signalLost.style.textShadow = `
                    ${(Math.random() - 0.5) * 10}px 0 rgba(255, 0, 0, 0.8),
                    ${(Math.random() - 0.5) * 10}px 0 rgba(0, 255, 255, 0.8)
                `;
            } else {
                this.signalLost.style.transform = 'translate(0, 0)';
                this.signalLost.style.textShadow = '0 0 30px rgba(255, 68, 68, 0.8)';
            }
        }, 50);
    }

    stopEffects() {
        if (this.staticInterval) clearInterval(this.staticInterval);
        if (this.glitchInterval) clearInterval(this.glitchInterval);
        if (this.staticStyle) this.staticStyle.remove();
        this.signalLost.style.transform = 'translate(0, 0)';
    }
}

window.DeathScreenManager = DeathScreenManager;

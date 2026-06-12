// ============================================
// SATURN'S MOONS - Screen Transitions
// Smooth cinematic transitions between screens
// ============================================

class TransitionManager {
    constructor() {
        this.screens = {
            title: document.getElementById('title-screen'),
            cutscene: document.getElementById('cutscene-screen'),
            map: document.getElementById('map-screen'),
            dossier: document.getElementById('dossier-screen'),
            game: document.getElementById('game-screen'),
            complete: document.getElementById('complete-screen'),
            death: document.getElementById('death-screen'),
            credits: document.getElementById('credits-screen')
        };
        this.currentScreen = 'title';
    }

    async transitionTo(screenName, options = {}) {
        const { duration = 800, onMidpoint = null } = options;
        const currentElement = this.screens[this.currentScreen];
        const targetElement = this.screens[screenName];

        if (!targetElement) {
            console.error(`Screen ${screenName} not found`);
            return;
        }

        // Fade out current
        currentElement.style.transition = `opacity ${duration / 2}ms ease-out`;
        currentElement.style.opacity = '0';

        await this.delay(duration / 2);

        // Midpoint callback
        if (onMidpoint) onMidpoint();

        // Hide current, show target
        currentElement.classList.remove('active');
        currentElement.style.display = 'none';

        targetElement.style.opacity = '0';
        targetElement.style.display = 'flex';
        targetElement.classList.add('active');

        // Force reflow
        targetElement.offsetHeight;

        // Fade in target
        targetElement.style.transition = `opacity ${duration / 2}ms ease-in`;
        targetElement.style.opacity = '1';

        await this.delay(duration / 2);

        this.currentScreen = screenName;
    }

    async fadeToBlack(duration = 500) {
        const overlay = this.createOverlay();
        overlay.style.transition = `opacity ${duration}ms ease-out`;
        overlay.style.opacity = '1';
        await this.delay(duration);
        return overlay;
    }

    async fadeFromBlack(overlay, duration = 500) {
        overlay.style.transition = `opacity ${duration}ms ease-in`;
        overlay.style.opacity = '0';
        await this.delay(duration);
        overlay.remove();
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            opacity: 0;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.TransitionManager = TransitionManager;

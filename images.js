// ============================================
// JUPITER'S MOONS - NASA Image Preloader
// ============================================

const GameImages = {
    images: {},

    load() {
        const defs = {
            nebula:           'assets/images/space_nebula.jpg',
            jupiterOrbit:     'assets/images/jupiter_orbit.avif',
            jupiterAtmos:     'assets/images/jupiter_atmosphere.jpg',
            galileoLaunch:    'assets/images/galileo_launch.jpg',
            missionControl:   'assets/images/mission_control.jpg',
            ioPortrait:       'assets/images/io_portrait.webp',
            ioVolcanoes:      'assets/images/io_volcanoes.jpg',
            europaPortrait:   'assets/images/europa_portrait.jpg',
            europaSurface:    'assets/images/europa_surface.jpg',
            europaOcean:      'assets/images/europa_ocean.jpg',
            ganymedeFull:     'assets/images/ganymede_full.jpg',
            ganymedeSurface:  'assets/images/ganymede_surface.webp',
            callistoPortrait: 'assets/images/callisto_portrait.jpg',
            callistoSurface:  'assets/images/callisto_surface.jpg',
        };

        return Promise.all(Object.entries(defs).map(([key, src]) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this.images[key] = img; resolve(); };
            img.onerror = () => { console.warn('GameImages: failed to load', src); resolve(); };
            img.src = src;
        })));
    },

    get(key) {
        return this.images[key] || null;
    },

    // Draw image scaled to cover a rect (no stretching, crops to fill)
    drawCover(ctx, key, x, y, w, h, alpha) {
        const img = this.get(key);
        if (!img || !img.naturalWidth) return false;
        const prev = ctx.globalAlpha;
        if (alpha !== undefined) ctx.globalAlpha = alpha;
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const sw = img.naturalWidth * scale;
        const sh = img.naturalHeight * scale;
        ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
        ctx.globalAlpha = prev;
        return true;
    }
};

window.GameImages = GameImages;

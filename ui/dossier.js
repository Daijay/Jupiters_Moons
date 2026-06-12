// ============================================
// JUPITER'S MOONS - Mission Dossier System
// NASA-style briefing documents
// ============================================

class DossierManager {
    constructor() {
        this.moonName = document.getElementById('dossier-moon-name');
        this.designation = document.getElementById('dossier-designation');
        this.distance = document.getElementById('dossier-distance');
        this.temp = document.getElementById('dossier-temp');
        this.factsList = document.getElementById('dossier-facts-list');
        this.hazardText = document.getElementById('dossier-hazard-text');
        this.dateElement = document.querySelector('.dossier-date');
    }

    displayMoonData(moonData) {
        // Set real NASA moon portrait as dossier background
        const portraitKeys = { io: 'ioPortrait', europa: 'europaPortrait', ganymede: 'ganymedeFull', callisto: 'callistoPortrait' };
        const portraitKey = portraitKeys[moonData.id];
        const dossierScreen = document.getElementById('dossier-screen');
        if (portraitKey) {
            const img = GameImages.get(portraitKey);
            if (img) {
                dossierScreen.style.backgroundImage = `url('${img.src}')`;
                dossierScreen.style.backgroundSize = 'cover';
                dossierScreen.style.backgroundPosition = 'center';
            }
        }

        const missionYears = {
            'io': '1995-2002',
            'europa': '1996-2000',
            'ganymede': '1996-2000',
            'callisto': '1996-2001'
        };

        this.dateElement.textContent = `MISSION PERIOD: ${missionYears[moonData.id] || '1995-2003'}`;

        this.moonName.textContent = moonData.name.toUpperCase();
        this.moonName.style.animation = 'none';
        this.moonName.offsetHeight;
        this.moonName.style.animation = 'dossierSlideIn 0.5s ease-out';

        this.designation.textContent = moonData.designation;
        this.distance.textContent = moonData.distanceFromJupiter;
        this.temp.textContent = moonData.surfaceTemp;

        this.factsList.innerHTML = '';
        moonData.facts.forEach((fact, index) => {
            const li = document.createElement('li');
            li.textContent = fact;
            li.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
            this.factsList.appendChild(li);
        });

        this.hazardText.textContent = moonData.hazardWarning;
        this.hazardText.parentElement.style.animation = 'none';
        this.hazardText.parentElement.offsetHeight;
        this.hazardText.parentElement.style.animation = 'dossierSlideIn 0.5s ease-out 0.4s both';
    }
}

window.DossierManager = DossierManager;

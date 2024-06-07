class ProcessLoader {
    constructor() {
        this.sections = [];
        this.currentSectionIndex = 0;
        this.loaderOverlay = document.getElementById('loader-overlay');
    }

    initializeLoader() {
        if (this.loaderOverlay) {
            this.loaderOverlay.style.display = 'flex'; // Zeige den Loader an
        }
    }

    addProcess(name) {
        this.sections.push({ name });
    }

    startProcess(name) {
        const section = this.sections.find(sec => sec.name === name);
        if (section) {
            section.startTime = Date.now();
            this.updateProgress();
        }
    }

    completeProcess(name) {
        const section = this.sections.find(sec => sec.name === name);
        if (section && section.startTime) {
            section.endTime = Date.now();
            const duration = (section.endTime - section.startTime) / 1000;
            const li = document.createElement('li');
            li.innerText = `${section.name} abgeschlossen in ${duration.toFixed(2)} Sekunden`;
            const completedSections = document.getElementById('completed-sections');
            completedSections.appendChild(li);
            this.currentSectionIndex++;
            this.updateProgress();
        }
    }

    updateProgress() {
        const loadingText = document.getElementById('loading-text');
        if (this.currentSectionIndex < this.sections.length) {
            const section = this.sections[this.currentSectionIndex];
            loadingText.innerText = section.name;
        } else {
            loadingText.innerText = 'Ladevorgang abgeschlossen!';
            setTimeout(() => {
                if (this.loaderOverlay) {
                    this.loaderOverlay.style.display = 'none'; // Verberge den Loader
                }
            }, 2000); // Nach 2 Sekunden entfernen
        }

        console.log(`Loading text updated to: ${loadingText.innerText}`);

        // Forziere die Aktualisierung des DOM
        loadingText.style.display = 'none';
        loadingText.offsetHeight; // Triggers reflow
        loadingText.style.display = 'block';
    }
}

const processLoader = new ProcessLoader();

processLoader.initializeLoader();

processLoader.addProcess("Laden der Datenbank");
processLoader.addProcess("Laden der Benutzeroberfläche");
processLoader.addProcess("Herstellen der API-Verbindungen");

processLoader.startProcess("Laden der Datenbank");
setTimeout(() => processLoader.completeProcess("Laden der Datenbank"), 2000);

setTimeout(() => processLoader.startProcess("Laden der Benutzeroberfläche"), 2100);
setTimeout(() => processLoader.completeProcess("Laden der Benutzeroberfläche"), 4000);

setTimeout(() => processLoader.startProcess("Herstellen der API-Verbindungen"), 4100);
setTimeout(() => processLoader.completeProcess("Herstellen der API-Verbindungen"), 6000);

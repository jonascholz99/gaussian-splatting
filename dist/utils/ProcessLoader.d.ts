export declare class ProcessLoader {
    private sections;
    private currentSectionIndex;
    private loaderOverlay;
    private worker;
    constructor();
    initializeLoader(): void;
    addProcess(name: string): void;
    startProcess(name: string): void;
    completeProcess(name: string): void;
    private handleWorkerMessage;
    private updateProgress;
}

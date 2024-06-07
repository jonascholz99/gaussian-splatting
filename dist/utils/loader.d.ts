declare class ProcessLoader {
    initializeLoader(): void;
    addProcess(name: string): void;
    startProcess(name: string): void;
    completeProcess(name: string): void;
    updateProgress(): void;
}
export { ProcessLoader };

import { ProcessLoader } from "./ProcessLoader";
declare class LoaderManager {
    private static instance;
    private processLoader;
    private constructor();
    static getInstance(): LoaderManager;
    getProcessLoader(): ProcessLoader;
}
export { LoaderManager };

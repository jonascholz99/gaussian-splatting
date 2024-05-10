import { Object3D } from "./Object3D";
import { EventDispatcher } from "../events/EventDispatcher";
declare class Scene extends EventDispatcher {
    private _objects;
    addObject: (object: Object3D) => void;
    removeObject: (object: Object3D) => void;
    findObject: (predicate: (object: Object3D) => boolean) => Object3D | undefined;
    findObjectOfType: <T extends Object3D>(type: {
        new (): T;
    }) => T | undefined;
    reset: () => void;
    constructor();
    saveToFile(name?: string | null, format?: string | null): void;
    get objects(): Object3D[];
}
export { Scene };

import { NewRay } from "../math/NewRay";
import { Camera } from "../cameras/Camera";
import { Vector3 } from "../math/Vector3";
declare class NewRaycaster {
    ray: NewRay;
    near: number;
    far: number;
    camera: Camera | null;
    params: {
        Mesh: {};
        Line: {
            threshold: number;
        };
        LOD: {};
        Points: {
            threshold: number;
        };
        Sprite: {};
    };
    constructor(origin: Vector3, direction: Vector3, near?: number, far?: number);
    set(origin: Vector3, direction: Vector3): void;
}
export { NewRaycaster };

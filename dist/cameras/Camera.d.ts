import { CameraData } from "./CameraData";
import { Object3D } from "../core/Object3D";
import { Vector3 } from "../math/Vector3";
declare class Camera extends Object3D {
    private _data;
    screenPointToRay: (x: number, y: number) => Vector3;
    screenToWorldPoint: (x: number, y: number) => Vector3;
    worldToScreenPoint: (worldPoint: Vector3) => Vector3;
    worldToCameraPoint: (worldPoint: Vector3) => Vector3;
    constructor(camera?: CameraData | undefined);
    get data(): CameraData;
}
export { Camera };

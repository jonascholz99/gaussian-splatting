import { Camera } from "./Camera";
import { Vector3 } from "../math/Vector3";
declare class CameraHelper {
    private _camera;
    private _cameraData;
    private _frustumCorners;
    constructor(camera: Camera);
    calculateFrustum(): Vector3[];
    cameraToWorldCoords(cameraCoords: Vector3): Vector3;
    pointInFrustum(point: Vector3): boolean;
    private createPlane;
}
export { CameraHelper };

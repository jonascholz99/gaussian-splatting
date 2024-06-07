import {CameraData} from "./CameraData";
import {Object3D} from "../core/Object3D";
import {Vector3} from "../math/Vector3";
import {Vector4} from "../math/Vector4";

class Camera extends Object3D {
    private _data: CameraData;

    screenPointToRay: (x: number, y: number) => Vector3;
    screenToWorldPoint: (x: number, y: number) => Vector3;
    worldToScreenPoint: (worldPoint: Vector3) => Vector3;
    worldToCameraPoint: (worldPoint: Vector3) => Vector3;

        constructor(camera: CameraData | undefined = undefined) {
        super();

        this._data = camera ? camera : new CameraData();
        this._position = new Vector3(0, 0, -5);

        this.update = () => {
            this.data.update(this.position, this.rotation);
        };

        this.worldToScreenPoint = (worldPoint: Vector3) => {
            const worldSpaceCoords = new Vector4(worldPoint.x, worldPoint.y, worldPoint.z, 1.0);
            const viewMatrix = this._data.viewMatrix;
            const cameraSpaceCoors = worldSpaceCoords.multiply(viewMatrix);
            
            const projectionMatrix = this._data.projectionMatrix;
            const clipSpaceCoords = cameraSpaceCoors.multiply(projectionMatrix);

            return new Vector3(
                clipSpaceCoords.x / clipSpaceCoords.w,
                clipSpaceCoords.y / clipSpaceCoords.w,
                clipSpaceCoords.z / clipSpaceCoords.w,
            );
        }
        
        this.worldToCameraPoint = (worldPoint: Vector3) => {
            // Transformiere den Punkt in den Kamera-Raum
            const cameraSpaceCoords = new Vector4(worldPoint.x, worldPoint.y, worldPoint.z, 1.0);
            const viewMatrix = this._data.viewMatrix;
            const cameraCoords = cameraSpaceCoords.multiply(viewMatrix);

            return new Vector3(
                cameraCoords.x / cameraCoords.w,
                cameraCoords.y / cameraCoords.w,
                cameraCoords.z / cameraCoords.w
            );
        }
        
        this.screenToWorldPoint = (x: number, y: number, z:number = -1) => {
            const clipSpaceCoords = new Vector4(x, y, z, 1);
            const inverseProjectionMatrix = this._data.projectionMatrix.invert();
            const cameraSpaceCoords = clipSpaceCoords.multiply(inverseProjectionMatrix);
            const inverseViewMatrix = this._data.viewMatrix.invert();
            const worldSpaceCoords = cameraSpaceCoords.multiply(inverseViewMatrix);
            return new Vector3(
                worldSpaceCoords.x / worldSpaceCoords.w,
                worldSpaceCoords.y / worldSpaceCoords.w,
                worldSpaceCoords.z / worldSpaceCoords.w,
            );
        };
        
        this.screenPointToRay = (x: number, y: number) => {
            const clipSpaceCoords = new Vector4(x, y, -1, 1);
            const inverseProjectionMatrix = this._data.projectionMatrix.invert();
            const cameraSpaceCoords = clipSpaceCoords.multiply(inverseProjectionMatrix);
            const inverseViewMatrix = this._data.viewMatrix.invert();
            const worldSpaceCoords = cameraSpaceCoords.multiply(inverseViewMatrix);
            const worldSpacePosition = new Vector3(
                worldSpaceCoords.x / worldSpaceCoords.w,
                worldSpaceCoords.y / worldSpaceCoords.w,
                worldSpaceCoords.z / worldSpaceCoords.w,
            );
            const direction = worldSpacePosition.subtract(this.position).normalize();
            return direction;
        };
    }

    get data() {
        return this._data;
    }
}

export { Camera };

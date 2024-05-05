import { Camera } from "./Camera";
import { Vector3 } from "../math/Vector3";
import { Matrix4 } from "../math/Matrix4";
import { CameraData } from "./CameraData";
import {Vector4} from "../math/Vector4";
import {Plane} from "../math/Plane";

class CameraHelper {
    private _camera:Camera;
    private _cameraData: CameraData;
    
    private _frustumCorners: Vector3[];
    
    constructor(camera: Camera) {
        this._camera = camera;
        this._cameraData = this._camera.data;
        this._frustumCorners = [];
    }
    
    public calculateFrustum(): Vector3[] {
        
        const near = this._cameraData.near;
        const far = this._cameraData.far;
        const fovX = this._cameraData.fx;
        const fovY = this._cameraData.fy;
        
        const halfHeightNear = Math.tan(fovY / 2) * near;
        const halfWidthNear = Math.tan(fovX / 2) * near;
        
        const halfHeightFar = Math.tan(fovY / 2) * far;
        const halfWidthFar = Math.tan(fovX / 2) * far;
        
        const nearTopLeft = new Vector3(-halfWidthNear, halfHeightNear, -near);
        const nearTopRight = new Vector3(halfWidthNear, halfHeightNear, -near);
        const nearBottomLeft = new Vector3(-halfWidthNear, -halfHeightNear, -near);
        const nearBottomRight = new Vector3(halfWidthNear, -halfHeightNear, -near);

        const farTopLeft = new Vector3(-halfWidthFar, halfHeightFar, far);
        const farTopRight = new Vector3(halfWidthFar, halfHeightFar, far);
        const farBottomLeft = new Vector3(-halfWidthFar, -halfHeightFar, far);
        const farBottomRight = new Vector3(halfWidthFar, -halfHeightFar, far);

        this._frustumCorners.push(
            this.cameraToWorldCoords(nearTopLeft),
            this.cameraToWorldCoords(nearTopRight),
            this.cameraToWorldCoords(nearBottomLeft),
            this.cameraToWorldCoords(nearBottomRight),
            this.cameraToWorldCoords(farTopLeft),
            this.cameraToWorldCoords(farTopRight),
            this.cameraToWorldCoords(farBottomLeft),
            this.cameraToWorldCoords(farBottomRight)
        );

        return this._frustumCorners;
    }
    
    public cameraToWorldCoords(cameraCoords: Vector3): Vector3 {
        const cameraSpaceCoords = new Vector4(cameraCoords.x, cameraCoords.y, cameraCoords.z, 1);
        
        const inverseViewMatrix = this._cameraData.viewMatrix.invert();
        const worldSpaceCoords = cameraSpaceCoords.multiply(inverseViewMatrix);
        
        const worldSpacePosition = new Vector3(
            worldSpaceCoords.x / worldSpaceCoords.w,
            worldSpaceCoords.y / worldSpaceCoords.w,
            worldSpaceCoords.z / worldSpaceCoords.w,
        );
        
        return worldSpacePosition;
    }

    public pointInFrustum(point: Vector3): boolean {
        const planes = [
            this.createPlane(this._frustumCorners[0], this._frustumCorners[1], this._frustumCorners[2]), // Near plane
            this.createPlane(this._frustumCorners[4], this._frustumCorners[5], this._frustumCorners[6]), // Far plane
            
            this.createPlane(this._frustumCorners[0], this._frustumCorners[2], this._frustumCorners[4]), // left
            this.createPlane(this._frustumCorners[1], this._frustumCorners[3], this._frustumCorners[5]), // right
            this.createPlane(this._frustumCorners[0], this._frustumCorners[1], this._frustumCorners[4]), // bottom
            this.createPlane(this._frustumCorners[2], this._frustumCorners[3], this._frustumCorners[6]), // top
        ];
        
        return  planes[0].distanceToPoint(point) <= 0 && // before near plane
                planes[1].distanceToPoint(point) >= 0 && // behind far plane
                planes[2].distanceToPoint(point) <= 0 && // right from left plane
                planes[3].distanceToPoint(point) >= 0 && // left from right plane
                planes[4].distanceToPoint(point) >= 0 && // over bottom plane
                planes[5].distanceToPoint(point) <= 0; // under top plane
    }

    private createPlane(a: Vector3, b: Vector3, c: Vector3): FrustumPlane {
        const ab = b.subtract(a);
        const ac = c.subtract(a);
        const normal = ab.cross(ac).normalize();
        const d = -normal.dot(a);
        return new FrustumPlane(normal, d);
    }
}

class FrustumPlane {
    normal: Vector3;
    d: number;

    constructor(normal: Vector3, d: number) {
        this.normal = normal;
        this.d = d;
    }

    distanceToPoint(point: Vector3): number {
        // Berechnet den Abstand des Punktes von der Ebene
        return this.normal.dot(point) + this.d;
    }
}


export { CameraHelper }
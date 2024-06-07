import { Plane } from "./Plane";
import { Matrix4 } from "./Matrix4";
import { Box3 } from "./Box3";
import { Vector3 } from "./Vector3";
import { WebGLRenderer } from "../renderers/WebGLRenderer";
import { ShaderProgram } from "../renderers/webgl/programs/ShaderProgram";
import { NewRay } from "./NewRay";
import { Camera } from "../cameras/Camera";
declare class Frustum {
    planes: Plane[];
    frustumCorners: Vector3[] | undefined;
    frustumRenderProgram: ShaderProgram | undefined;
    needsUpdate: boolean;
    constructor(p0?: Plane, p1?: Plane, p2?: Plane, p3?: Plane, p4?: Plane, p5?: Plane);
    setFromCube(cube: Box3, camera: Camera): void;
    setFromPoints(nearTopLeft: Vector3, nearTopRight: Vector3, nearBottomLeft: Vector3, nearBottomRight: Vector3, farTopLeft: Vector3, farTopRight: Vector3, farBottomLeft: Vector3, farBottomRight: Vector3): void;
    setFromProjectionMatrix(m: Matrix4): void;
    intersectsBox(box: Box3, renderer?: WebGLRenderer | null): boolean;
    getFrustumPoints(): Vector3[];
    drawFrustum(renderer: WebGLRenderer): void;
    ereaseFrustum(renderer: WebGLRenderer): void;
    getRays(): NewRay[];
    intersectFrustum(otherFrustum: Frustum): Box3;
    containsPoint(point: Vector3): boolean;
    containsBox(box: Box3): boolean;
}
export { Frustum };

import { Plane } from "./Plane";
import { Matrix4 } from "./Matrix4";
import { Box3 } from "./Box3";
import { Vector3 } from "./Vector3";
declare class Frustum {
    planes: Plane[];
    constructor(p0?: Plane, p1?: Plane, p2?: Plane, p3?: Plane, p4?: Plane, p5?: Plane);
    setFromProjectionMatrix(m: Matrix4): void;
    intersectsBox(box: Box3): boolean;
    getFrustumPoints(): Vector3[];
}
export { Frustum };

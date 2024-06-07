import { Vector3 } from "./Vector3";
import { Box3 } from "./Box3";
import { Plane } from "./Plane";
declare class NewRay {
    origin: Vector3;
    direction: Vector3;
    constructor(origin?: Vector3, direction?: Vector3);
    set(origin: Vector3, direction: Vector3): this;
    copy(ray: NewRay): this;
    at(t: number, target?: Vector3): Vector3;
    intersectPlane(plane: Plane, target: Vector3): Vector3 | null;
    distanceToPlane(plane: Plane): number | null;
    lookAt(v: Vector3): this;
    recast(t: number): this;
    closestPointToPoint(point: Vector3, target: Vector3): Vector3;
    distanceToPoint(point: Vector3): number;
    distanceSqToPoint(point: Vector3): number;
    intersectBox(box: Box3, target: Vector3): Vector3 | null;
    intersectsBox(box: Box3): boolean;
    equals(ray: NewRay): boolean;
    clone(): this;
}
export { NewRay };

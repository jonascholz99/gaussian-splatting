import { Vector3 } from "../../math/Vector3";
import { NewRaycaster } from "../../utils/Raycaster";
import { RayPointIntersection } from "./RayPointIntersection";
export declare class PointData<T> {
    points: Vector3[];
    data: T[];
    constructor();
    testPoints(raycaster: NewRaycaster, result: RayPointIntersection<T>[]): void;
}

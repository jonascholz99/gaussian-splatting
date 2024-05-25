import { Vector3 } from "../../math/Vector3";
import { Octant } from "../core/Octant";
import { PointData } from "./PointData";
export declare class PointOctant<T> extends Octant<PointData<T>> {
    constructor(min: Vector3, max: Vector3);
    distanceToSquared(point: Vector3): number;
    distanceToCenterSquared(point: Vector3): number;
    contains(point: Vector3, bias: number): boolean;
    redistribute(bias: number): void;
    merge(): void;
}

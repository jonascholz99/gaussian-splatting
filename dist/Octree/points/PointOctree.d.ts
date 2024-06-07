import { Octree } from "../Octree";
import { Vector3 } from "../../math/Vector3";
import { PointOctant } from "./PointOctant";
import { PointContainer } from "./PointContainer";
import { RayPointIntersection } from "./RayPointIntersection";
import { NewRaycaster } from "../../utils/Raycaster";
export declare class PointOctree<T> extends Octree {
    private bias;
    private maxPoints;
    private maxDepth;
    constructor(min: Vector3, max: Vector3, bias?: number, maxPoints?: number, maxDepth?: number);
    getBias(): number;
    getMaxPoints(): number;
    getMaxDepth(): number;
    countPoints(octant?: PointOctant<T>): number;
    set(point: Vector3, data: T): boolean;
    remove(point: Vector3): T | null;
    get(point: Vector3): T | null;
    move(point: Vector3, position: Vector3): T | null;
    findNearestPoint(point: Vector3, maxDistance?: number, skipSelf?: boolean): PointContainer<T> | null;
    findPoints(point: Vector3, radius: number, skipSelf?: boolean): PointContainer<T>[];
    raycast(raycaster: NewRaycaster): RayPointIntersection<T>[];
}

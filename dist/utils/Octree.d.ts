import { Vector3 } from "../math/Vector3";
declare class Octree {
    root: OctreeNode;
    constructor(bounds: {
        min: Vector3;
        max: Vector3;
    });
    insert(pointIndex: number, positions: Float32Array): boolean;
}
export { Octree };
declare class OctreeNode {
    bounds: {
        min: Vector3;
        max: Vector3;
    };
    points: number[];
    children: OctreeNode[] | null;
    constructor(bounds: {
        min: Vector3;
        max: Vector3;
    });
    subdivide(): void;
    insert(pointIndex: number, positions: Float32Array): boolean;
    containsPoint(pointIndex: number, positions: Float32Array): boolean;
    static MAX_POINTS: number;
}

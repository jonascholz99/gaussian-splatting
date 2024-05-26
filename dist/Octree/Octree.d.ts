import { Tree } from "./core/Tree";
import { Node } from "./core/Node";
import { Vector3 } from "../math/Vector3";
import { Box3 } from "../math/Box3";
import { Raycaster } from "../utils/Raycaster";
import { Frustum } from "../math/Frustum";
export declare class Octree implements Tree, Iterable<Node> {
    protected root: Node;
    constructor(root: Node);
    get min(): Vector3;
    get max(): Vector3;
    get children(): Node[] | null;
    getCenter(result: Vector3): Vector3;
    getDimensions(result: Vector3): Vector3;
    cull(region: Box3 | Frustum): Node[];
    getDepth(): number;
    findNodesByLevel(level: number): Node[];
    getIntersectingNodes(raycaster: Raycaster): Node[];
    leaves(region?: Box3 | Frustum | null): Iterator<Node>;
    [Symbol.iterator](): Iterator<Node>;
}

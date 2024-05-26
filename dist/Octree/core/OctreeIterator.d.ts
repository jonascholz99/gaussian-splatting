import { Box3 } from "../../math/Box3";
import { Node } from "./Node";
import { Frustum } from "../../math/Frustum";
export declare class OctreeIterator implements Iterator<Node>, Iterable<Node> {
    private root;
    private region;
    private result;
    private trace;
    private indices;
    constructor(root: Node, region?: Box3 | Frustum | null);
    reset(): this;
    next(): IteratorResult<Node>;
    [Symbol.iterator](): Iterator<Node>;
}

import { Box3 } from "../../math/Box3";
import { Node } from "./Node";
export declare class OctreeIterator implements Iterator<Node>, Iterable<Node> {
    private root;
    private region;
    private result;
    private trace;
    private indices;
    constructor(root: Node, region?: Box3 | null);
    reset(): this;
    next(): IteratorResult<Node>;
    [Symbol.iterator](): Iterator<Node>;
}

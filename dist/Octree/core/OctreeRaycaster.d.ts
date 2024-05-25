import { Node } from "./Node";
import { NewRay } from "../../math/NewRay";
export declare function findNextOctant(currentOctant: number, tx1: number, ty1: number, tz1: number): number;
export declare class OctreeRaycaster {
    static intersectOctree(node: Node, ray: NewRay): Node[];
}

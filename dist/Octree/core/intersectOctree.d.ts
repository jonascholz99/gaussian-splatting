import { Node } from "../core/Node.js";
import { RaycastingFlags } from "./RaycastingFlags.js";
import { NewRay } from "../../math/NewRay";
export declare function intersectOctree(octree: Node, ray: NewRay, flags: RaycastingFlags): number[] | null;

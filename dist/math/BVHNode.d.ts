import { Box3 } from "./Box3";
import { SingleSplat } from "../splats/SingleSplat";
import { Ray } from "./Ray";
declare class BVHNode {
    left: BVHNode | null;
    right: BVHNode | null;
    bounds: Box3;
    objects: SingleSplat[];
    constructor(objects?: SingleSplat[] | undefined);
    private split;
    intersects(ray: Ray, maxDistance: number): SingleSplat[];
}
export { BVHNode };

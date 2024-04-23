import { BVHNode } from "../../../math/BVHNode";
import { SingleSplat } from "../../../splats/SingleSplat";
import { Camera } from "../../../cameras/Camera";
import { Ray } from "../../../math/Ray"

class Raycaster {
    private bvh: BVHNode;

    constructor(objects: SingleSplat[]) {
        this.bvh = new BVHNode(objects);
    }

    public testPointSingleSplats(x: number, y: number, camera: Camera, maxDistance: number): SingleSplat[] | null {
        if (!camera) {
            console.error("Camera is not initialized");
            return null;
        }

        const ray = new Ray(camera.position, camera.screenPointToRay(x, y));
        return this.bvh.intersects(ray, maxDistance);
    }
}

export { Raycaster }
import { SingleSplat } from "../../../splats/SingleSplat";
import { Camera } from "../../../cameras/Camera";
import { WebGLRenderer } from "../../WebGLRenderer";
declare class Raycaster {
    private bvh;
    private renderer;
    private renderProgram;
    testBox: (point1: Float32Array, point2: Float32Array) => SingleSplat[] | null;
    testCameraViewFrustum: (camera: Camera) => SingleSplat[] | null;
    constructor(renderer: WebGLRenderer, buildBVH: boolean);
    testPointSingleSplats(x: number, y: number, camera: Camera, maxDistance: number): SingleSplat[] | null;
}
export { Raycaster };

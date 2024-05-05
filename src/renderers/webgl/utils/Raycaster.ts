import { BVHNode } from "../../../math/BVHNode";
import { SingleSplat } from "../../../splats/SingleSplat";
import { Camera } from "../../../cameras/Camera";
import { Ray } from "../../../math/Ray"
import {BVH} from "../../../math/BVH";
import {Box3} from "../../../math/Box3";
import {Vector3} from "../../../math/Vector3";
import {RenderProgram} from "../programs/RenderProgram";
import {RenderData} from "./RenderData";
import {WebGLRenderer} from "../../WebGLRenderer";
import { CubeVisualisationProgram } from "../programs/individual/CubeVisualisationProgram";
import {CameraHelper} from "../../../cameras/CameraHelper";
import {Utils} from "../../../utils/Utils";

class Raycaster {
    private bvh: BVHNode | undefined;
    private renderer: WebGLRenderer;
    private renderProgram: RenderProgram;
    
    public testBox: (point1: Float32Array, point2: Float32Array) => SingleSplat[] | null;
    public testCameraViewFrustum: (camera: Camera) => SingleSplat[] | null;

    constructor(renderer: WebGLRenderer, buildBVH: boolean) {
        let singleSplatLookup: SingleSplat[] = [];
        this.renderer = renderer;
        this.renderProgram = renderer.renderProgram;
        
        if(buildBVH) {
            const renderData = this.renderProgram.renderData as RenderData;
            for (const singleSplat of renderData.singleOffsets.keys()) {
                const splatBounds = singleSplat.bounds;
                singleSplatLookup.push(singleSplat);
            }
            this.bvh = new BVHNode(singleSplatLookup);
        }

        this.testBox = (point1: Float32Array, point2: Float32Array) => {
            const renderData = this.renderProgram.renderData as RenderData;
            
            if(renderData === undefined)
                return null;

            singleSplatLookup = [];
            
            const [x1, y1, z1] = point1;
            const [x2, y2, z2] = point2;
            const minPoint = new Vector3(x1, y1, z1);
            const maxPoint = new Vector3(x2, y2, z2);
            
            const queryBox = new Box3(maxPoint, minPoint);
            queryBox.permute();
            
            
            for (const singleSplat of renderData.singleOffsets.keys()) {
                if(queryBox.contains(singleSplat.bounds.center())) {
                    
                    singleSplatLookup.push(singleSplat)
                }
            }

            return singleSplatLookup;
        }

        this.testCameraViewFrustum = (camera: Camera) => {
            this.renderer.removeAllPrograms();
            const renderData = this.renderProgram.renderData as RenderData;
            var camHelper: CameraHelper = new CameraHelper(camera);
            var corners: Vector3[] = camHelper.calculateFrustum();

            singleSplatLookup = [];
            
            Utils.drawCone(this.renderer,corners)

            for (const singleSplat of renderData.singleOffsets.keys()) {
                if(camHelper.pointInFrustum(singleSplat.bounds.center())) {

                    singleSplatLookup.push(singleSplat)
                }
            }

            return singleSplatLookup;
        }
    }

    public testPointSingleSplats(x: number, y: number, camera: Camera, maxDistance: number): SingleSplat[] | null {
        if(this.bvh === undefined)
            return null;
        
        if (!camera) {
            console.error("Camera is not initialized");
            return null;
        }

        const ray = new Ray(camera.position, camera.screenPointToRay(x, y));
        return this.bvh.intersects(ray, maxDistance);
    }
}

export { Raycaster }
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

class Raycaster {
    private bvh: BVHNode | undefined;
    
    public testBox: (point1: Float32Array, point2: Float32Array) => SingleSplat[] | null;

    constructor(renderer: WebGLRenderer, buildBVH: boolean) {
        let singleSplatLookup: SingleSplat[] = [];
        let renderProgram = renderer.renderProgram;
        
        if(buildBVH) {
            const renderData = renderProgram.renderData as RenderData;
            for (const singleSplat of renderData.singleOffsets.keys()) {
                const splatBounds = singleSplat.bounds;
                singleSplatLookup.push(singleSplat);
            }
            this.bvh = new BVHNode(singleSplatLookup);
        }

        this.testBox = (point1: Float32Array, point2: Float32Array) => {
            const renderData = renderProgram.renderData as RenderData;
            
            if(renderData === undefined)
                return null;

            singleSplatLookup = [];
            
            const [x1, y1, z1] = point1;
            const [x2, y2, z2] = point2;
            const minPoint = new Vector3(x1, y1, z1);
            const maxPoint = new Vector3(x2, y2, z2);
            console.log(minPoint)
            console.log(maxPoint)

            let upperLeftCorner = new Float32Array([x1-0.05, y1-0.05, z1-0.05]);
            let bottomRightCorner = new Float32Array([x1+0.05, y1+0.05, z1+0.05]);

            let upperLeftCorner2 = new Float32Array([x2-0.05, y2-0.05, z2-0.05]);
            let bottomRightCorner2 = new Float32Array([x2+0.05, y2+0.05, z2+0.05]);

            let color = new Float32Array([0.0, 1.0, 0.0, 1.0]);
            
            renderer.addProgram(new CubeVisualisationProgram(renderer, [], upperLeftCorner, bottomRightCorner, color));
            renderer.addProgram(new CubeVisualisationProgram(renderer, [], upperLeftCorner2, bottomRightCorner2, color));
            
            const queryBox = new Box3(maxPoint, minPoint);
            queryBox.permute();
            console.log(queryBox.min)
            console.log(queryBox.max)

            let upperLeftCorner3 = new Float32Array([queryBox.min.x-0.05, queryBox.min.y-0.05, queryBox.min.z-0.05]);
            let bottomRightCorner3 = new Float32Array([queryBox.min.x+0.05, queryBox.min.y+0.05, queryBox.min.z+0.05]);

            let upperLeftCorner4 = new Float32Array([queryBox.max.x-0.05, queryBox.max.y-0.05, queryBox.max.z-0.05]);
            let bottomRightCorner4 = new Float32Array([queryBox.max.x+0.05, queryBox.max.y+0.05, queryBox.max.z+0.05]);

            let color2 = new Float32Array([0.0, 0.0, 1.0, 1.0]);
            
            renderer.addProgram(new CubeVisualisationProgram(renderer, [], upperLeftCorner3, bottomRightCorner3, color2));
            renderer.addProgram(new CubeVisualisationProgram(renderer, [], upperLeftCorner4, bottomRightCorner4, color2));
            
            
            for (const singleSplat of renderData.singleOffsets.keys()) {
                if(queryBox.contains(singleSplat.bounds.center())) {
                    let splatCenterDelta1 = new Float32Array([singleSplat.bounds.center().x-0.05, singleSplat.bounds.center().y-0.05, singleSplat.bounds.center().z-0.05]);
                    let splatCenterDelta2 = new Float32Array([singleSplat.bounds.center().x+0.05, singleSplat.bounds.center().y+0.05, singleSplat.bounds.center().z+0.05]);

                    let color3 = new Float32Array([1.0, 1.0, 1.0, 1.0]);
                    renderer.addProgram(new CubeVisualisationProgram(renderer, [], splatCenterDelta1, splatCenterDelta2, color3));
                    
                    singleSplatLookup.push(singleSplat)
                } 
                // else if(singleSplat.bounds.center().distanceTo(queryBox.center()) <= 1.2) {
                //     let splatCenterDelta1 = new Float32Array([singleSplat.bounds.center().x-0.05, singleSplat.bounds.center().y-0.05, singleSplat.bounds.center().z-0.05]);
                //     let splatCenterDelta2 = new Float32Array([singleSplat.bounds.center().x+0.05, singleSplat.bounds.center().y+0.05, singleSplat.bounds.center().z+0.05]);
                //
                //     let color3 = new Float32Array([1.0, 1.0, 1.0, 1.0]);
                //     renderer.addProgram(new CubeVisualisationProgram(renderer, [], splatCenterDelta1, splatCenterDelta2, color3));
                // }
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
import { Camera } from "../../../cameras/Camera";
import { Vector3 } from "../../../math/Vector3";
import { Splat } from "../../../splats/Splat";
import { RenderProgram } from "../programs/RenderProgram";
import { Box3 } from "../../../math/Box3";
import { BVH } from "../../../math/BVH";
import { RenderData } from "./RenderData";
import {SingleSplat} from "../../../splats/SingleSplat";

class IntersectionTester {
    testPoint: (x: number, y: number) => Splat | null;
    testPointSingleSplats: (x: number, y: number) => SingleSplat[] | null;
    testLayer: (value: number, positiveDirection: boolean, axis: string) => SingleSplat[] | null;

    constructor(renderProgram: RenderProgram, maxDistance: number = 100, resolution: number = 1.0) {
        let vertexCount = 0;
        let bvh: BVH | null = null;

        let singleSplatbvh: BVH | null = null;
        let lookup: Splat[] = [];
        let singleSplatLookup: SingleSplat[] = [];

        const build = () => {
            if(renderProgram.renderData === null) {
                console.error("IntersectionTester cannot be called before renderProgram has been initialized");
                return;
            }
            const startTimeSplat = performance.now();
            
            lookup = [];
            const renderData = renderProgram.renderData as RenderData;
            const boxes = new Array<Box3>(renderData.offsets.size);
            let i = 0;
            const bounds = new Box3(
                new Vector3(Infinity, Infinity, Infinity),
                new Vector3(-Infinity, -Infinity, -Infinity),
            );
            for (const splat of renderData.offsets.keys()) {
                const splatBounds = splat.bounds;
                boxes[i++] = splatBounds;
                bounds.expand(splatBounds.min);
                bounds.expand(splatBounds.max);
                lookup.push(splat);
            }
            bounds.permute();
            bvh = new BVH(bounds, boxes);

            const endTimeSplat = performance.now();
            const duration = endTimeSplat - startTimeSplat; 
            console.log(`creating BVH with SPLAT:  ${duration/1000} s (${duration} ms).`);

            const startTimeSingleSplat = performance.now();
            singleSplatLookup = [];
            const singleSplatBoxes = new Array<Box3>(renderData.singleOffsets.size);
            let j = 0;
            const singleSplatbounds = new Box3(
                new Vector3(Infinity, Infinity, Infinity),
                new Vector3(-Infinity, -Infinity, -Infinity),
            );
            for (const singleSplat of renderData.singleOffsets.keys()) {
                const splatBounds = singleSplat.bounds;
                singleSplatBoxes[j++] = splatBounds;
                singleSplatbounds.expand(splatBounds.min);
                singleSplatbounds.expand(splatBounds.max);
                singleSplatLookup.push(singleSplat);
            }
            singleSplatbounds.permute();
            singleSplatbvh = new BVH(singleSplatbounds, singleSplatBoxes);

            const endTimeSingleSplat = performance.now();
            const durationSingleSplat = endTimeSingleSplat - startTimeSingleSplat;
            console.log(`creating BVH with SPLAT:  ${durationSingleSplat/1000} s (${durationSingleSplat} ms).`);
            
            console.log("Got " + boxes.length + " boxes for Splat!")
            console.log("Got " + singleSplatBoxes.length + " boxes for Single Splats!")
            
            vertexCount = renderData.vertexCount;
        };
        
        this.testLayer = (value: number, positiveDirection: boolean, axis: string) => {
            const renderData = renderProgram.renderData as RenderData;
            singleSplatLookup = [];
            
            for (const singleSplat of renderData.singleOffsets.keys()) {
                const splatBounds = singleSplat.bounds;
                if(axis === "x") {
                    if(positiveDirection) {
                        if(splatBounds.center().x >= value) {
                            singleSplatLookup.push(singleSplat)
                        }
                    } else {
                        if(splatBounds.center().x < value) {
                            singleSplatLookup.push(singleSplat)
                        }
                    }
                } else if(axis === "y") {
                    if(positiveDirection) {
                        if(splatBounds.center().y >= value) {
                            singleSplatLookup.push(singleSplat)
                        }
                    } else {
                        if(splatBounds.center().y < value) {
                            singleSplatLookup.push(singleSplat)
                        }
                    }
                } else if(axis === "z") {
                    if(positiveDirection) {
                        if(splatBounds.center().z >= value) {
                            singleSplatLookup.push(singleSplat)
                        }
                    } else {
                        if(splatBounds.center().z < value) {
                            singleSplatLookup.push(singleSplat)
                        }
                    }
                }
            }
            return singleSplatLookup;
        }

        this.testPoint = (x: number, y: number) => {
            if (renderProgram.renderData === null || renderProgram.camera === null) {
                console.error("IntersectionTester cannot be called before renderProgram has been initialized");
                return null;
            }

            build();

            if (bvh === null) {
                console.error("Failed to build octree for IntersectionTester");
                return null;
            }

            const renderData = renderProgram.renderData as RenderData;
            const camera = renderProgram.camera as Camera;

            if (vertexCount !== renderData.vertexCount) {
                console.warn("IntersectionTester has not been rebuilt since the last render");
            }

            const ray = camera.screenPointToRay(x, y);
            for (let x = 0; x < maxDistance; x += resolution) {
                const point = camera.position.add(ray.multiply(x));
                const minPoint = new Vector3(
                    point.x - resolution / 2,
                    point.y - resolution / 2,
                    point.z - resolution / 2,
                );
                const maxPoint = new Vector3(
                    point.x + resolution / 2,
                    point.y + resolution / 2,
                    point.z + resolution / 2,
                );
                const queryBox = new Box3(minPoint, maxPoint);
                const points = bvh.queryRange(queryBox);
                if (points.length > 0) {
                    return lookup[points[0]];
                }
            }

            return null;
        };

        
        this.testPointSingleSplats = (x: number, y: number) => {
            if (renderProgram.renderData === null || renderProgram.camera === null) {
                console.error("IntersectionTester cannot be called before renderProgram has been initialized");
                return null;
            }

            const renderData = renderProgram.renderData as RenderData;
            const camera = renderProgram.camera as Camera;

            singleSplatLookup = [];
            const ray = camera.screenPointToRay(x, y);
            for (let x = 0; x < maxDistance; x += resolution) {
                const point = camera.position.add(ray.multiply(x));
                const minPoint = new Vector3(
                    point.x - resolution / 2,
                    point.y - resolution / 2,
                    point.z - resolution / 2,
                );
                const maxPoint = new Vector3(
                    point.x + resolution / 2,
                    point.y + resolution / 2,
                    point.z + resolution / 2,
                );
                const queryBox = new Box3(minPoint, maxPoint);
                
                for (const singleSplat of renderData.singleOffsets.keys()) {
                    if(singleSplat.bounds.intersects(queryBox)) {
                        singleSplatLookup.push(singleSplat)
                    }
                }
            }
            return singleSplatLookup;
        };
    }
}

export { IntersectionTester };

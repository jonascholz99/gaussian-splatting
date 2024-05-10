import { Splat } from "../../../splats/Splat";
import { RenderProgram } from "../programs/RenderProgram";
import { SingleSplat } from "../../../splats/SingleSplat";
declare class IntersectionTester {
    testPoint: (x: number, y: number) => Splat | null;
    testPointSingleSplats: (x: number, y: number) => SingleSplat[] | null;
    testLayer: (value: number, positiveDirection: boolean, axis: string) => SingleSplat[] | null;
    constructor(renderProgram: RenderProgram, maxDistance?: number, resolution?: number);
}
export { IntersectionTester };

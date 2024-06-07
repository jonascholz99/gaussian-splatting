import { Vector3 } from "./Vector3";
import {WebGLRenderer} from "../renderers/WebGLRenderer";
import {CubeVisualisationProgram} from "../renderers/webgl/programs/individual/CubeVisualisationProgram";
import {ShaderProgram} from "../renderers/webgl/programs/ShaderProgram";

class Box3 {
    boxRenderProgram: ShaderProgram | undefined;
    
    constructor(
        public min: Vector3,
        public max: Vector3,
    ) {}

    public contains(point: Vector3) {
        return (
            point.x >= this.min.x &&
            point.x <= this.max.x &&
            point.y >= this.min.y &&
            point.y <= this.max.y &&
            point.z >= this.min.z &&
            point.z <= this.max.z
        );
    }

    public intersects(box: Box3) {
        return (
            this.max.x >= box.min.x &&
            this.min.x <= box.max.x &&
            this.max.y >= box.min.y &&
            this.min.y <= box.max.y &&
            this.max.z >= box.min.z &&
            this.min.z <= box.max.z
        );
    }

    public intersectsBox(box: Box3) {
        return (
            this.max.x >= box.min.x &&
            this.min.x <= box.max.x &&
            this.max.y >= box.min.y &&
            this.min.y <= box.max.y &&
            this.max.z >= box.min.z &&
            this.min.z <= box.max.z
        );
    }

    public intersectsBasedOnCenter(box: Box3) {
        const centerA = this.center();
        const centerB = box.center();

        const sizeA = this.size();
        const sizeB = box.size();

        
        return (
            Math.abs(centerA.x - centerB.x) <= (sizeA.x / 2 + sizeB.x / 2) &&
            Math.abs(centerA.y - centerB.y) <= (sizeA.y / 2 + sizeB.y / 2) &&
            Math.abs(centerA.z - centerB.z) <= (sizeA.z / 2 + sizeB.z / 2)
        );
    }


    public size() {
        return this.max.subtract(this.min);
    }

    public center() {
        return this.min.add(this.max).divide(2);
    }

    public expand(point: Vector3) {
        this.min = this.min.min(point);
        this.max = this.max.max(point);
    }

    public permute() {
        const min = this.min;
        const max = this.max;
        this.min = new Vector3(Math.min(min.x, max.x), Math.min(min.y, max.y), Math.min(min.z, max.z));
        this.max = new Vector3(Math.max(min.x, max.x), Math.max(min.y, max.y), Math.max(min.z, max.z));
    }
    
    public surfaceArea(): number {
        const width = this.max.x - this.min.x;
        const height = this.max.y - this.min.y;
        const depth = this.max.z - this.min.z;
        return 2 * ((width * height) + (width * depth) + (height * depth));
    }
    
    public drawBox(renderer: WebGLRenderer) {
        
        this.permute();
        let boxColor = new Float32Array([0.0, 1.0, 0.0, 0.5]);
        let boxMin = new Float32Array([this.min.x, this.min.y, this.min.z]);
        let boxMax = new Float32Array([this.max.x, this.max.y, this.max.z]);
        
        this.boxRenderProgram = new CubeVisualisationProgram(renderer, [], [boxMin, boxMax], boxColor)
        renderer.addProgram(this.boxRenderProgram);
    }
    
    public ereaseBox(renderer: WebGLRenderer) {
        if(this.boxRenderProgram !== undefined) {
            renderer.removeProgram(this.boxRenderProgram);
        }
    }

    expandByPoint(point: Vector3): void {
        this.min = this.min.min(point);
        this.max = this.max.max(point);
    }

    getCorners(): Vector3[] {
        return [
            new Vector3(this.min.x, this.min.y, this.min.z), // Near-Bottom-Left
            new Vector3(this.max.x, this.min.y, this.min.z), // Near-Bottom-Right
            new Vector3(this.min.x, this.max.y, this.min.z), // Near-Top-Left
            new Vector3(this.max.x, this.max.y, this.min.z), // Near-Top-Right
            new Vector3(this.min.x, this.min.y, this.max.z), // Far-Bottom-Left
            new Vector3(this.max.x, this.min.y, this.max.z), // Far-Bottom-Right
            new Vector3(this.min.x, this.max.y, this.max.z), // Far-Top-Left
            new Vector3(this.max.x, this.max.y, this.max.z)  // Far-Top-Right
        ];
    }
}

export { Box3 };

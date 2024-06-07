import { Vector3 } from "./Vector3";
import { WebGLRenderer } from "../renderers/WebGLRenderer";
import { ShaderProgram } from "../renderers/webgl/programs/ShaderProgram";
declare class Box3 {
    min: Vector3;
    max: Vector3;
    boxRenderProgram: ShaderProgram | undefined;
    constructor(min: Vector3, max: Vector3);
    contains(point: Vector3): boolean;
    intersects(box: Box3): boolean;
    intersectsBox(box: Box3): boolean;
    intersectsBasedOnCenter(box: Box3): boolean;
    size(): Vector3;
    center(): Vector3;
    expand(point: Vector3): void;
    permute(): void;
    surfaceArea(): number;
    drawBox(renderer: WebGLRenderer): void;
    ereaseBox(renderer: WebGLRenderer): void;
    expandByPoint(point: Vector3): void;
    getCorners(): Vector3[];
}
export { Box3 };

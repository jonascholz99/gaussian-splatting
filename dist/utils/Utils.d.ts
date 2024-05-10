import { WebGLRenderer } from "../renderers/WebGLRenderer";
import { Vector3 } from "../math/Vector3";
declare class Utils {
    static draw(renderer: WebGLRenderer, point: Vector3, size: number): void;
    static drawCone(renderer: WebGLRenderer, points: Vector3[]): void;
}
export { Utils };

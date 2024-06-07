import { Vector3 } from "./Vector3";
declare class Plane {
    readonly normal: Vector3;
    readonly point: Vector3;
    constant: number;
    constructor(normal?: Vector3, point?: Vector3, constant?: number);
    setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): this;
    setComponents(x: number, y: number, z: number, w: number): this;
    intersect(origin: Vector3, direction: Vector3): Vector3 | null;
    normalize(): this;
    distanceToPoint(point: Vector3): number;
}
export { Plane };

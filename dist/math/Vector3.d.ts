import { Matrix4 } from "./Matrix4";
declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    equals(v: Vector3): boolean;
    addVectors(a: Vector3, b: Vector3): this;
    add(v: number): Vector3;
    add(v: Vector3): Vector3;
    addScaledVector(v: Vector3, s: number): this;
    subVectors(a: Vector3, b: Vector3): this;
    subtract(v: number): Vector3;
    subtract(v: Vector3): Vector3;
    sub(v: Vector3): this;
    multiply(v: number): Vector3;
    multiply(v: Vector3): Vector3;
    multiply(v: Matrix4): Vector3;
    divide(v: number): Vector3;
    divide(v: Vector3): Vector3;
    cross(v: Vector3): Vector3;
    distanceToSquared(v: Vector3): number;
    dot(v: Vector3): number;
    lerp(v: Vector3, t: number): Vector3;
    min(v: Vector3): Vector3;
    max(v: Vector3): Vector3;
    getComponent(axis: number): number;
    minComponent(): number;
    maxComponent(): number;
    magnitude(): number;
    distanceTo(v: Vector3): number;
    normalize(): Vector3;
    lengthSq(): number;
    flat(): number[];
    clone(): Vector3;
    clamp(min: Vector3, max: Vector3): this;
    copy(v: Vector3): this;
    toString(): string;
    static One(value?: number): Vector3;
}
export { Vector3 };

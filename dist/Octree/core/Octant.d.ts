import { Node } from "./Node";
import { DataContainer } from "./DataContainer";
import { Vector3 } from "../../math/Vector3";
export declare class Octant<T> implements Node, DataContainer<T> {
    min: Vector3;
    max: Vector3;
    children: Node[] | null;
    data: T | null;
    constructor(min?: Vector3, max?: Vector3);
    getCenter(result: Vector3): Vector3;
    getDimensions(result: Vector3): Vector3;
    split(): void;
}

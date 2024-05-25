import { DataContainer } from "../core/DataContainer";
import { Vector3 } from "../../math/Vector3";
export declare class PointContainer<T> implements DataContainer<T> {
    data: T | null;
    point: Vector3 | null;
    distance: number;
    constructor(point?: Vector3 | null, data?: T | null, distance?: number);
}

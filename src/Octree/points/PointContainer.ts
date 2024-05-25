import { DataContainer } from "../core/DataContainer";
import { Vector3 } from "../../math/Vector3";

export class PointContainer<T> implements DataContainer<T> {

    data: T | null;
    

    point: Vector3 | null;


    distance: number;
    
    constructor(point: Vector3 | null = null, data: T | null = null, distance = 0.0) {

        this.point = point;
        this.data = data;
        this.distance = distance;

    }

}
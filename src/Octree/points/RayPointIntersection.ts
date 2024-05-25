import { PointContainer } from "./PointContainer";
import { Vector3 } from "../../math/Vector3";

export class RayPointIntersection<T> extends PointContainer<T> {
    
    distanceToRay: number;
    

    constructor(distanceToOrigin: number, distanceToRay: number, point: Vector3, data: T | null = null) {

        super(point, data, distanceToOrigin);
        this.distanceToRay = distanceToRay;

    }

}
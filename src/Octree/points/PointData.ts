import { Vector3 } from "../../math/Vector3";
import { NewRaycaster } from "../../utils/Raycaster";
import { RayPointIntersection } from "./RayPointIntersection";

export class PointData<T> {
    points: Vector3[];
    
    data: T[];

    constructor() {
        this.points = [];
        this.data = [];
    }
    
    testPoints(raycaster: NewRaycaster, result: RayPointIntersection<T>[]): void {
        const threshold = (raycaster.params.Points !== undefined) ? raycaster.params.Points.threshold : 0;
        const thresholdSq = threshold * threshold;
        const ray = raycaster.ray;
        
        const points = this.points;
        const data = this.data;

        for(let i = 0, l = points.length; i < l; ++i) {

            const point = points[i];
            const distanceToRaySq = ray.distanceSqToPoint(point);

            if(distanceToRaySq < thresholdSq) {

                const closestPoint = ray.closestPointToPoint(point, new Vector3());
                const distance = ray.origin.distanceTo(closestPoint);

                if(distance >= raycaster.near && distance <= raycaster.far) {

                    result.push(new RayPointIntersection<T>(distance, Math.sqrt(distanceToRaySq), closestPoint, data[i]));

                }

            }

        }
    }
}
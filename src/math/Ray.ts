import { Vector3 } from "./Vector3";
import { Box3 } from "./Box3";

class Ray {
    origin: Vector3;
    direction: Vector3;

    constructor(origin: Vector3, direction: Vector3) {
        this.origin = origin;
        this.direction = direction.normalize();
    }
    
    getPoint(t: number): Vector3 {
        return this.origin.add(this.direction.multiply(t));
    }
    
    intersectsBox(box: Box3, maxDistance: number = Infinity): boolean {
        let tmin = (box.min.x - this.origin.x) / this.direction.x;
        let tmax = (box.max.x - this.origin.x) / this.direction.x;

        if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

        let tymin = (box.min.y - this.origin.y) / this.direction.y;
        let tymax = (box.max.y - this.origin.y) / this.direction.y;

        if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

        if ((tmin > tymax) || (tymin > tmax))
            return false;

        if (tymin > tmin) tmin = tymin;
        if (tymax < tmax) tmax = tymax;

        let tzmin = (box.min.z - this.origin.z) / this.direction.z;
        let tzmax = (box.max.z - this.origin.z) / this.direction.z;

        if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

        if ((tmin > tzmax) || (tzmin > tmax))
            return false;

        if (tzmin > tmin) tmin = tzmin;
        if (tzmax < tmax) tmax = tzmax;

        return (tmin < maxDistance) && (tmax > 0);
    }
}

export { Ray }
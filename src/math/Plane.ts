import { Vector3 } from "./Vector3";

class Plane {
    public readonly normal: Vector3;
    public readonly point: Vector3;
    public constant: number;
    
    constructor(normal: Vector3 = new Vector3(1, 0, 0), point: Vector3 = new Vector3(0,0,0), constant:number = 0) {
        this.normal = normal;
        this.point = point;
        this.constant = constant;
    }

    setComponents(x: number, y:number, z:number, w:number): this {
        this.normal.set(x, y, z);
        this.constant = w;
        return this;
    }
    intersect(origin: Vector3, direction: Vector3): Vector3 | null {
        const denominator = this.normal.dot(direction);

        if (Math.abs(denominator) < 0.0001) {
            return null;
        }

        const t = this.normal.dot(this.point.subtract(origin)) / denominator;

        if (t < 0) {
            return null;
        }

        return origin.add(direction.multiply(t));
    }

    normalize(): this {
        
        const inverseNormalLength = 1.0 / this.normal.magnitude();
        this.normal.multiply(inverseNormalLength);
        this.constant *= inverseNormalLength;
        return this;
    }

    distanceToPoint(point: Vector3): number {
        return this.normal.dot(point) + this.constant;
    }
}

export { Plane };

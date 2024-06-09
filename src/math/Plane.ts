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

    setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): this {
        const v1 = new Vector3().subVectors(c, b);
        const v2 = new Vector3().subVectors(a, b);
        const normal = new Vector3().crossVectors(v1, v2).normalize();
        this.normal.set(normal.x, normal.y, normal.z);
        this.constant = this.normal.dot(b);
        return this;
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
        return this.normal.dot(point) - this.constant;
    }

    clone(): Plane {
        return new Plane().copy(this);
    }

    copy(plane: Plane): this {
        this.normal.copy(plane.normal);
        this.constant = plane.constant;
        return this;
    }
}

export { Plane };

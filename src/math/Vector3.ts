import { Matrix4 } from "./Matrix4";

class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set( x: number, y: number, z: number ) {

        if ( z === undefined ) z = this.z;

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }

    equals(v: Vector3): boolean {
        if (this.x !== v.x) {
            return false;
        }
        if (this.y !== v.y) {
            return false;
        }
        if (this.z !== v.z) {
            return false;
        }

        return true;
    }

    addVectors(a:Vector3, b:Vector3) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        
        return this;
    }
    
    add(v: number): Vector3;
    add(v: Vector3): Vector3;
    add(v: number | Vector3): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x + v, this.y + v, this.z + v);
        } else {
            return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
    }

    addScaledVector( v:Vector3, s: number ) {

        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;

        return this;

    }

    subVectors(a:Vector3, b:Vector3) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;
    }
    subtract(v: number): Vector3;
    subtract(v: Vector3): Vector3;
    subtract(v: number | Vector3): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x - v, this.y - v, this.z - v);
        } else {
            return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
    }

    sub( v: Vector3 ) {

        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;

    }

    multiply(v: number): Vector3;
    multiply(v: Vector3): Vector3;
    multiply(v: Matrix4): Vector3;
    multiply(v: number | Vector3 | Matrix4): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x * v, this.y * v, this.z * v);
        } else if (v instanceof Vector3) {
            return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
        } else {
            return new Vector3(
                this.x * v.buffer[0] + this.y * v.buffer[4] + this.z * v.buffer[8] + v.buffer[12],
                this.x * v.buffer[1] + this.y * v.buffer[5] + this.z * v.buffer[9] + v.buffer[13],
                this.x * v.buffer[2] + this.y * v.buffer[6] + this.z * v.buffer[10] + v.buffer[14],
            );
        }
    }

    divide(v: number): Vector3;
    divide(v: Vector3): Vector3;
    divide(v: number | Vector3): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x / v, this.y / v, this.z / v);
        } else {
            return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
        }
    }

    crossVectors(a: Vector3, b: Vector3): this {
        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    }
    
    cross(v: Vector3): Vector3 {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;

        return new Vector3(x, y, z);
    }

    distanceToSquared( v:Vector3 ) {

        const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

        return dx * dx + dy * dy + dz * dz;

    }

    toArray(): number[] {
        return [this.x, this.y, this.z];
    }
    
    
    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    lerp(v: Vector3, t: number): Vector3 {
        return new Vector3(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t, this.z + (v.z - this.z) * t);
    }

    min(v: Vector3): Vector3 {
        return new Vector3(Math.min(this.x, v.x), Math.min(this.y, v.y), Math.min(this.z, v.z));
    }

    max(v: Vector3): Vector3 {
        return new Vector3(Math.max(this.x, v.x), Math.max(this.y, v.y), Math.max(this.z, v.z));
    }

    getComponent(axis: number) {
        switch (axis) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            default:
                throw new Error(`Invalid component index: ${axis}`);
        }
    }

    minComponent(): number {
        if (this.x < this.y && this.x < this.z) {
            return 0;
        } else if (this.y < this.z) {
            return 1;
        } else {
            return 2;
        }
    }

    maxComponent(): number {
        if (this.x > this.y && this.x > this.z) {
            return 0;
        } else if (this.y > this.z) {
            return 1;
        } else {
            return 2;
        }
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    distanceTo(v: Vector3): number {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2);
    }

    normalize(): Vector3 {
        const length = this.magnitude();

        return new Vector3(this.x / length, this.y / length, this.z / length);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    flat(): number[] {
        return [this.x, this.y, this.z];
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    clamp( min:Vector3, max:Vector3 ) {

        // assumes min < max, componentwise

        this.x = Math.max( min.x, Math.min( max.x, this.x ) );
        this.y = Math.max( min.y, Math.min( max.y, this.y ) );
        this.z = Math.max( min.z, Math.min( max.z, this.z ) );

        return this;

    }
    
    copy( v: Vector3 ) {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;

    }

    toString(): string {
        return `[${this.flat().join(", ")}]`;
    }

    static One(value: number = 1): Vector3 {
        return new Vector3(value, value, value);
    }
}

export { Vector3 };

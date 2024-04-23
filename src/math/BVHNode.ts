import { Box3 } from "./Box3";
import { SingleSplat } from "../splats/SingleSplat";
import { Vector3 } from "./Vector3";
import { Ray } from "./Ray";

class BVHNode {
    public left: BVHNode | null = null;
    public right: BVHNode | null = null;
    public bounds: Box3;
    public objects: SingleSplat[] = [];

    constructor(objects: SingleSplat[]) {
        this.bounds = new Box3(new Vector3(Infinity, Infinity, Infinity), new Vector3(-Infinity, -Infinity, -Infinity));
        objects.forEach(obj => {
            this.bounds.expand(obj.bounds.min);
            this.bounds.expand(obj.bounds.max);
        });
        if (objects.length <= 2) {
            this.objects = objects;
        } else {
            this.split(objects);
        }
    }

    private split(objects: SingleSplat[]): void {
        const mid = Math.floor(objects.length / 2);
        objects.sort((a, b) => a.bounds.center().x - b.bounds.center().x); // Simplistic sort by X-axis

        this.left = new BVHNode(objects.slice(0, mid));
        this.right = new BVHNode(objects.slice(mid));
    }

    public intersects(ray: Ray, maxDistance: number): SingleSplat[] {
        if (!ray.intersectsBox(this.bounds, maxDistance)) {
            return [];
        }
        if (this.objects.length > 0) {
            return this.objects.filter(obj => ray.intersectsBox(obj.bounds, maxDistance));
        }
        return [
            ...(this.left ? this.left.intersects(ray, maxDistance) : []),
            ...(this.right ? this.right.intersects(ray, maxDistance) : [])
        ];
    }
}

export { BVHNode }
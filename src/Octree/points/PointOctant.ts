import {Vector3} from "../../math/Vector3";
import {Octant} from "../core/Octant";
import {PointData} from "./PointData";

const p = new Vector3();

export class PointOctant<T> extends Octant<PointData<T>> {
    constructor(min: Vector3, max: Vector3) {
        super(min, max);
    }

    distanceToSquared(point: Vector3): number {

        const clampedPoint = p.copy(point).clamp(this.min, this.max);
        return clampedPoint.sub(point).lengthSq();

    }

    distanceToCenterSquared(point: Vector3): number {

        const center = this.getCenter(p);

        const dx = point.x - center.x;
        const dy = point.y - center.x;
        const dz = point.z - center.z;

        return dx * dx + dy * dy + dz * dz;

    }

    contains(point: Vector3, bias: number): boolean {

        const min = this.min;
        const max = this.max;

        return (
            point.x >= min.x - bias &&
            point.y >= min.y - bias &&
            point.z >= min.z - bias &&
            point.x <= max.x + bias &&
            point.y <= max.y + bias &&
            point.z <= max.z + bias
        );
    }

    redistribute(bias: number): void {

        const children = this.children;
        const pointData = this.data;

        if(children !== null && pointData !== null) {

            const points = pointData.points;
            const data = pointData.data;

            for(let i = 0, il = points.length; i < il; ++i) {

                const point = points[i];
                const entry = data[i];

                for(let j = 0, jl = children.length; j < jl; ++j) {

                    const child = children[j] as PointOctant<T>;

                    if(child.contains(point, bias)) {

                        if(child.data === null) {

                            child.data = new PointData<T>();

                        }

                        const childData = child.data;
                        childData.points.push(point);
                        childData.data.push(entry);

                        break;

                    }

                }

            }

            this.data = null;

        }

    }

    merge(): void {

        const children = this.children;

        if(children !== null) {

            const pointData = new PointData<T>();

            for(let i = 0, l = children.length; i < l; ++i) {

                const child = children[i] as PointOctant<T>;
                const childData = child.data;

                if(childData !== null) {

                    pointData.points = pointData.points.concat(childData.points);
                    pointData.data = pointData.data.concat(childData.data);

                }

            }

            this.children = null;
            this.data = pointData;

        }

    }

}
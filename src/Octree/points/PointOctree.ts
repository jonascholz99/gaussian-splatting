import { Octree } from "../Octree";
import {Vector3} from "../../math/Vector3";
import {PointOctant} from "./PointOctant";
import {PointContainer} from "./PointContainer";
import {RayPointIntersection} from "./RayPointIntersection";
import {Raycaster} from "../../utils/Raycaster";
import {PointData} from "./PointData";

function countPoints<T>(octant: PointOctant<T>): number {

    const children = octant.children;
    let result = 0;

    if(children !== null) {

        for(let i = 0, l = children.length; i < l; ++i) {

            result += countPoints(children[i] as PointOctant<T>);

        }

    } else if(octant.data !== null) {

        const pointData = octant.data;
        result = pointData.points.length;

    }

    return result;

}

function set<T>(point: Vector3, data: T, octree: PointOctree<T>, octant: PointOctant<T> | null, depth: number): boolean {

    let exists = false;
    let done = false;

    if(octant !== null && octant.contains(point, octree.getBias())) {

        let children = octant.children;

        if(children === null) {

            let index = 0;

            if(octant.data === null) {

                octant.data = new PointData<T>();

            } else {

                const pointData = octant.data;
                const points = pointData.points;

                for(let i = 0, l = points.length; !exists && i < l; ++i) {

                    exists = points[i].equals(point);
                    index = i;

                }

            }

            const pointData = octant.data;

            if(exists) {

                pointData.data[index] = data;
                done = true;

            } else if(pointData.points.length < octree.getMaxPoints() || depth === octree.getMaxDepth()) {

                pointData.points.push(point.clone());
                pointData.data.push(data);
                done = true;

            } else {

                octant.split();
                octant.redistribute(octree.getBias());
                children = octant.children;

            }

        }

        if(children !== null) {

            ++depth;

            for(let i = 0, l = children.length; !done && i < l; ++i) {

                done = set(point, data, octree, children[i] as PointOctant<T>, depth);

            }

        }

    }

    return done;
}

function remove<T>(point: Vector3, octree: PointOctree<T>, octant: PointOctant<T>,
                   parent: PointOctant<T> | null): T | null {

    const children = octant.children;
    let result = null;

    if(octant.contains(point, octree.getBias())) {

        if(children !== null) {

            for(let i = 0, l = children.length; result === null && i < l; ++i) {

                result = remove(point, octree, children[i] as PointOctant<T>, octant);

            }

        } else if(octant.data !== null) {

            const pointData = octant.data;
            const points = pointData.points;
            const data = pointData.data;

            for(let i = 0, l = points.length; i < l; ++i) {

                if(points[i].equals(point)) {

                    const last = l - 1;
                    result = data[i];

                    // If the point is NOT the last one in the array:
                    if(i < last) {

                        // Overwrite with the last point and data entry.
                        points[i] = points[last];
                        data[i] = data[last];

                    }

                    // Drop the last entry.
                    points.pop();
                    data.pop();

                    if(parent !== null && countPoints(parent) <= octree.getMaxPoints()) {

                        parent.merge();

                    }

                    break;

                }

            }

        }

    }

    return result;
}

function get<T>(point: Vector3, octree: PointOctree<T>, octant: PointOctant<T>): T | null {

    const children = octant.children;
    let result = null;

    if(octant.contains(point, octree.getBias())) {

        if(children !== null) {

            for(let i = 0, l = children.length; result === null && i < l; ++i) {

                result = get(point, octree, children[i] as PointOctant<T>);

            }

        } else if(octant.data !== null) {

            const pointData = octant.data;
            const points = pointData.points;
            const data = pointData.data;

            for(let i = 0, l = points.length; result === null && i < l; ++i) {

                if(point.equals(points[i])) {

                    result = data[i];

                }

            }

        }

    }

    return result;
}

function move<T>(point: Vector3, position: Vector3, octree: PointOctree<T>,
                 octant: PointOctant<T>, parent: PointOctant<T> | null, depth: number): T | null {

    const children = octant.children;
    let result = null;

    if(octant.contains(point, octree.getBias())) {

        if(octant.contains(position, octree.getBias())) {

            // The point and the new position both fall into the current octant.
            if(children !== null) {

                ++depth;

                for(let i = 0, l = children.length; result === null && i < l; ++i) {

                    const child = children[i] as PointOctant<T>;
                    result = move(point, position, octree, child, octant, depth);

                }

            } else if(octant.data !== null) {

                // No divergence - the point can be updated in place.
                const pointData = octant.data;
                const points = pointData.points;
                const data = pointData.data;

                for(let i = 0, l = points.length; i < l; ++i) {

                    if(point.equals(points[i])) {

                        // The point exists! Update its position.
                        points[i].copy(position);
                        result = data[i];
                        break;

                    }

                }

            }

        } else {

            // Retrieve the point and remove it.
            result = remove(point, octree, octant, parent);

            // Go back to the parent octant and add the updated point.
            set(position, result, octree, parent, depth - 1);

        }

    }

    return result;

}


function findNearestPoint<T>(point: Vector3, maxDistance: number,
                             skipSelf: boolean, octant: PointOctant<T>): PointContainer<T> | null {

    interface SortableOctant<T> {

        octant: PointOctant<T>;
        distance: number;

    }

    let result = null;
    let bestDistance = maxDistance;

    if(octant.children !== null) {

        // Sort the children: smallest distance to the point first, ASC.
        const sortedChildren: SortableOctant<T>[] = octant.children.map((child) => {

            // Precompute distances.
            const octant = child as PointOctant<T>;

            return {
                distance: octant.distanceToCenterSquared(point),
                octant
            };

        }).sort((a, b) => a.distance - b.distance);

        // Traverse from closest to furthest.
        for(let i = 0, l = sortedChildren.length; i < l; ++i) {

            const child = sortedChildren[i].octant;

            if(child.contains(point, bestDistance)) {

                const intermediateResult = findNearestPoint(
                    point, bestDistance, skipSelf, child
                );

                if(intermediateResult !== null) {

                    bestDistance = intermediateResult.distance;
                    result = intermediateResult;

                    if(bestDistance === 0.0) {

                        break;

                    }

                }

            }

        }

    } else if(octant.data !== null) {

        const pointData = octant.data;
        const points = pointData.points;
        const data = pointData.data;

        let index = -1;

        for(let i = 0, l = points.length; i < l; ++i) {

            if(points[i].equals(point)) {

                if(!skipSelf) {

                    bestDistance = 0.0;
                    index = i;
                    break;

                }

            } else {

                const distance = point.distanceTo(points[i]);

                if(distance < bestDistance) {

                    bestDistance = distance;
                    index = i;

                }

            }

        }

        if(index >= 0) {

            result = new PointContainer(points[index], data[index], bestDistance);

        }

    }

    return result;

}

function findPoints<T>(point: Vector3, radius: number, skipSelf: boolean,
                       octant: PointOctant<T>, result: PointContainer<T>[]): void {

    const children = octant.children;

    if(children !== null) {

        for(let i = 0, l = children.length; i < l; ++i) {

            const child = children[i] as PointOctant<T>;

            if(child.contains(point, radius)) {

                findPoints(point, radius, skipSelf, child, result);

            }

        }

    } else if(octant.data !== null) {

        const pointData = octant.data;
        const points = pointData.points;
        const data = pointData.data;

        for(let i = 0, l = points.length; i < l; ++i) {

            const p = points[i];

            if(p.equals(point)) {

                if(!skipSelf) {

                    result.push(new PointContainer(p.clone(), data[i], 0.0));

                }

            } else {

                const rSq = radius * radius;
                const dSq = p.distanceToSquared(point);

                if(dSq <= rSq) {

                    result.push(new PointContainer(p.clone(), data[i], Math.sqrt(dSq)));

                }

            }

        }

    }

}


export class PointOctree<T> extends Octree {
    private bias: number;
    
    private maxPoints: number;
    
    private maxDepth: number;
    
    constructor(min: Vector3, max: Vector3, bias = 0.0, maxPoints = 8, maxDepth = 8) {
        super(new PointOctant<T>(min, max));
        
        this.bias = Math.max(0.0, bias);
        this.maxPoints = Math.max(1, Math.round(maxPoints));
        this.maxDepth = Math.max(0, Math.round(maxDepth));
    }
    
    getBias(): number {
        return this.bias;
    }
    
    getMaxPoints(): number {
        return this.maxPoints;
    }

    getMaxDepth(): number {
        return this.maxDepth;
    }

    countPoints(octant: PointOctant<T> = this.root as PointOctant<T>): number {
        return countPoints(octant);
    }

    set(point: Vector3, data: T): boolean {
        return set(point, data, this, this.root as PointOctant<T>, 0);
    }

    remove(point: Vector3): T | null {
        return remove(point, this, this.root as PointOctant<T>, null);
    }

    get(point: Vector3): T | null {
        return get(point, this, this.root as PointOctant<T>);
    }
    
    move(point: Vector3, position: Vector3): T | null {
        return move(point, position, this, this.root as PointOctant<T>, null, 0);
    }

    findNearestPoint(point: Vector3, maxDistance = Number.POSITIVE_INFINITY, skipSelf = false): PointContainer<T> | null {
        const root = this.root as PointOctant<T>;
        const result = findNearestPoint(point, maxDistance, skipSelf, root);

        if(result !== null && result.point !== null) {

            result.point = result.point.clone();

        }

        return result;
    }

    findPoints(point: Vector3, radius: number, skipSelf = false): PointContainer<T>[] {
        const result: PointContainer<T>[] = [];
        findPoints(point, radius, skipSelf, this.root as PointOctant<T>, result);
        return result;
    }

    raycast(raycaster: Raycaster): RayPointIntersection<T>[] {

        const result: RayPointIntersection<T>[] = [];
        const octants = super.getIntersectingNodes(raycaster) as PointOctant<T>[];

        if(octants.length > 0) {

            for(let i = 0, l = octants.length; i < l; ++i) {

                const octant = octants[i];
                const pointData = octant.data;

                if(pointData !== null) {

                    pointData.testPoints(raycaster, result);

                }

            }

        }

        return result;
    }
} 
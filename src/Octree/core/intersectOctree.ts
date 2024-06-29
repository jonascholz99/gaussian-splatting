import { Node } from "../core/Node.js";
import { RaycastingFlags } from "./RaycastingFlags.js";
import { Vector3 } from "../../math/Vector3";
import { Box3 } from "../../math/Box3";
import {NewRay} from "../../math/NewRay";

const v = new Vector3();
const b = new Box3(
    new Vector3(Infinity, Infinity, Infinity),
    new Vector3(-Infinity, -Infinity, -Infinity),
);
const d = new Box3(
    new Vector3(Infinity, Infinity, Infinity),
    new Vector3(-Infinity, -Infinity, -Infinity),
);
const r = new NewRay();


export function intersectOctree(octree: Node, ray: NewRay, flags: RaycastingFlags): number[] | null {
    
    const min = b.min.set(0, 0, 0);
    const max = b.max.subVectors(octree.max, octree.min);

    const dimensions = octree.getDimensions(d.min);
    const halfDimensions = d.max.copy(dimensions).multiply(0.5);

    const origin = r.origin.copy(ray.origin);
    const direction = r.direction.copy(ray.direction);
    
    origin.sub(octree.getCenter(v)).add(halfDimensions);
    
    flags.value = 0;
    
    if(direction.x < 0.0) {

        origin.x = dimensions.x - origin.x;
        direction.x = -direction.x;
        flags.value |= 4;

    } else if(direction.x === 0.0) {

        direction.x = Number.EPSILON;

    }

    if(direction.y < 0.0) {

        origin.y = dimensions.y - origin.y;
        direction.y = -direction.y;
        flags.value |= 2;

    } else if(direction.y === 0.0) {

        direction.y = Number.EPSILON;

    }

    if(direction.z < 0.0) {

        origin.z = dimensions.z - origin.z;
        direction.z = -direction.z;
        flags.value |= 1;

    } else if(direction.z === 0.0) {

        direction.z = Number.EPSILON;

    }

    const invDirX = 1.0 / direction.x;
    const invDirY = 1.0 / direction.y;
    const invDirZ = 1.0 / direction.z;

    const tx0 = (min.x - origin.x) * invDirX;
    const tx1 = (max.x - origin.x) * invDirX;
    const ty0 = (min.y - origin.y) * invDirY;
    const ty1 = (max.y - origin.y) * invDirY;
    const tz0 = (min.z - origin.z) * invDirZ;
    const tz1 = (max.z - origin.z) * invDirZ;
    
    const hit = (Math.max(tx0, ty0, tz0) < Math.min(tx1, ty1, tz1));
    return hit ? [tx0, ty0, tz0, tx1, ty1, tz1] : null;

}
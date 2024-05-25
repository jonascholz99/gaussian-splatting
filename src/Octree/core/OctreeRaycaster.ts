import { RaycastingFlags } from "./RaycastingFlags";
import { Node } from "./Node";
import {Ray} from "../../math/Ray";
import { intersectOctree } from "./intersectOctree";
import {NewRay} from "../../math/NewRay";

const flags = new RaycastingFlags();

const octantTable = [

    new Uint8Array([4, 2, 1]),
    new Uint8Array([5, 3, 8]),
    new Uint8Array([6, 8, 3]),
    new Uint8Array([7, 8, 8]),
    new Uint8Array([8, 6, 5]),
    new Uint8Array([8, 7, 8]),
    new Uint8Array([8, 8, 7]),
    new Uint8Array([8, 8, 8])

];

export function findNextOctant(currentOctant: number, tx1: number, ty1: number, tz1: number): number {

    let min: number;
    let exit: number;

    // Find the exit plane.
    if(tx1 < ty1) {

        min = tx1;
        exit = 0; // YZ-plane.

    } else {

        min = ty1;
        exit = 1; // XZ-plane.

    }

    if(tz1 < min) {

        exit = 2; // XY-plane.

    }

    return octantTable[currentOctant][exit];

}

function findEntryOctant(tx0: number, ty0: number, tz0: number, txm: number, tym: number, tzm: number): number {

    let entry = 0;

    // Find the entry plane.
    if(tx0 > ty0 && tx0 > tz0) {

        // YZ-plane.
        if(tym < tx0) {

            entry |= 2;

        }

        if(tzm < tx0) {

            entry |= 1;

        }

    } else if(ty0 > tz0) {

        // XZ-plane.
        if(txm < ty0) {

            entry |= 4;

        }

        if(tzm < ty0) {

            entry |= 1;

        }

    } else {

        // XY-plane.
        if(txm < tz0) {

            entry |= 4;

        }

        if(tym < tz0) {

            entry |= 2;

        }

    }

    return entry;

}

function raycastOctant(node: Node, tx0: number, ty0: number, tz0: number, tx1: number, ty1: number, tz1: number, result: Node[]): void {
    if(tx1 >= 0.0 && ty1 >= 0.0 && tz1 >= 0.0) {

        const c = node.children;

        if(c === null || c === undefined) {

            // Leaf.
            result.push(node);

        } else {

            // Calculate mean values.
            const txm = 0.5 * (tx0 + tx1);
            const tym = 0.5 * (ty0 + ty1);
            const tzm = 0.5 * (tz0 + tz1);

            const f = flags.value;
            let currentOctant = findEntryOctant(tx0, ty0, tz0, txm, tym, tzm);

            /* The possibilities for the next node are passed in the same respective
            order as the t-values. Hence, if the first value is found to be the
            greatest, the fourth one will be returned. If the second value is the
            greatest, the fifth one will be returned, etc. */

            while(currentOctant < 8) {

                switch(currentOctant) {

                    case 0:
                        raycastOctant(c[f], tx0, ty0, tz0, txm, tym, tzm, result);
                        currentOctant = findNextOctant(currentOctant, txm, tym, tzm);
                        break;

                    case 1:
                        raycastOctant(c[f ^ 1], tx0, ty0, tzm, txm, tym, tz1, result);
                        currentOctant = findNextOctant(currentOctant, txm, tym, tz1);
                        break;

                    case 2:
                        raycastOctant(c[f ^ 2], tx0, tym, tz0, txm, ty1, tzm, result);
                        currentOctant = findNextOctant(currentOctant, txm, ty1, tzm);
                        break;

                    case 3:
                        raycastOctant(c[f ^ 3], tx0, tym, tzm, txm, ty1, tz1, result);
                        currentOctant = findNextOctant(currentOctant, txm, ty1, tz1);
                        break;

                    case 4:
                        raycastOctant(c[f ^ 4], txm, ty0, tz0, tx1, tym, tzm, result);
                        currentOctant = findNextOctant(currentOctant, tx1, tym, tzm);
                        break;

                    case 5:
                        raycastOctant(c[f ^ 5], txm, ty0, tzm, tx1, tym, tz1, result);
                        currentOctant = findNextOctant(currentOctant, tx1, tym, tz1);
                        break;

                    case 6:
                        raycastOctant(c[f ^ 6], txm, tym, tz0, tx1, ty1, tzm, result);
                        currentOctant = findNextOctant(currentOctant, tx1, ty1, tzm);
                        break;

                    case 7:
                        raycastOctant(c[f ^ 7], txm, tym, tzm, tx1, ty1, tz1, result);
                        // Far top right octant. No other octants can be reached from here.
                        currentOctant = 8;
                        break;

                }

            }

        }

    }
}

export class OctreeRaycaster {
    
    static intersectOctree(node: Node, ray: NewRay): Node[] {

        const result: Node[] = [];
        const t = intersectOctree(node, ray, flags);

        if(t !== null) {

            raycastOctant(node, t[0], t[1], t[2], t[3], t[4], t[5], result);

        }

        return result;

    }

}
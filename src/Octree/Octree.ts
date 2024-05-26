import { Tree } from "./core/Tree";
import { Node } from "./core/Node";
import { Vector3 } from "../math/Vector3";
import { Box3 } from "../math/Box3";
import { OctreeIterator } from "./core/OctreeIterator";
import {Raycaster} from "../utils/Raycaster";
import {OctreeRaycaster} from "./core/OctreeRaycaster";
import {Frustum} from "../math/Frustum";

const b = new Box3(
    new Vector3(Infinity, Infinity, Infinity),
    new Vector3(-Infinity, -Infinity, -Infinity),
);

function getDepth(node: Node): number {
    const children = node.children;
    
    let result = 0;
    
    if(children !== undefined && children !== null) {
        for(let i = 0; i < children.length; ++i) {
            const d = 1 + getDepth(children[i]);
            
            if(d > result) {
                result = d;
            }
        }
    }
    
    return result;
}

function cull(node: Node, region: Box3 | Frustum, result: Node[]): void {
    const children = node.children;
    
    b.min = node.min;
    b.max = node.max;
    
    if(region.intersectsBox(b)) {
        if(children !== undefined && children !== null) {
            for(let i = 0; i < children.length; ++i) {
                cull(children[i], region, result);
            }
        } else {
            result.push(node);
        }
    }
}

function findNodesByLevel(node: Node, level: number, depth: number, result: Node[]): void {
    const children = node.children;
    
    if(depth === level) {
        result.push(node);
    } else if(children !== undefined && children !== null) {
        
        ++depth;
        
        for(let i = 0; i < children.length; ++i) {
            findNodesByLevel(children[i], level, depth, result)
        }
    }
}

export class Octree implements Tree, Iterable<Node> {
    protected root: Node;
    
    constructor(root: Node) {
        this.root = root;
    }
    
    get min(): Vector3 {
        return this.root.min;
    }
    
    get max(): Vector3 {
        return this.root.max;
    }
    
    get children(): Node[] | null {
        return this.root.children || null;
    }
    
    getCenter(result: Vector3): Vector3 {
        return this.root.getCenter(result);
    }
    
    getDimensions(result: Vector3): Vector3 {
        return this.root.getDimensions(result);
    }
    
    cull(region: Box3 | Frustum): Node[] {
        const result: Node[] = []
        cull(this.root, region, result);
        return result;
    }
    
    getDepth(): number {
        return getDepth(this.root);
    }
    
    findNodesByLevel(level: number): Node[] {
        const result: Node[] = [];
        findNodesByLevel(this.root, level, 0, result);
        return result;
    }
    
    getIntersectingNodes(raycaster: Raycaster): Node[] {
        return OctreeRaycaster.intersectOctree(this.root, raycaster.ray);
    }
    
    leaves(region: Box3 | Frustum | null = null): Iterator<Node> {
        return new OctreeIterator(this.root, region);
    }
    
    [Symbol.iterator](): Iterator<Node> {
        return new OctreeIterator(this.root);
    }
}
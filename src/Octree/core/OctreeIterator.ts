import { Box3 } from "../../math/Box3";
import { Vector3 } from "../../math/Vector3";
import { Node } from "./Node";
import {Frustum} from "../../math/Frustum";

const b = new Box3(
    new Vector3(Infinity, Infinity, Infinity),
    new Vector3(-Infinity, -Infinity, -Infinity),
);

export class OctreeIterator implements Iterator<Node>, Iterable<Node> {
    
    private root: Node;
    
    private region: Box3 | Frustum | null;
    
    private result!: IteratorResult<Node>;
    
    private trace!: Node[];
    
    private indices!: number[];
    
    constructor(root: Node, region: Box3 | Frustum | null = null) {
        this.root = root;
        this.region = region;
        this.reset();
    }
    
    reset() {
        const root = this.root;
        
        this.trace = [];
        this.indices = [];
        
        if(root !== null) {
            b.min = root.min;
            b.max = root.max;
            
            if(this.region === null || this.region.intersectsBox(b)) {
                this.trace.push(root);
                this.indices.push(0);
            }
        }
        
        this.result = {
            done: false
        } as IteratorResult<Node>;
        
        return this;
    }

    next(): IteratorResult<Node> {
        const region = this.region;
        const indices = this.indices;
        const trace = this.trace;
        
        let octant = null;
        let depth = trace.length - 1;
        
        while(octant === null && depth >= 0) {
            const index = indices[depth]++;
            const children = trace[depth].children;
            
            if(index < 8) {
                if(children !== undefined && children !== null) {
                    const child = children[index];
                    
                    if(region !== null) {
                        b.min = child.min;
                        b.max = child.max;
                        
                        if(!region.intersectsBox(b)) {
                            continue;
                        }
                    }
                    
                    trace.push(child);
                    indices.push(0);
                    
                    ++depth;
                } else {
                    octant = trace.pop();
                    indices.pop();
                }
            } else {
                trace.pop();
                indices.pop();
                
                --depth;
            }
        }
        
        this.result.value = octant;
        this.result.done = (octant === null);
        
        return this.result;
    }
    
    [Symbol.iterator](): Iterator<Node> {
        return this;
    }
}

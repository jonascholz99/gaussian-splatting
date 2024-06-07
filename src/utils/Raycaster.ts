import { Matrix4 } from "../math/Matrix4";
import { NewRay } from "../math/NewRay";
import { Camera } from "../cameras/Camera";
import {Vector3} from "../math/Vector3";

const _matrix:Matrix4 = new Matrix4();

class NewRaycaster {
    public ray: NewRay;
    
    public near: number;
    public far: number;
    public camera: Camera | null;
    
    public params;
    
    constructor(origin: Vector3, direction: Vector3, near: number = 0, far: number = Infinity ) {
        this.ray = new NewRay( origin, direction );
        
        this.near = near;
        this.far = far;
        this.camera = null;
        
        this.params = {
            Mesh: {},
            Line: { threshold: 1 },
            LOD: {},
            Points: { threshold: 1 },
            Sprite: {}
        };
    }

    set( origin: Vector3, direction: Vector3 ) {
        this.ray.set( origin, direction );
    }

    // intersectObject( object: any, recursive = true, intersects = [] ) {
    //
    //     intersect( object, this, intersects, recursive );
    //
    //     intersects.sort( ascSort );
    //
    //     return intersects;
    //
    // }
    //
    // intersectObjects( objects: any, recursive = true, intersects = [] ) {
    //
    //     for ( let i = 0, l = objects.length; i < l; i ++ ) {
    //
    //         intersect( objects[ i ], this, intersects, recursive );
    //
    //     }
    //
    //     intersects.sort( ascSort );
    //
    //     return intersects;
    //
    // }

}

// function ascSort( a, b ) {
//
//     return a.distance - b.distance;
//
// }
//
// function intersect( object:any, raycaster:Raycaster, intersects, recursive ) {
//
//     if ( object.layers.test( raycaster.layers ) ) {
//
//         object.raycast( raycaster, intersects );
//
//     }
//
//     if ( recursive === true ) {
//
//         const children = object.children;
//
//         for ( let i = 0, l = children.length; i < l; i ++ ) {
//
//             intersect( children[ i ], raycaster, intersects, true );
//
//         }
//
//     }
// }

export { NewRaycaster }
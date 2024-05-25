import {Vector3} from "./Vector3";
import {Box3} from "./Box3";

const _vector:Vector3 = new Vector3();
const _segCenter:Vector3 = new Vector3();
const _segDir:Vector3 = new Vector3();
const _diff:Vector3 = new Vector3();

const _edge1:Vector3 = new Vector3();
const _edge2:Vector3 = new Vector3();
const _normal:Vector3 = new Vector3();
class NewRay {
    public origin: Vector3;
    public direction: Vector3;
    
    constructor(origin:Vector3 = new Vector3(), direction:Vector3 = new Vector3(0, 0, -1)) {
        this.origin = origin;
        this.direction = direction;
    }
    
    set(origin:Vector3, direction:Vector3) {
        this.origin.copy( origin );
        this.direction.copy( direction );
        
        return this;
    }
    
    copy( ray: NewRay ) {
        this.origin.copy( ray.origin );
        this.direction.copy( ray.direction );

        return this;
    }

    at( t: number, target:Vector3 ) {

        return target.copy( this.origin ).addScaledVector( this.direction, t );

    }

    lookAt( v:Vector3 ) {

        this.direction.copy( v ).sub( this.origin ).normalize();

        return this;

    }

    recast( t:number ) {

        this.origin.copy( this.at( t, _vector ) );

        return this;

    }

    closestPointToPoint( point:Vector3, target:Vector3 ) {

        target.subVectors( point, this.origin );

        const directionDistance = target.dot( this.direction );

        if ( directionDistance < 0 ) {

            return target.copy( this.origin );

        }

        return target.copy( this.origin ).addScaledVector( this.direction, directionDistance );

    }

    distanceToPoint( point:Vector3 ) {

        return Math.sqrt( this.distanceSqToPoint( point ) );

    }

    distanceSqToPoint( point:Vector3 ) {

        const directionDistance = _vector.subVectors( point, this.origin ).dot( this.direction );

        // point behind the ray

        if ( directionDistance < 0 ) {

            return this.origin.distanceToSquared( point );

        }

        _vector.copy( this.origin ).addScaledVector( this.direction, directionDistance );

        return _vector.distanceToSquared( point );

    }

    intersectBox( box: Box3, target:Vector3 ) {

        let tmin, tmax, tymin, tymax, tzmin, tzmax;

        const invdirx = 1 / this.direction.x,
            invdiry = 1 / this.direction.y,
            invdirz = 1 / this.direction.z;

        const origin = this.origin;

        if ( invdirx >= 0 ) {

            tmin = ( box.min.x - origin.x ) * invdirx;
            tmax = ( box.max.x - origin.x ) * invdirx;

        } else {

            tmin = ( box.max.x - origin.x ) * invdirx;
            tmax = ( box.min.x - origin.x ) * invdirx;

        }

        if ( invdiry >= 0 ) {

            tymin = ( box.min.y - origin.y ) * invdiry;
            tymax = ( box.max.y - origin.y ) * invdiry;

        } else {

            tymin = ( box.max.y - origin.y ) * invdiry;
            tymax = ( box.min.y - origin.y ) * invdiry;

        }

        if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

        if ( tymin > tmin || isNaN( tmin ) ) tmin = tymin;

        if ( tymax < tmax || isNaN( tmax ) ) tmax = tymax;

        if ( invdirz >= 0 ) {

            tzmin = ( box.min.z - origin.z ) * invdirz;
            tzmax = ( box.max.z - origin.z ) * invdirz;

        } else {

            tzmin = ( box.max.z - origin.z ) * invdirz;
            tzmax = ( box.min.z - origin.z ) * invdirz;

        }

        if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

        if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

        if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

        //return point closest to the ray (positive side)

        if ( tmax < 0 ) return null;

        return this.at( tmin >= 0 ? tmin : tmax, target );

    }

    intersectsBox( box:Box3 ) {

        return this.intersectBox( box, _vector ) !== null;

    }

    equals( ray: NewRay ) {

        return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

    }

    clone() {
        const Constructor = this.constructor as new () => this;
        return new Constructor().copy(this);
    }
}

export { NewRay }
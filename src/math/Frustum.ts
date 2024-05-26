import { Plane } from "./Plane";
import { Matrix4 } from "./Matrix4";
import { Box3 } from "./Box3";
import { Vector3 } from "./Vector3";

const _vector = new Vector3();

function intersectPlanes(p1: Plane, p2: Plane, p3: Plane): Vector3 | null {
    const n1 = p1.normal;
    const n2 = p2.normal;
    const n3 = p3.normal;

    const det = n1.dot(n2.cross(n3))

    if(Math.abs(det) < 1e-6) {
        return null;
    }

    const c1 = p1.constant;
    const c2 = p2.constant;
    const c3 = p3.constant;

    const n2n3 = n2.cross(n3).multiply(-c1);
    const n3n1 = n3.cross(n1).multiply(-c2);
    const n1n2 = n1.cross(n2).multiply(-c3);

    const point = new Vector3().addVectors(n2n3, n3n1).add(n1n2).divide(det);

    return point;
}

class Frustum {
    planes: Plane[];

    constructor(
        p0: Plane = new Plane(),
        p1: Plane = new Plane(),
        p2: Plane = new Plane(),
        p3: Plane = new Plane(),
        p4: Plane = new Plane(),
        p5: Plane = new Plane()
    ) {
        this.planes = [p0, p1, p2, p3, p4, p5];
    }
    
    setFromProjectionMatrix(m: Matrix4) {
        const planes = this.planes;
        const me = m.buffer;

        const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
        const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
        const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
        const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

        planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
        planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
        planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
        planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
        planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
        planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
    }

    intersectsBox(box: Box3): boolean {
        const planes = this.planes;

        for (let i = 0; i < 6; i++) {
            const plane = planes[i];

            // corner at max distance
            _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
            _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
            _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;

            if (plane.distanceToPoint(_vector) < 0) {
                return false;
            }
        }

        return true;
    }

    getFrustumPoints(): Vector3[] {
        const planes = this.planes;

        // Es gibt 8 Ecken in einem Frustum
        const points: Vector3[] = [];

        // Vorderseite
        points.push(intersectPlanes(planes[0], planes[2], planes[4])!); // Near-Left-Top
        points.push(intersectPlanes(planes[1], planes[2], planes[4])!); // Near-Right-Top
        points.push(intersectPlanes(planes[0], planes[3], planes[4])!); // Near-Left-Bottom
        points.push(intersectPlanes(planes[1], planes[3], planes[4])!); // Near-Right-Bottom

        // Rückseite (Far)
        points.push(intersectPlanes(planes[0], planes[3], planes[5])!); // Far-Left-Top         
        points.push(intersectPlanes(planes[1], planes[3], planes[5])!); // Far-Right-Top
        points.push(intersectPlanes(planes[0], planes[2], planes[5])!); // Far-Left-Bottom
        points.push(intersectPlanes(planes[1], planes[2], planes[5])!); // Far-Right-Bottom

        return points;
    }
}

export { Frustum }
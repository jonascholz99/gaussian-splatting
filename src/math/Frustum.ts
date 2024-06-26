import { Plane } from "./Plane";
import { Matrix4 } from "./Matrix4";
import { Box3 } from "./Box3";
import { Vector3 } from "./Vector3";
import {WebGLRenderer} from "../renderers/WebGLRenderer";
import {CubeVisualisationProgram} from "../renderers/webgl/programs/individual/CubeVisualisationProgram";
import {ShaderProgram} from "../renderers/webgl/programs/ShaderProgram";
import {PlaneProgram} from "../renderers/webgl/programs/individual/PlaneProgram";
import {NewRay} from "./NewRay";
import {Camera} from "../cameras/Camera";

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

    const n2n3 = n2.cross(n3).multiply(c1);
    const n3n1 = n3.cross(n1).multiply(c2);
    const n1n2 = n1.cross(n2).multiply(c3);

    const point = new Vector3().addVectors(n2n3, n3n1).add(n1n2).divide(det);
    return point;
}

class Frustum {
    planes: Plane[];
    frustumCorners: Vector3[] | undefined;
    frustumRenderProgram: ShaderProgram | undefined;
    needsUpdate: boolean;

    margin: number | undefined;
    marginFrustum: Frustum | undefined;

    constructor(
        p0: Plane = new Plane(),
        p1: Plane = new Plane(),
        p2: Plane = new Plane(),
        p3: Plane = new Plane(),
        p4: Plane = new Plane(),
        p5: Plane = new Plane()
    ) {
        this.planes = [p0, p1, p2, p3, p4, p5];
        this.needsUpdate = true;
    }

    setFromCube(cube: Box3, camera: Camera) {
        
        const points = cube.getCorners();
        
        const projectedPoints = points.map(point => camera.worldToCameraPoint(point));
        
        this.setFromPoints(
            projectedPoints[0], // Near-Top-Left
            projectedPoints[1], // Near-Top-Right
            projectedPoints[2], // Near-Bottom-Left
            projectedPoints[3], // Near-Bottom-Right
            projectedPoints[4], // Far-Top-Left
            projectedPoints[5], // Far-Top-Right
            projectedPoints[6], // Far-Bottom-Left
            projectedPoints[7]  // Far-Bottom-Right
        );
        
        this.needsUpdate = true;
    }
    
    
    setFromPoints(
        nearTopLeft: Vector3, 
        nearTopRight: Vector3, 
        nearBottomLeft: Vector3, 
        nearBottomRight: Vector3, 
        farTopLeft: Vector3, 
        farTopRight: Vector3, 
        farBottomLeft: Vector3, 
        farBottomRight: Vector3
    ) {
        const planes = this.planes;

        // Near Plane
        planes[0].setFromCoplanarPoints(nearTopLeft, nearTopRight, nearBottomRight).normalize();

        // Far Plane
        planes[1].setFromCoplanarPoints(farTopRight, farTopLeft, farBottomLeft).normalize();

        // Left Plane
        planes[2].setFromCoplanarPoints(nearTopLeft, nearBottomLeft, farBottomLeft).normalize();

        // Right Plane
        planes[3].setFromCoplanarPoints(nearBottomRight, nearTopRight, farTopRight).normalize();

        // Top Plane
        planes[4].setFromCoplanarPoints(nearTopLeft, farTopLeft, nearTopRight).normalize();

        // Bottom Plane
        planes[5].setFromCoplanarPoints(nearBottomLeft, nearBottomRight, farBottomRight).normalize();

        this.needsUpdate = true;
    }

    setFromProjectionMatrix(m: Matrix4) {
        const planes = this.planes;
        const me = m.buffer;

        const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
        const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
        const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
        const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

        planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize(); // Linke
        planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize(); // Rechte
        planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize(); // Obere
        planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize(); // Untere
        planes[4].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize(); // Nähe
        planes[5].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize(); // Ferne

        this.needsUpdate = true;
    }



    intersectsBox(box: Box3, renderer: WebGLRenderer | null = null): boolean {
        const planes = this.planes;
        
        for (let i = 0; i < 6; i++) {
            const plane = planes[i];

            // corner at max distance
            _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
            _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
            _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;
            
            if (plane.distanceToPoint(_vector) < 0) {
                
                if(renderer !== null) {
                    let planeRenderProgram = new PlaneProgram(renderer, [], plane);
                    renderer.addProgram(planeRenderProgram);

                    let upperLeftCorner = new Float32Array([_vector.x - 0.01, _vector.y - 0.01, _vector.z - 0.01]);
                    let bottomRightCorner = new Float32Array([_vector.x + 0.01, _vector.y + 0.01, _vector.z + 0.01]);

                    let renderProgram = new CubeVisualisationProgram(renderer, [], [upperLeftCorner, bottomRightCorner]);
                    renderer.addProgram(renderProgram);
                }
                
                return false;
            }
        }
        
        return true;
    }

    getFrustumPoints(): Vector3[] {
        if(!this.needsUpdate && this.frustumCorners !== undefined) {
            return this.frustumCorners;
        }

        this.frustumCorners = [];
        const planes = this.planes;

        // Vorderseite
        this.frustumCorners.push(intersectPlanes(planes[4], planes[0], planes[2])!); // Near-Left-Top
        this.frustumCorners.push(intersectPlanes(planes[4], planes[1], planes[2])!); // Near-Right-Top
        this.frustumCorners.push(intersectPlanes(planes[4], planes[0], planes[3])!); // Near-Left-Bottom
        this.frustumCorners.push(intersectPlanes(planes[4], planes[1], planes[3])!); // Near-Right-Bottom

        // Rückseite (Far)
        this.frustumCorners.push(intersectPlanes(planes[5], planes[0], planes[2])!); // Far-Left-Top         
        this.frustumCorners.push(intersectPlanes(planes[5], planes[1], planes[2])!); // Far-Right-Top
        this.frustumCorners.push(intersectPlanes(planes[5], planes[0], planes[3])!); // Far-Left-Bottom
        this.frustumCorners.push(intersectPlanes(planes[5], planes[1], planes[3])!); // Far-Right-Bottom

        this.needsUpdate = false;        
        return this.frustumCorners;
    }
    
    drawFrustum(renderer: WebGLRenderer, visiblePlanes: boolean[] = [true, true, true, true, true, true]) {
        let points = this.getFrustumPoints();
        let corners = []
        for(let i = 0; i < points.length; i++) {
            corners.push(new Float32Array([points[i].x, points[i].y, points[i].z]))
        }

        let borderColor = new Float32Array([0.0, 0.0, 0.0, 1.0]);
        let frustumColor = new Float32Array([1.0, 0.0, 0.0, 0.35]);
        this.frustumRenderProgram = new CubeVisualisationProgram(renderer, [], corners,frustumColor, borderColor, visiblePlanes);
        renderer.addProgram(this.frustumRenderProgram);
    }

    distanceToPoint(point: Vector3): number {
        let minDistance = Infinity;
        for (const plane of this.planes) {
            const distance = plane.distanceToPoint(point);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        return minDistance;
    }
    
    ereaseFrustum(renderer: WebGLRenderer) {
        if(this.frustumRenderProgram !== undefined) {
            renderer.removeProgram(this.frustumRenderProgram);
        }
    }

    getRays(): NewRay[] {
        if (!this.frustumCorners) {
            this.frustumCorners = this.getFrustumPoints();
        }

        const rays = [];

        // Calculate rays from near plane corners to far plane corners
        for (let i = 0; i < 7; i+=2) {
            const nearCorner = this.frustumCorners[i];
            const farCorner = this.frustumCorners[i + 1];
            const direction = farCorner.clone().sub(nearCorner).normalize();
            rays.push(new NewRay(nearCorner, direction));
        }

        return rays;
    }
    
    intersectFrustum(otherFrustum: Frustum, renderer: WebGLRenderer | undefined): Box3{
        const intersectionPoints: Vector3[] = [];
        
        intersectionPoints.push(intersectPlanes( this.planes[2], otherFrustum.planes[3], otherFrustum.planes[4])!);
        intersectionPoints.push(intersectPlanes( this.planes[2], otherFrustum.planes[2], otherFrustum.planes[4])!);
        intersectionPoints.push(intersectPlanes( this.planes[2], otherFrustum.planes[3], otherFrustum.planes[5])!);
        intersectionPoints.push(intersectPlanes( this.planes[2], otherFrustum.planes[2], otherFrustum.planes[5])!);

        intersectionPoints.push(intersectPlanes( this.planes[3], otherFrustum.planes[3], otherFrustum.planes[4])!);
        intersectionPoints.push(intersectPlanes( this.planes[3], otherFrustum.planes[2], otherFrustum.planes[4])!);
        intersectionPoints.push(intersectPlanes( this.planes[3], otherFrustum.planes[3], otherFrustum.planes[5])!);
        intersectionPoints.push(intersectPlanes( this.planes[3], otherFrustum.planes[2], otherFrustum.planes[5])!);

        const boundingBox = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );
        
        if(renderer !== undefined) {
            let a1 = new Float32Array([intersectionPoints[0].x - 0.01, intersectionPoints[0].y - 0.01, intersectionPoints[0].z - 0.01]);
            let a2 = new Float32Array([intersectionPoints[0].x + 0.01, intersectionPoints[0].y + 0.01, intersectionPoints[0].z + 0.01]);

            let b1 = new Float32Array([intersectionPoints[1].x - 0.01, intersectionPoints[1].y - 0.01, intersectionPoints[1].z - 0.01]);
            let b2 = new Float32Array([intersectionPoints[1].x + 0.01, intersectionPoints[1].y + 0.01, intersectionPoints[1].z + 0.01]);

            let c1 = new Float32Array([intersectionPoints[2].x - 0.01, intersectionPoints[2].y - 0.01, intersectionPoints[2].z - 0.01]);
            let c2 = new Float32Array([intersectionPoints[2].x + 0.01, intersectionPoints[2].y + 0.01, intersectionPoints[2].z + 0.01]);

            let d1 = new Float32Array([intersectionPoints[3].x - 0.01, intersectionPoints[3].y - 0.01, intersectionPoints[3].z - 0.01]);
            let d2 = new Float32Array([intersectionPoints[3].x + 0.01, intersectionPoints[3].y + 0.01, intersectionPoints[3].z + 0.01]);

            let e1 = new Float32Array([intersectionPoints[4].x - 0.01, intersectionPoints[4].y - 0.01, intersectionPoints[4].z - 0.01]);
            let e2 = new Float32Array([intersectionPoints[4].x + 0.01, intersectionPoints[4].y + 0.01, intersectionPoints[4].z + 0.01]);

            let f1 = new Float32Array([intersectionPoints[5].x - 0.01, intersectionPoints[5].y - 0.01, intersectionPoints[5].z - 0.01]);
            let f2 = new Float32Array([intersectionPoints[5].x + 0.01, intersectionPoints[5].y + 0.01, intersectionPoints[5].z + 0.01]);

            let g1 = new Float32Array([intersectionPoints[6].x - 0.01, intersectionPoints[6].y - 0.01, intersectionPoints[6].z - 0.01]);
            let g2 = new Float32Array([intersectionPoints[6].x + 0.01, intersectionPoints[6].y + 0.01, intersectionPoints[6].z + 0.01]);

            let h1 = new Float32Array([intersectionPoints[7].x - 0.01, intersectionPoints[7].y - 0.01, intersectionPoints[7].z - 0.01]);
            let h2 = new Float32Array([intersectionPoints[7].x + 0.01, intersectionPoints[7].y + 0.01, intersectionPoints[7].z + 0.01]);

            let borderColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
            let boxColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);

            let pro = new CubeVisualisationProgram(renderer, [], [a1, a2], boxColor, borderColor);
            let pro2 = new CubeVisualisationProgram(renderer, [], [b1, b2], boxColor, borderColor);
            let pro3 = new CubeVisualisationProgram(renderer, [], [c1, c2], boxColor, borderColor);
            let pro4 = new CubeVisualisationProgram(renderer, [], [d1, d2], boxColor, borderColor);
            let pro5 = new CubeVisualisationProgram(renderer, [], [e1, e2], boxColor, borderColor);
            let pro6 = new CubeVisualisationProgram(renderer, [], [f1, f2], boxColor, borderColor);
            let pro7 = new CubeVisualisationProgram(renderer, [], [g1, g2], boxColor, borderColor);
            let pro8 = new CubeVisualisationProgram(renderer, [], [h1, h2], boxColor, borderColor);
            renderer.addProgram(pro);
            renderer.addProgram(pro2);
            renderer.addProgram(pro3);
            renderer.addProgram(pro4);
            renderer.addProgram(pro5);
            renderer.addProgram(pro6);
            renderer.addProgram(pro7);
            renderer.addProgram(pro8);   
        }
        
        for (const point of intersectionPoints) {
            boundingBox.expandByPoint(point);
        }
        
        return boundingBox
    }

    containsPoint(point: Vector3): boolean {
        for (const plane of this.planes) {
            if (plane.distanceToPoint(point) < 0) {
                return false;
            }
        }
        return true;
    }

    containsBox(box: Box3): boolean {
        const corners = box.getCorners();

        for (const corner of corners) {
            if (!this.containsPoint(corner)) {
                return false;
            }
        }
        
        return true;
    }
}

export { Frustum }
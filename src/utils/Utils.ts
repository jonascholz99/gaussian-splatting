import {WebGLRenderer} from "../renderers/WebGLRenderer";
import {Vector3} from "../math/Vector3";
import {CubeVisualisationProgram} from "../renderers/webgl/programs/individual/CubeVisualisationProgram";
import {ShaderProgram} from "../renderers/webgl/programs/ShaderProgram";

class Utils {
    
    public static draw(renderer: WebGLRenderer, point:Vector3, size: number) {
        let upperLeftCorner = new Float32Array([point.x+(size/2), point.y+(size/2), point.z+(size/2)]);
        let bottomRightCorner = new Float32Array([point.x-(size/2), point.y-(size/2), point.z-(size/2)]);

        var renderProgram = new CubeVisualisationProgram(renderer, [], [upperLeftCorner, bottomRightCorner]);
        renderer.addProgram(renderProgram);
    }

    public static drawCone(renderer: WebGLRenderer, points:Vector3[]) {
        
        let vecs: Float32Array[] = []
        for(let i = 0; i < points.length; i++) {
            vecs.push(new Float32Array([points[i].x, points[i].y, points[i].z]))
        }
        var renderProgram = new CubeVisualisationProgram(renderer, [], vecs);
        renderer.addProgram(renderProgram);
    }
}

export { Utils }
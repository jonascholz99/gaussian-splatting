import {ShaderProgram} from "../renderers/webgl/programs/ShaderProgram";
import {WebGLRenderer} from "../renderers/WebGLRenderer";
import {ShaderPass} from "../renderers/webgl/passes/ShaderPass";
import {Octree} from "./Octree";

const axisVertexShader = /*glsl*/ `#version 300 es
uniform mat4 projection, view;

in vec3 position;

void main() {
    gl_Position = projection * view * vec4(position, 1.0);
}
`;

const axisFragmentShader = /*glsl*/ `#version 300 es
precision mediump float;
uniform vec4 cubeColor;
out vec4 outColor;

void main() {
    outColor = cubeColor;
}
`;

class OctreeHelper extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;


    constructor(renderer: WebGLRenderer, passes: ShaderPass[], octree: Octree, level: number = 0, color: Float32Array = new Float32Array([1, 0, 0, 1])) {
        super(renderer, passes);

        const gl = renderer.gl;

        let vertexBuffer: WebGLBuffer;

        let positionAttribute: number;

        let u_projection: WebGLUniformLocation;
        let u_view: WebGLUniformLocation;
        let u_color: WebGLUniformLocation;

        let tempAllCorners = [];
        
        const result = octree?.findNodesByLevel(level) || [];
        
        for(let i = 0; i < result.length; i++) {
            const [x1, y1, z1] = [result[i].min.x, result[i].min.y, result[i].min.z]
            const [x2, y2, z2] = [result[i].max.x, result[i].max.y, result[i].max.z]


            const corners = new Float32Array([
                x1, y1, z1, x2, y1, z1,  // Linie von P1 zu P2
                x1, y1, z1, x1, y2, z1,  // Linie von P1 zu P3
                x1, y1, z1, x1, y1, z2,  // Linie von P1 zu P5
                x2, y1, z1, x2, y2, z1,  // Linie von P2 zu P4
                x2, y1, z1, x2, y1, z2,  // Linie von P2 zu P6
                x1, y2, z1, x2, y2, z1,  // Linie von P3 zu P4
                x1, y2, z1, x1, y2, z2,  // Linie von P3 zu P7
                x1, y1, z2, x2, y1, z2,  // Linie von P5 zu P6
                x1, y1, z2, x1, y2, z2,  // Linie von P5 zu P7
                x2, y2, z1, x2, y2, z2,  // Linie von P4 zu P8
                x2, y1, z2, x2, y2, z2,  // Linie von P6 zu P8
                x1, y2, z2, x2, y2, z2   // Linie von P7 zu P8
            ]);
            tempAllCorners.push(...corners);
        }

        let allCorners = new Float32Array(tempAllCorners);


        const colorLines = color;

        this._initialize = () => {
            vertexBuffer = gl.createBuffer() as WebGLBuffer;

            positionAttribute = gl.getAttribLocation(this.program, "position");
            gl.enableVertexAttribArray(positionAttribute);

            u_projection = gl.getUniformLocation(this.program, "projection") as WebGLUniformLocation;
            u_view = gl.getUniformLocation(this.program, "view") as WebGLUniformLocation;
            u_color = gl.getUniformLocation(this.program, "cubeColor") as WebGLUniformLocation;
        };

        const drawCubeLines = (vertices: Float32Array, color: Float32Array) => {
            gl.lineWidth(100);
            gl.uniform4fv(u_color, color);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 24 * result.length);
        };

        this._render = () => {
            if (!this._camera) {
                throw new Error("Camera not set");
            }

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.uniformMatrix4fv(u_projection, false, this._camera.data.projectionMatrix.buffer);
            gl.uniformMatrix4fv(u_view, false, this._camera.data.viewMatrix.buffer);

            drawCubeLines(allCorners, colorLines);
        };

        this._resize = () => {};

        this._dispose = () => {};
    }

    protected _getFragmentSource(): string {
        return axisFragmentShader;
    }

    protected _getVertexSource(): string {
        return axisVertexShader;
    }

}

export { OctreeHelper }

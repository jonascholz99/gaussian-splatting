import { ShaderProgram } from "../ShaderProgram";
import { WebGLRenderer } from "../../../WebGLRenderer";
import { ShaderPass } from "../../passes/ShaderPass";
import {NewRay} from "../../../../math/NewRay";

const axisVertexShader = /*glsl*/ `#version 300 es
uniform mat4 projection, view;

in vec3 position;

void main() {
    gl_Position = projection * view * vec4(position, 1.0);
}
`;

const axisFragmentShader = /*glsl*/ `#version 300 es
precision mediump float;
uniform vec4 axisColor;
out vec4 outColor;

void main() {
    outColor = axisColor;
}
`;

class RayProgram extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;

    constructor(renderer: WebGLRenderer, passes: ShaderPass[], ray: NewRay) {
        super(renderer, passes);

        const gl = renderer.gl;

        let vertexBuffer: WebGLBuffer;

        let positionAttribute: number;

        let u_projection: WebGLUniformLocation;
        let u_view: WebGLUniformLocation;
        let u_color: WebGLUniformLocation;


        const xVertices = new Float32Array([ray.origin.x, ray.origin.y, ray.origin.z, ray.origin.x + ray.direction.x*10, ray.origin.y + ray.direction.y*10, ray.origin.z + ray.direction.z*10]);

        const xColor = new Float32Array([1, 0, 0, 0.5]);

        this._initialize = () => {
            vertexBuffer = gl.createBuffer() as WebGLBuffer;

            positionAttribute = gl.getAttribLocation(this.program, "position");
            gl.enableVertexAttribArray(positionAttribute);

            u_projection = gl.getUniformLocation(this.program, "projection") as WebGLUniformLocation;
            u_view = gl.getUniformLocation(this.program, "view") as WebGLUniformLocation;
            u_color = gl.getUniformLocation(this.program, "axisColor") as WebGLUniformLocation;
        };

        const drawAxis = (vertices: Float32Array, color: Float32Array) => {
            gl.uniform4fv(u_color, color);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2);
        };

        this._resize = () => {};

        this._render = () => {
            if (!this._camera) {
                throw new Error("Camera not set");
            }

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.uniformMatrix4fv(u_projection, false, this._camera.data.projectionMatrix.buffer);
            gl.uniformMatrix4fv(u_view, false, this._camera.data.viewMatrix.buffer);

            drawAxis(xVertices, xColor);
        };

        this._dispose = () => {};
    }

    protected _getVertexSource() {
        return axisVertexShader;
    }

    protected _getFragmentSource() {
        return axisFragmentShader;
    }
}

export { RayProgram };

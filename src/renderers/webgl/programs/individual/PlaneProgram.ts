import { ShaderProgram } from "../ShaderProgram";
import { WebGLRenderer } from "../../../WebGLRenderer";
import { ShaderPass } from "../../passes/ShaderPass";
import { Plane } from "../../../../math/Plane";
import { Vector3 } from "../../../../math/Vector3";

const planeVertexShader = /*glsl*/ `#version 300 es
uniform mat4 projection, view;

in vec3 position;

void main() {
    gl_Position = projection * view * vec4(position, 1.0);
}
`;

const planeFragmentShader = /*glsl*/ `#version 300 es
precision mediump float;
uniform vec4 planeColor;
out vec4 outColor;

void main() {
    outColor = planeColor;
}
`;

class PlaneProgram extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;
    protected getPlaneVertices: (size: number) => Float32Array;

    private plane: Plane;

    constructor(renderer: WebGLRenderer, passes: ShaderPass[], plane: Plane) {
        super(renderer, passes);

        this.plane = plane;

        const gl = renderer.gl;

        let vertexBuffer: WebGLBuffer;

        let positionAttribute: number;

        let u_projection: WebGLUniformLocation;
        let u_view: WebGLUniformLocation;
        let u_color: WebGLUniformLocation;
        
        const planeColor = new Float32Array([0.5, 0.5, 0.5, 0.5]);

        const normal = this.plane.normal;
        const constant = this.plane.constant;

        // Create a point on the plane
        const point = normal.clone().multiply(constant);
        const xVertices = new Float32Array([point.x, point.y, point.z, point.x + normal.x*3, point.y + normal.y*3, point.z + normal.z*3]);
        const xColor = new Float32Array([1, 0, 0, 0.5]);
        

        this._initialize = () => {
            vertexBuffer = gl.createBuffer() as WebGLBuffer;

            positionAttribute = gl.getAttribLocation(this.program, "position");
            gl.enableVertexAttribArray(positionAttribute);

            u_projection = gl.getUniformLocation(this.program, "projection") as WebGLUniformLocation;
            u_view = gl.getUniformLocation(this.program, "view") as WebGLUniformLocation;
            u_color = gl.getUniformLocation(this.program, "planeColor") as WebGLUniformLocation;
        };

        const drawAxis = (vertices: Float32Array, color: Float32Array) => {
            gl.uniform4fv(u_color, color);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2);
        };

        const drawPlane = () => {
            const size = 5; // Size of the plane for rendering purposes
            const vertices = this.getPlaneVertices(size);

            gl.uniform4fv(u_color, planeColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        };

        this.getPlaneVertices = (size: number) => {
            const normal = this.plane.normal;
            const constant = this.plane.constant;

            // Create a point on the plane
            const point = normal.clone().multiply(constant);

            // Generate two vectors on the plane
            const right = new Vector3(1, 0, 0);
            if (Math.abs(normal.dot(right)) > 0.99) {
                right.set(0, 1, 0);
            }
            const up = right.cross(normal).normalize();
            right.crossVectors(normal, up).normalize();

            const halfSize = size / 2;
            const vertices = new Float32Array([
                ...point.clone().add(right.clone().multiply(-halfSize)).add(up.clone().multiply(-halfSize)).toArray(),
                ...point.clone().add(right.clone().multiply(halfSize)).add(up.clone().multiply(-halfSize)).toArray(),
                ...point.clone().add(right.clone().multiply(halfSize)).add(up.clone().multiply(halfSize)).toArray(),
                ...point.clone().add(right.clone().multiply(-halfSize)).add(up.clone().multiply(halfSize)).toArray(),
            ]);
            return vertices;
        };

        this._resize = () => {};

        this._render = () => {
            if (!this._camera) {
                throw new Error("Camera not set");
            }

            const gl = this.renderer.gl;

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.uniformMatrix4fv(u_projection, false, this._camera.data.projectionMatrix.buffer);
            gl.uniformMatrix4fv(u_view, false, this._camera.data.viewMatrix.buffer);

            drawPlane();
            drawAxis(xVertices, xColor)
        };

        this._dispose = () => {};
    }

    protected _getVertexSource() {
        return planeVertexShader;
    }

    protected _getFragmentSource() {
        return planeFragmentShader;
    }
}

export { PlaneProgram };

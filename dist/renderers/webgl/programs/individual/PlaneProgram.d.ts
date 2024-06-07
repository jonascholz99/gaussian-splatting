import { ShaderProgram } from "../ShaderProgram";
import { WebGLRenderer } from "../../../WebGLRenderer";
import { ShaderPass } from "../../passes/ShaderPass";
import { Plane } from "../../../../math/Plane";
declare class PlaneProgram extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;
    protected getPlaneVertices: (size: number) => Float32Array;
    private plane;
    constructor(renderer: WebGLRenderer, passes: ShaderPass[], plane: Plane);
    protected _getVertexSource(): string;
    protected _getFragmentSource(): string;
}
export { PlaneProgram };

import { ShaderProgram } from "../ShaderProgram";
import { WebGLRenderer } from "../../../WebGLRenderer";
import { ShaderPass } from "../../passes/ShaderPass";
declare class MultibleCubesProgram extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;
    constructor(renderer: WebGLRenderer, passes: ShaderPass[], upperLeftCorners: Float32Array[], bottomRightCorners: Float32Array[], color?: Float32Array);
    protected _getFragmentSource(): string;
    protected _getVertexSource(): string;
}
export { MultibleCubesProgram };

import { ShaderProgram } from "../ShaderProgram";
import { WebGLRenderer } from "../../../WebGLRenderer";
import { ShaderPass } from "../../passes/ShaderPass";
declare class GridProgram extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;
    constructor(renderer: WebGLRenderer, passes: ShaderPass[]);
    protected _getVertexSource(): string;
    protected _getFragmentSource(): string;
}
export { GridProgram };

import { ShaderProgram } from "../ShaderProgram";
import { WebGLRenderer } from "../../../WebGLRenderer";
import { ShaderPass } from "../../passes/ShaderPass";
import { NewRay } from "../../../../math/NewRay";
declare class RayProgram extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;
    constructor(renderer: WebGLRenderer, passes: ShaderPass[], ray: NewRay);
    protected _getVertexSource(): string;
    protected _getFragmentSource(): string;
}
export { RayProgram };

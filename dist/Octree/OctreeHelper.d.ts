import { ShaderProgram } from "../renderers/webgl/programs/ShaderProgram";
import { WebGLRenderer } from "../renderers/WebGLRenderer";
import { ShaderPass } from "../renderers/webgl/passes/ShaderPass";
import { Octree } from "./Octree";
declare class OctreeHelper extends ShaderProgram {
    protected _initialize: () => void;
    protected _resize: () => void;
    protected _render: () => void;
    protected _dispose: () => void;
    constructor(renderer: WebGLRenderer, passes: ShaderPass[], octree: Octree, level?: number, color?: Float32Array);
    protected _getFragmentSource(): string;
    protected _getVertexSource(): string;
}
export { OctreeHelper };

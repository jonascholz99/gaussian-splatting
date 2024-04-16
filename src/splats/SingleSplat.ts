import {Object3D} from "../core/Object3D";
import {SplatData} from "./SplatData";
import {Matrix4} from "../math/Matrix4";
import {Box3} from "../math/Box3";
import {Vector3} from "../math/Vector3";

class SingleSplat extends Object3D {
    private _data: SplatData;
    private _selected: boolean = false;
    private _colorTransforms: Array<Matrix4> = [];
    private _colorTransformsMap: Map<number, number> = new Map();
    private _bounds: Box3;

    constructor(splat: SplatData | undefined = undefined) {
        super();

        this._data = splat || new SplatData();
        this._bounds = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );
    }
}
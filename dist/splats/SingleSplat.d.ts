import { Box3 } from "../math/Box3";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Vector4 } from "../math/Vector4";
declare class SingleSplat {
    changed: boolean;
    private _position;
    private _rotation;
    private _scale;
    private _color;
    private _bounds;
    private _selected;
    private _rendered;
    private _colorTransforms;
    private _colorTransformsMap;
    recalculateBounds: () => void;
    translate: (translation: Vector3) => void;
    rotate: (rotation: Quaternion) => void;
    scale: (scale: Vector3) => void;
    constructor(position: Float32Array, rotation: Float32Array, scale: Float32Array, color: Uint8Array);
    reattach(position: Float32Array, rotation: Float32Array, scale: Float32Array, color: Uint8Array, selection: Uint8Array): void;
    Select(select: boolean): void;
    SelectAsync(select: boolean): Promise<void>;
    Render(render: boolean): void;
    ChangeColor(colorVector: Vector4): void;
    get bounds(): Box3;
    get PositionVec3(): Vector3;
    get Position(): Float32Array;
    get Scale(): Float32Array;
    get ScaleVec3(): Vector3;
    get Color(): Uint8Array;
    get Rotation(): Float32Array;
    get Selection(): Uint8Array;
    get Rendered(): Uint8Array;
}
export { SingleSplat };

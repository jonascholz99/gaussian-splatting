import {Object3D} from "../core/Object3D";
import { Matrix4 } from "../math/Matrix4";
import { Box3 } from "../math/Box3";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix3 } from "../math/Matrix3";
import {Vector4} from "../math/Vector4";
import {SplatData} from "./SplatData";

class SingleSplat {

    private _index: number;
    private _data: SplatData;

    private _bounds: Box3;

    private _defaultColor: Uint8Array;
    
    
    public changed = false;
    
    private _position: Float32Array;
    private _rotation: Float32Array;
    private _scale: Float32Array;
    private _color: Uint8Array;
    private _selected: Uint8Array;
    private _rendered: Uint8Array;
    
    private _colorTransforms: Array<Matrix4> = [];
    private _colorTransformsMap: Map<number, number> = new Map();

    recalculateBounds: () => void;
    translate: (translation: Vector3) => void;
    rotate: (rotation: Quaternion) => void;
    scale: (scale: Vector3) => void;
    
    constructor(position: Float32Array, rotation: Float32Array, scale: Float32Array, color: Uint8Array, index: number, data: SplatData) {
        this._index = index;
        this._data = data;

        this._bounds = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );
        this._defaultColor = new Uint8Array(data.colors.subarray(index * 4, index * 4 + 4));
        
        this._position = position;
        this._rotation = rotation;
        this._scale = scale;
        this._color = color;
        this._selected = new Uint8Array([0]);
        this._rendered = new Uint8Array([1]);

        this.recalculateBounds = () => {
            this._bounds.min = new Vector3(
                this._position[0] - this._scale[0],
                this._position[1] - this._scale[1],
                this._position[2] - this._scale[2]
            );
            this._bounds.max = new Vector3(
                this._position[0] + this._scale[0],
                this._position[1] + this._scale[1],
                this._position[2] + this._scale[2]
            );
        };


        this.translate = (translation: Vector3) => {
            const pos = this.Position;
            pos[0] += translation.x;
            pos[1] += translation.y;
            pos[2] += translation.z;
            // this._position[0] += translation.x;
            // this._position[1] += translation.y;
            // this._position[2] += translation.z;

            this.changed = true;
        };

        this.rotate = (rotation: Quaternion) => {
            const R = Matrix3.RotationFromQuaternion(rotation).buffer;
            const pos = this.Position;

            const x = pos[0];
            const y = pos[1];
            const z = pos[2];

            pos[0] = R[0] * x + R[1] * y + R[2] * z;
            pos[1] = R[3] * x + R[4] * y + R[5] * z;
            pos[2] = R[6] * x + R[7] * y + R[8] * z;

            const rot = this.Rotation;
            const currentRotation = new Quaternion(rot[1], rot[2], rot[3], rot[0]);

            const newRot = rotation.multiply(currentRotation);
            rot[0] = newRot.w;
            rot[1] = newRot.x;
            rot[2] = newRot.y;
            rot[3] = newRot.z;
            
            //
            // const R = Matrix3.RotationFromQuaternion(rotation).buffer;
            //
            // const x = this._position[0];
            // const y = this._position[1];
            // const z = this._position[2];
            //
            // this._position[0] = R[0] * x + R[1] * y + R[2] * z;
            // this._position[1] = R[3] * x + R[4] * y + R[5] * z;
            // this._position[2] = R[6] * x + R[7] * y + R[8] * z;
            //
            // const currentRotation = new Quaternion(
            //     this._rotation[1],
            //     this._rotation[2],
            //     this._rotation[3],
            //     this._rotation[0],
            // );
            //
            // const newRot = rotation.multiply(currentRotation);
            // this._rotation[1] = newRot.x;
            // this._rotation[2] = newRot.y;
            // this._rotation[3] = newRot.z;
            // this._rotation[0] = newRot.w;
            

            this.changed = true;
        };
        
        this.scale = (scale: Vector3) => {
            const pos = this.Position;
            const scl = this.Scale;

            pos[0] *= scale.x;
            pos[1] *= scale.y;
            pos[2] *= scale.z;

            scl[0] *= scale.x;
            scl[1] *= scale.y;
            scl[2] *= scale.z;
            //
            // this._position[0] *= scale.x;
            // this._position[1] *= scale.y;
            // this._position[2] *= scale.z;
            //
            // this._scale[0] *= scale.x;
            // this._scale[1] *= scale.y;
            // this._scale[2] *= scale.z;
            

            this.changed = true;
        };
        
        this.recalculateBounds();
    }

    reattach(position: Float32Array, rotation: Float32Array, scale: Float32Array, color: Uint8Array, selection: Uint8Array) {
        this._data.positions.set(position, this._index * 3);
        this._data.rotations.set(rotation, this._index * 4);
        this._data.scales.set(scale, this._index * 3);
        this._data.colors.set(color, this._index * 4);
        this._data.selection.set(selection, this._index);
        
        // this._position = position;
        // this._rotation = rotation;
        // this._scale = scale;
        // this._color = color;
        // this._selected = selection;
    }

    get Selected() {
        return this._data.selection[this._index];
    }

    set Selected(value: number) {
        this._data.selection[this._index] = value;
    }
    
    // Select(select: boolean) {
    //     this._selected[0] = select ? 1 : 0;        
    // }
    //
    // get Selection() {
    //     return this._selected;
    // }

    get Rendered() {
        return this._data.rendered[this._index];
    }

    set Rendered(value: number) {
        this._data.rendered[this._index] = value;
    }

    get Position() {
        const i = this._index * 3;
        return this._data.positions.subarray(i, i + 3);
    }

    get Rotation() {
        const i = this._index * 4;
        return this._data.rotations.subarray(i, i + 4);
    }

    get Scale() {
        const i = this._index * 3;
        return this._data.scales.subarray(i, i + 3);
    }
    
    set Color(colorVector: Uint8Array) {
        const colorIndex = this._index * 4;
        this._data.colors.set(colorVector, colorIndex);
    }
    get Color() {
        const i = this._index * 4;
        return this._data.colors.subarray(i, i + 4);
    }
    
    // Render(render: boolean) {
    //     this._rendered[0] = render ? 1 : 0;
    // }
    //
    // get Rendered() {
    //     return this._rendered;
    // }
    
    ResetColor() {
        const colorIndex = this._index * 4;
        this._data.colors.set(this._defaultColor, colorIndex);
    }
    
    get bounds() {
        return this._bounds;
    }
    
    get PositionVec3() {
        return new Vector3(this._position[0], this._position[1], this._position[2]);
    }
    
    // get Position() {
    //     return this._position;
    // }
    //
    // get Scale() {
    //    return this._scale; 
    // }
    
    get ScaleVec3() {
        return new Vector3(this._scale[0], this._scale[1], this._scale[2]);
    }
    
    // get Color() {
    //     return this._color;
    // }
    //
    // get Rotation() {
    //     return this._rotation;
    // }
}

export { SingleSplat };
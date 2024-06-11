import {Object3D} from "../core/Object3D";
import { Matrix4 } from "../math/Matrix4";
import { Box3 } from "../math/Box3";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix3 } from "../math/Matrix3";
import {Vector4} from "../math/Vector4";
import {SplatData} from "./SplatData";

class SingleSplat {

    private readonly _index: number;
    private _data: SplatData;

    private readonly _bounds: Box3;

    private readonly _defaultColor: Uint8Array;

    recalculateBounds: () => void;
    translate: (translation: Vector3) => void;
    rotate: (rotation: Quaternion) => void;
    scale: (scale: Vector3) => void;
    
    constructor(index: number, data: SplatData) { 
        this._index = index;
        this._data = data;

        this._bounds = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );
        this._defaultColor = new Uint8Array(data.colors.subarray(index * 4, index * 4 + 4));

        this.recalculateBounds = () => {
            const pos = this.Position;
            const scl = this.Scale;
            
            this._bounds.min = new Vector3(
                pos[0] - scl[0],
                pos[1] - scl[1],
                pos[2] - scl[2]
            );
            this._bounds.max = new Vector3(
                pos[0] + scl[0],
                pos[1] + scl[1],
                pos[2] + scl[2]
            );
        };


        this.translate = (translation: Vector3) => {
            const pos = this.Position;
            pos[0] += translation.x;
            pos[1] += translation.y;
            pos[2] += translation.z;
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
        };
        
        this.recalculateBounds();
    }

    reattach(position: Float32Array, rotation: Float32Array, scale: Float32Array, color: Uint8Array, selection: Uint8Array) {
        this._data.positions.set(position, this._index * 3);
        this._data.rotations.set(rotation, this._index * 4);
        this._data.scales.set(scale, this._index * 3);
        this._data.colors.set(color, this._index * 4);
        this._data.selection.set(selection, this._index);
    }

    get Selected() {
        return this._data.selection[this._index];
    }

    set Selected(value: number) {
        this._data.selection[this._index] = value;
    }

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
    
    ResetColor() {
        this._data.colors.set(this._defaultColor,  this._index * 4);
    }
    
    get bounds() {
        return this._bounds;
    }
    
    get PositionVec3() {
        const pos = this.Position;
        return new Vector3(pos[0], pos[1], pos[2]);
    }
    
    get index() {
        return this._index;
    }
    
    get ScaleVec3() {
        const scale = this.Scale;
        return new Vector3(scale[0], scale[1], scale[2]);
    }

    setTransparency(alpha: number) {
        this.Color[3] = Math.floor(alpha * this._defaultColor[3]);
    }


    setBlending(alpha: number) {
        this.Color[3] = Math.floor(alpha * this.Color[3]);;
    }
}

export { SingleSplat };
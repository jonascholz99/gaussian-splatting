import {Object3D} from "../core/Object3D";
import { Matrix4 } from "../math/Matrix4";
import { Box3 } from "../math/Box3";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix3 } from "../math/Matrix3";

class SingleSplat {

    public changed = false;
    
    private _position: Float32Array;
    private _rotation: Float32Array;
    private _scale: Float32Array;
    private _color: Uint8Array;
    private _bounds: Box3;
    private _selected: Uint8Array;
    private _rendered: Uint8Array;
    
    private _colorTransforms: Array<Matrix4> = [];
    private _colorTransformsMap: Map<number, number> = new Map();

    recalculateBounds: () => void;
    translate: (translation: Vector3) => void;
    rotate: (rotation: Quaternion) => void;
    scale: (scale: Vector3) => void;
    
    constructor(position: Float32Array, rotation: Float32Array, scale: Float32Array, color: Uint8Array) {
        this._position = position;
        this._rotation = rotation;
        this._scale = scale;
        this._color = color;
        this._selected = new Uint8Array([0]);
        this._rendered = new Uint8Array([1]);
        
        this._bounds = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );

        this.recalculateBounds = () => {
            let minVec = new Vector3(
                this._position[0] - this._scale[0],
                this._position[1] - this._scale[1],
                this._position[2] - this._scale[2]
            );
            let maxVec = new Vector3(
                this._position[0] + this._scale[0],
                this._position[1] + this._scale[1],
                this._position[2] + this._scale[2]
            );

            this._bounds.min = minVec;
            this._bounds.max = maxVec;
        };


        this.translate = (translation: Vector3) => {
            
            this._position[0] += translation.x;
            this._position[1] += translation.y;
            this._position[2] += translation.z;

            this.changed = true;
        };

        this.rotate = (rotation: Quaternion) => {
            const R = Matrix3.RotationFromQuaternion(rotation).buffer;
            
            const x = this._position[0];
            const y = this._position[1];
            const z = this._position[2];

            this._position[0] = R[0] * x + R[1] * y + R[2] * z;
            this._position[1] = R[3] * x + R[4] * y + R[5] * z;
            this._position[2] = R[6] * x + R[7] * y + R[8] * z;

            const currentRotation = new Quaternion(
                this._rotation[1],
                this._rotation[2],
                this._rotation[3],
                this._rotation[0],
            );

            const newRot = rotation.multiply(currentRotation);
            this._rotation[1] = newRot.x;
            this._rotation[2] = newRot.y;
            this._rotation[3] = newRot.z;
            this._rotation[0] = newRot.w;
            

            this.changed = true;
        };
        
        this.scale = (scale: Vector3) => {
            this._position[0] *= scale.x;
            this._position[1] *= scale.y;
            this._position[2] *= scale.z;

            this._scale[0] *= scale.x;
            this._scale[1] *= scale.y;
            this._scale[2] *= scale.z;
            

            this.changed = true;
        };
        
        this.recalculateBounds();
    }

    reattach(position: Float32Array, rotation: Float32Array, scale: Float32Array, color: Uint8Array, selection: Uint8Array) {
        this._position = position;
        this._rotation = rotation;
        this._scale = scale;
        this._color = color;
        this._selected = selection;
    }
    
    Select(select: boolean) {
        if(select)
        {
            this._selected[0] = 1;
        } else {
            this._selected[0] = 0;
        }         
    }

    SelectAsync(select: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (select) {
                    this._selected[0] = 1;
                } else {
                    this._selected[0] = 0;
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    Render(render: boolean) {
        if(render) {
            this._rendered[0] = 1;
        } else {
            this._rendered[0] = 0;
        }
    }
    
    get bounds() {
        return this._bounds;
    }
    
    get PositionVec3() {
        return new Vector3(this._position[0], this._position[1], this._position[2]);
    }
    
    get Position() {
        return this._position;
    }
    
    get Scale() {
       return this._scale; 
    }
    
    get ScaleVec3() {
        return new Vector3(this._scale[0], this._scale[1], this._scale[2]);
    }
    
    get Color() {
        return this._color;
    }
    
    get Rotation() {
        return this._rotation;
    }
    
    get Selection() {
        return this._selected;
    }
    
    get Rendered() {
        return this._rendered;
    }
}

export { SingleSplat };
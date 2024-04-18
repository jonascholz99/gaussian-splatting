import { SplatData } from "./SplatData";
import { Object3D } from "../core/Object3D";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Converter } from "../utils/Converter";
import { Matrix4 } from "../math/Matrix4";
import { Box3 } from "../math/Box3";
import { SingleSplat } from "./SingleSplat"

import { Constants } from "../utils/Constants";

class Splat extends Object3D {
    public selectedChanged: boolean = false;
    public colorTransformChanged: boolean = false;

    private _splats: Array<SingleSplat> = [];
    private _data: SplatData;
    private _selected: boolean = false;
    private _colorTransforms: Array<Matrix4> = [];
    private _colorTransformsMap: Map<number, number> = new Map();
    private _bounds: Box3;

    recalculateBounds: () => void;
    createSplatsData: () => void;

    constructor(splat: SplatData | undefined = undefined) {
        super();
        
        this._splats = new Array<SingleSplat>();
        this._data = splat || new SplatData();
        this._bounds = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );
        
        this.createSplatsData = () => {
            console.log("About to create " + (this._data.vertexCount) + " splats!");
            
            for(let i = 0; i < this._data.vertexCount; i++) {
                let position: Float32Array = new Float32Array(this._data.positions.buffer, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                let rotation: Float32Array = new Float32Array(this._data.rotations.buffer, 4 * i * Constants.BYTE_OFFSET_FLOAT, 4);
                let scale: Float32Array = new Float32Array(this._data.scales.buffer, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                
                let singleSplat = new SingleSplat(position, rotation, scale);
                this._splats.push(singleSplat)
            }
            
            console.log("Finish")
            
        }

        this.recalculateBounds = () => {
            for (let i = 0; i < this._splats.length; i++) {
                this._bounds.expand(this._splats[i].PositionVec3);
            }
        }

        this.applyPosition = () => {
            this._splats.forEach((splat, index) => {
                splat.translate(this.position);
            });
            this.position = new Vector3();
        };

        this.applyRotation = () => {
            this._splats.forEach((splat, index) => {
                splat.rotate(this.rotation);
            });
            this.rotation = new Quaternion();
        };

        this.applyScale = () => {
            this._splats.forEach((splat, index) => {
                splat.scale(this.scale);
            });
            this.scale = new Vector3(1, 1, 1);
        };
        
        this.createSplatsData();
    }

    saveToFile(name: string | null = null, format: string | null = null) {
        if (!document) return;

        if (!format) {
            format = "splat";
        } else if (format !== "splat" && format !== "ply") {
            throw new Error("Invalid format. Must be 'splat' or 'ply'");
        }

        if (!name) {
            const now = new Date();
            name = `splat-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.${format}`;
        }

        this.applyRotation();
        this.applyScale();
        this.applyPosition();

        const data = this.data.serialize();
        let blob;
        if (format === "ply") {
            const plyData = Converter.SplatToPLY(data.buffer, this.data.vertexCount);
            blob = new Blob([plyData], { type: "application/octet-stream" });
        } else {
            blob = new Blob([data.buffer], { type: "application/octet-stream" });
        }

        const link = document.createElement("a");
        link.download = name;
        link.href = URL.createObjectURL(blob);
        link.click();
    }

    get data() {
        return this._data;
    }
    
    get splats() {
        return this._splats;
    }
    
    public getSplatAtIndex(index: number): SingleSplat | undefined {
        if (index < 0 || index >= this._splats.length) {
            console.error("Index out of bounds");
            return undefined; 
        }
        return this._splats[index];
    }

    get selected() {
        return this._selected;
    }

    set selected(selected: boolean) {
        if (this._selected !== selected) {
            this._selected = selected;
            this.selectedChanged = true;
            this.dispatchEvent(this._changeEvent);
        }
    }

    get colorTransforms() {
        return this._colorTransforms;
    }

    get colorTransformsMap() {
        return this._colorTransformsMap;
    }

    get bounds() {
        let center = this._bounds.center();
        center = center.add(this.position);

        let size = this._bounds.size();
        size = size.multiply(this.scale);

        return new Box3(center.subtract(size.divide(2)), center.add(size.divide(2)));
    }
}

export { Splat };

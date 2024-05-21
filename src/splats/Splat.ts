import { SplatData } from "./SplatData";
import { Object3D } from "../core/Object3D";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Converter } from "../utils/Converter";
import { Matrix4 } from "../math/Matrix4";
import { Box3 } from "../math/Box3";
import { SingleSplat } from "./SingleSplat"

import { Constants } from "../utils/Constants";
import {ObjectChangedEvent, RenderedSplatsChangedEvent} from "../events/Events";

class Splat extends Object3D {
    public selectedChanged: boolean = false;
    public renderNumberChanged: boolean = false;
    public colorTransformChanged: boolean = false;

    private _splats: Array<SingleSplat> = [];
    private _data: SplatData;
    private _selected: boolean = false;
    private _colorTransforms: Array<Matrix4> = [];
    private _colorTransformsMap: Map<number, number> = new Map();
    private _bounds: Box3;
    
    private _numberOfSplats: number;
    private _numberOfRenderedSplats: number;

    recalculateBounds: () => void;
    createSplatsData: () => void;
    applySelection: () => void;

    constructor(splat: SplatData | undefined = undefined) {
        super();
        
        this._splats = new Array<SingleSplat>();
        this._data = splat || new SplatData();
        this._bounds = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );

        this._numberOfSplats = 0;
        this._numberOfRenderedSplats = 0
        
        this.createSplatsData = () => {
            
            if(splat != undefined)
            {
                this._numberOfSplats = splat.vertexCount;
                this._numberOfRenderedSplats = splat.vertexCount;
                
                for(let i = 0; i < splat.vertexCount; i++) {
                    let position: Float32Array = new Float32Array(splat.positions.buffer, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                    let rotation: Float32Array = new Float32Array(splat.rotations.buffer, 4 * i * Constants.BYTE_OFFSET_FLOAT, 4);
                    let scale: Float32Array = new Float32Array(splat.scales.buffer, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                    let color: Uint8Array = new Uint8Array(splat.colors.buffer, 1 * i * Constants.BYTE_OFFSET_INT, 4);
                    
                    let singleSplat = new SingleSplat(position, rotation, scale, color, i, this._data);
                    this._splats.push(singleSplat)
                }
            }
            
        }

        this.recalculateBounds = () => {
            for (let i = 0; i < this._numberOfSplats; i++) {
                this._bounds.expand(this._splats[i].PositionVec3);
            }
        }

        this.applyPosition = () => {
            this._splats.forEach((splat, index) => {
                splat.translate(this.position);
            });
            this.position = new Vector3();
            
            this.data.changed = true;
        };

        this.applyRotation = () => {
            this._splats.forEach((splat, index) => {
                splat.rotate(this.rotation);
            });
            this.rotation = new Quaternion();

            this.data.changed = true;
        };

        this.applyScale = () => {
            this._splats.forEach((splat, index) => {
                splat.scale(this.scale);
            });
            this.scale = new Vector3(1, 1, 1);
        };
        
        this.applySelection = () => {
            this.selectedChanged = true;
            this.dispatchEvent(this._changeEvent);
            
            this.data.changed = true;
        }
        
        this.createSplatsData();

        this.data.changed = true;
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

        const data = this.serialize();
        let blob;
        if (format === "ply") {
            const plyData = Converter.SplatToPLY(data.buffer, this._numberOfSplats);
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
    
    getSplatAtIndex(index: number): SingleSplat | undefined {
        if (index < 0 || index >= this._numberOfSplats) {
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
    
    selectSplat(index: number, value: number) {
        this._splats[index].Selected = value;
        
        this.selectedChanged = true;
        this.dispatchEvent(this._changeEvent);
    }
    
    
    
    updateRenderingOfSplats() {
        this.dispatchEvent(this._renderedSplatsChanged);
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
    
    get splatCount() {
        return this._numberOfSplats;
    }
    
    get numberOfRenderedSplats() {
        return this._numberOfRenderedSplats;
    }

    serialize = () => {
        const data = new Uint8Array(this._numberOfSplats * SplatData.RowLength);

        const f_buffer = new Float32Array(data.buffer);
        const u_buffer = new Uint8Array(data.buffer);
        
        for (let i = 0; i < this._numberOfSplats; i++) {
            f_buffer[8 * i + 0] = this._splats[i].Position[0];
            f_buffer[8 * i + 1] = this._splats[i].Position[1];
            f_buffer[8 * i + 2] = this._splats[i].Position[2];

            u_buffer[32 * i + 24 + 0] = this._splats[i].Color[0];
            u_buffer[32 * i + 24 + 1] = this._splats[i].Color[1];
            u_buffer[32 * i + 24 + 2] = this._splats[i].Color[2];
            u_buffer[32 * i + 24 + 3] = this._splats[i].Color[3];

            f_buffer[8 * i + 3 + 0] = this._splats[i].Scale[0];
            f_buffer[8 * i + 3 + 1] = this._splats[i].Scale[1];
            f_buffer[8 * i + 3 + 2] = this._splats[i].Scale[2];

            u_buffer[32 * i + 28 + 0] = (this._splats[i].Rotation[0] * 128 + 128) & 0xff;
            u_buffer[32 * i + 28 + 1] = (this._splats[i].Rotation[1] * 128 + 128) & 0xff;
            u_buffer[32 * i + 28 + 2] = (this._splats[i].Rotation[2] * 128 + 128) & 0xff;
            u_buffer[32 * i + 28 + 3] = (this._splats[i].Rotation[3] * 128 + 128) & 0xff;
        }

        return data;
    };

    reattach = (
        positions: ArrayBufferLike,
        rotations: ArrayBufferLike,
        scales: ArrayBufferLike,
        colors: ArrayBufferLike,
        selection: ArrayBufferLike,
    ) => {
        console.assert(
            positions.byteLength === this._numberOfRenderedSplats * 3 * 4,
            `Expected ${this._numberOfRenderedSplats * 3 * 4} bytes, got ${positions.byteLength} bytes`,
        );

        for(let i = 0; i < this._numberOfSplats; i++) {
            if(this._splats[i].Rendered === 1){
                let position: Float32Array = new Float32Array(positions, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                let rotation: Float32Array = new Float32Array(rotations, 4 * i * Constants.BYTE_OFFSET_FLOAT, 4);
                let scale: Float32Array = new Float32Array(scales, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                let color: Uint8Array = new Uint8Array(colors, 1 * i * Constants.BYTE_OFFSET_INT, 4);
                let selected: Uint8Array = new Uint8Array(selection, i, 1);

                this._splats[i].reattach(position, rotation, scale, color, selected);       
            }
        }
        
        this._data.detached = false;
    };

    get Positions(): Float32Array {
        // return this._data.positions;
        let tempPositions: number[] = [];

        this._splats.forEach((singleSplat) => {
            if (singleSplat.Rendered === 1) {
                tempPositions.push(...singleSplat.Position);
            }
        });

        return new Float32Array(tempPositions);
    }



    get Scales(): Float32Array {
        // return this._data.scales;
        let tempScales: number[] = [];

        this._splats.forEach((singleSplat) => {
            if (singleSplat.Rendered === 1) {
                tempScales.push(...singleSplat.Scale);
            }
        });

        return new Float32Array(tempScales);
    }

    get Rotations(): Float32Array {
        // return this._data.rotations;
        let tempRotations: number[] = [];

        this._splats.forEach((singleSplat) => {
            if (singleSplat.Rendered === 1) {
                tempRotations.push(...singleSplat.Rotation);
            }
        });

        return new Float32Array(tempRotations);
    }

    get Colors(): Uint8Array {
        // return this._data.colors;
        let tempColors: number[] = [];

        this._splats.forEach((singleSplat) => {
            if (singleSplat.Rendered === 1) {
                tempColors.push(...singleSplat.Color);
            }
        });

        return new Uint8Array(tempColors);
    }

    get Selections(): Uint8Array {
        const tempSelections: number[] = [];

        this._splats.forEach((singleSplat) => {
            if (singleSplat.Rendered === 1) {
                tempSelections.push(singleSplat.Selected);
            }
        });

        return new Uint8Array(tempSelections);
    }


}

export { Splat };

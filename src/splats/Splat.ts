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
                console.log("About to create " + (splat.vertexCount) + " splats!");
                console.log("Byte length Color: " + splat.colors.buffer.byteLength)
                console.log("Byte length Position: " + splat.positions.buffer.byteLength)
                for(let i = 0; i < splat.vertexCount; i++) {
                    let position: Float32Array = new Float32Array(splat.positions.buffer, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                    let rotation: Float32Array = new Float32Array(splat.rotations.buffer, 4 * i * Constants.BYTE_OFFSET_FLOAT, 4);
                    let scale: Float32Array = new Float32Array(splat.scales.buffer, 3 * i * Constants.BYTE_OFFSET_FLOAT, 3);
                    let color: Uint8Array = new Uint8Array(splat.colors.buffer, 1 * i * Constants.BYTE_OFFSET_INT, 4);
                    
                    let singleSplat = new SingleSplat(position, rotation, scale, color);
                    this._splats.push(singleSplat)
                }

                console.log("Finish")
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
    
    selectSplat(index: number, value: boolean) {
        this._splats[index].Select(value);
        this.selectedChanged = value;
        this.dispatchEvent(this._changeEvent);
    }
    
    renderSplat(index: number, value: boolean)
    {
        if (value && this._splats[index].Rendered[0] === 0) {
            this._numberOfRenderedSplats += 1;
        } else if (!value && this._splats[index].Rendered[0] === 1) {
            this._numberOfRenderedSplats -= 1;
        }
        
        this._splats[index].Render(value);
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
            if(this._splats[i].Rendered[0] === 1){
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
    
    get Positions() {
        let positions = new Float32Array(this._numberOfRenderedSplats * 3);
        let count = 0;
        
        this._splats.forEach((singleSplat, index) => {
            if(singleSplat.Rendered[0] === 1)
            {
                positions.set(singleSplat.Position, index * 3);
                count++;
            }
        });

        let finalPosition = new Float32Array(count * 3);
        finalPosition.set(positions.subarray(0, count * 3));
        
        return finalPosition;
    }
    
    get Scales() {
        let scales = new Float32Array(this._numberOfRenderedSplats * 3);
        let count = 0;

        this._splats.forEach((singleSplat, index) => {
            if(singleSplat.Rendered[0] === 1)
            {
                scales.set(singleSplat.Scale, index * 3);
                count++;
            }
        });

        let finalScales = new Float32Array(count * 3);
        finalScales.set(scales.subarray(0, count * 3));
        
        return finalScales;
    }
    
    get Rotations() {
        let rotations = new Float32Array(this._numberOfRenderedSplats * 4);
        let count = 0;

        this._splats.forEach((singleSplat, index) => {
            if(singleSplat.Rendered[0] === 1)
            {
                rotations.set(singleSplat.Rotation, index * 4);
                count++;
            }
        });

        let finalRotations = new Float32Array(count * 4);
        finalRotations.set(rotations.subarray(0, count * 4));

        return finalRotations;
    }
    
    get Colors() {
        let colors = new Uint8Array(this._numberOfRenderedSplats * 4);
        let count = 0;

        this._splats.forEach((singleSplat, index) => {
            if(singleSplat.Rendered[0] === 1) {
                colors.set(singleSplat.Color, index * 4);
                count++;
            }
        });

        let finalColors = new Float32Array(count * 4);
        finalColors.set(colors.subarray(0, count * 4));

        return finalColors;
    }
    
    
    
    get Selections() {
        let selections = new Uint8Array(this._numberOfRenderedSplats);
        let count = 0;
        
        let counter = 0;
        this._splats.forEach((singleSplat, index) => {
            if(singleSplat.Rendered[0] === 1)
            {
                selections.set(singleSplat.Selection, index);
                if(singleSplat.Selection[0]==1) {
                    counter++;
                }   
                count++;
            }
        });
        
        console.log("Found " + counter + " selected splats");

        let finalSelections = new Float32Array(count);
        finalSelections.set(selections.subarray(0, count));
        
        return finalSelections;
    }
}

export { Splat };

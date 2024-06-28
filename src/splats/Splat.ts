import { SplatData } from "./SplatData";
import { Object3D } from "../core/Object3D";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Converter } from "../utils/Converter";
import { Matrix4 } from "../math/Matrix4";
import { Box3 } from "../math/Box3";
import { SingleSplat } from "./SingleSplat"

import { Constants } from "../utils/Constants";
import {PointOctree} from "../Octree/points/PointOctree";

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

    private _octree: PointOctree<SingleSplat> | undefined;
    
    applySelection: () => void;
    applyRendering: () => void;
    
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
        

        this.applyPosition = () => {
            this.data.translate(this.position);
            this.position = new Vector3();
        };

        this.applyRotation = () => {
            this.data.rotate(this.rotation)
            this.rotation = new Quaternion();
            
        };

        this.applyScale = () => {
            this.data.scale(this.scale);
            this.scale = new Vector3(1, 1, 1);
        };
        
        this.applySelection = () => {
            this.selectedChanged = true;
            this.dispatchEvent(this._changeEvent);
            
            this.data.changed = true;
        }
        
        this.applyRendering = () => {
            this.data.calculateRenderedSplats();
            
            this.renderNumberChanged = true;
            
            this.dispatchEvent(this._changeEvent);
            this.data.changed = true;
        }


        (async () => {
            await this.createSplatsData(splat);
            await this.recalculateBounds();
            await this.createOctree();
            this.data.changed = true;
        })();
    }

    async createSplatsData(splat: SplatData | undefined) {
        if (splat != undefined) {
            this._numberOfSplats = splat.vertexCount;
            this._numberOfRenderedSplats = splat.vertexCount;

            console.time("Splats creation");
            for (let i = 0; i < splat.vertexCount; i++) {
                let singleSplat = new SingleSplat(i, this._data);
                this._splats.push(singleSplat);

                if (i % 1000 === 0) { // Nach jedem 1000. Eintrag den Main-Thread freigeben
                    await Promise.resolve();
                }
            }
            console.timeEnd("Splats creation");
        }
    }


    async recalculateBounds() {
        console.time("Bounds calculation");
        for (let i = 0; i < this._numberOfSplats; i++) {
            const pos = this._splats[i].Position;
            this._bounds.expand(new Vector3(pos[0], pos[1], pos[2]));

            if (i % 1000 === 0) { // Nach jedem 1000. Eintrag den Main-Thread freigeben
                await Promise.resolve();
            }
        }
        console.timeEnd("Bounds calculation");
    }


    async createOctree() {
        this._octree = new PointOctree<SingleSplat>(this._bounds.min, this._bounds.max, 0.0, 8, 8);
        console.time("Octree creation");
        const positionVector = new Vector3();
        for (let i = 0; i < this._numberOfSplats; i++) {
            const pos = this._splats[i].Position;
            positionVector.set(pos[0], pos[1], pos[2]);
            this._octree.set(positionVector, this._splats[i]);

            if (i % 1000 === 0) { // Nach jedem 1000. Eintrag den Main-Thread freigeben
                await Promise.resolve();
            }
        }
        console.timeEnd("Octree creation");
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
    }
    
    renderSplat(index: number, value: number) {
        this._data.rendered[index] = value;
    }
    
    updateRenderingOfSplats() {
        this.data.changed = true;
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
        return this._data.renderedSplats;
    }

    serialize = () => {
        console.log("serialize splat")
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
        return this._data.renderedPositions;
    }

    get Scales(): Float32Array {
        return this._data.renderedScales;
    }

    get Rotations(): Float32Array {
        return this._data.renderedRotations;
    }

    get Colors(): Uint8Array {
        return this._data.renderedColors;
    }

    get Selections(): Uint8Array {
        return this._data.renderedSelection;
    }

    get Rendered(): Uint8Array {
        return this.data.rendered;
    }
    
    get octree() {
        return this._octree;
    }
}

export { Splat };

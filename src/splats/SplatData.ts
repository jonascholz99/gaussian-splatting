import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix3 } from "../math/Matrix3";
import {PointOctree} from "../Octree/points/PointOctree";

class SplatData {
    static RowLength = 3 * 4 + 3 * 4 + 4 + 4;

    public changed = false;
    public detached = false;
    
    private _vertexCount: number;
    private _renderedSplats: number;
    private _positions: Float32Array;
    private _rotations: Float32Array;
    private _scales: Float32Array;
    private _colors: Uint8Array;
    private _selection: Uint8Array;
    private _rendered: Uint8Array;

    translate: (translation: Vector3) => void;
    private removeItemsFromArray: (arr: Float32Array | Uint8Array, start: number, count: number) => Float32Array | Uint8Array;
    removeVertex:(index: number) => void;
    removeVertexRange:(index: number, count: number) => void;
    serialize: () => Uint8Array;
    reattach: (
        positions: ArrayBufferLike,
        rotations: ArrayBufferLike,
        scales: ArrayBufferLike,
        colors: ArrayBufferLike,
        selection: ArrayBufferLike,
        rendered: ArrayBufferLike,
    ) => void;
    
    resetRendering: () => void;
    countRenderedSplats: () => void;
    
    constructor(
        vertexCount: number = 0,
        positions: Float32Array | null = null,
        rotations: Float32Array | null = null,
        scales: Float32Array | null = null,
        colors: Uint8Array | null = null,
        rendered: Uint8Array | null = null
    ) {
        this._vertexCount = vertexCount;
        this._positions = positions || new Float32Array(0);
        this._rotations = rotations || new Float32Array(0);
        this._scales = scales || new Float32Array(0);
        this._colors = colors || new Uint8Array(0);
        this._selection = new Uint8Array(this.vertexCount);
        this._rendered = new Uint8Array(this.vertexCount).fill(1);
        this._renderedSplats = vertexCount;
        
        this.resetRendering = () => {
            this._rendered = new Uint8Array(this.vertexCount).fill(0);
            // this.countRenderedSplats();
            // this.changed = true;
        }

        this.translate = (translation: Vector3) => {
            for (let i = 0; i < this.vertexCount; i++) {
                this.positions[3 * i + 0] += translation.x;
                this.positions[3 * i + 1] += translation.y;
                this.positions[3 * i + 2] += translation.z;
            }

            this.changed = true;
        };
        
        this.removeVertex = (index: number) => {
            if(index < 0 || index >= this._vertexCount) {
                throw new Error("Index out od bounds");
            }

            // remove from positions
            this._positions = <Float32Array>this.removeItemsFromArray(this._positions, index * 3, 3);
            // remove from rotations
            this._rotations = <Float32Array>this.removeItemsFromArray(this._rotations, index * 4, 4);
            // remove from scales
            this._scales = <Float32Array>this.removeItemsFromArray(this._scales, index * 3, 3);
            // remove from colors
            this._colors = <Uint8Array>this.removeItemsFromArray(this._colors, index * 4, 4);

            this._vertexCount--;  // reduce vertexCount
            this.changed = true; 
        }
        
        this.removeVertexRange = (index: number, count: number) => {
            if (index < 0 || index + count > this._vertexCount) {
                throw new Error("Index range out of bounds");
            }

            // remove from positions
            this._positions = <Float32Array>this.removeItemsFromArray(this._positions, index * 3, count * 3);
            // remove from rotations
            this._rotations = <Float32Array>this.removeItemsFromArray(this._rotations, index * 4, count * 4);
            // remove from scales
            this._scales = <Float32Array>this.removeItemsFromArray(this._scales, index * 3, count * 3);
            // remove from colors
            this._colors = <Uint8Array>this.removeItemsFromArray(this._colors, index * 4, count * 4);

            this._vertexCount -= count;  // reduce vertexCount
            this.changed = true;
        }
        
        this.removeItemsFromArray = (arr: Float32Array | Uint8Array, start: number, count: number) => {
            let part1 = arr.subarray(0, start);
            let part2 = arr.subarray(start + count, arr.length);
            let newArr = new (arr.constructor as any)(part1.length + part2.length);
            newArr.set(part1, 0);
            newArr.set(part2, part1.length);
            return newArr;
        }
        
        this.serialize = () => {
            const data = new Uint8Array(this.vertexCount * SplatData.RowLength);

            const f_buffer = new Float32Array(data.buffer);
            const u_buffer = new Uint8Array(data.buffer);

            for (let i = 0; i < this.vertexCount; i++) {
                f_buffer[8 * i + 0] = this.positions[3 * i + 0];
                f_buffer[8 * i + 1] = this.positions[3 * i + 1];
                f_buffer[8 * i + 2] = this.positions[3 * i + 2];

                u_buffer[32 * i + 24 + 0] = this.colors[4 * i + 0];
                u_buffer[32 * i + 24 + 1] = this.colors[4 * i + 1];
                u_buffer[32 * i + 24 + 2] = this.colors[4 * i + 2];
                u_buffer[32 * i + 24 + 3] = this.colors[4 * i + 3];

                f_buffer[8 * i + 3 + 0] = this.scales[3 * i + 0];
                f_buffer[8 * i + 3 + 1] = this.scales[3 * i + 1];
                f_buffer[8 * i + 3 + 2] = this.scales[3 * i + 2];

                u_buffer[32 * i + 28 + 0] = (this.rotations[4 * i + 0] * 128 + 128) & 0xff;
                u_buffer[32 * i + 28 + 1] = (this.rotations[4 * i + 1] * 128 + 128) & 0xff;
                u_buffer[32 * i + 28 + 2] = (this.rotations[4 * i + 2] * 128 + 128) & 0xff;
                u_buffer[32 * i + 28 + 3] = (this.rotations[4 * i + 3] * 128 + 128) & 0xff;
            }

            return data;
        };

        this.reattach = (
            positions: ArrayBufferLike,
            rotations: ArrayBufferLike,
            scales: ArrayBufferLike,
            colors: ArrayBufferLike,
            selection: ArrayBufferLike,
            rendered: ArrayBufferLike,
        ) => {
            const renderedFrame = new Uint8Array(rendered);
            let receivedSplats = 0;
            for (let i = 0; i < renderedFrame.length; i++) {
                if (renderedFrame[i] !== 0) {
                    receivedSplats++;
                }
            }
            
            console.assert(
                positions.byteLength === receivedSplats * 3 * 4,
                `Expected ${receivedSplats * 3 * 4} bytes, got ${positions.byteLength} bytes which are ${positions.byteLength / 3 / 4} splats`,
            );
            
            const newPositions = new Float32Array(positions);
            const newRotations = new Float32Array(rotations);
            const newScales = new Float32Array(scales);
            const newColors = new Uint8Array(colors);
            const newSelection = new Uint8Array(selection);

            let newIndex = 0;
            for (let i = 0; i < renderedFrame.length; i++) {
                if (renderedFrame[i] === 1) {
                    // Calculate the starting index
                    const posIndex = i * 3;
                    const rotIndex = i * 4;
                    const scaleIndex = i * 3;
                    const colorIndex = i * 4;

                    // Update positions (3 values per position)
                    this._positions.set(newPositions.subarray(newIndex * 3, newIndex * 3 + 3), posIndex);

                    // Update rotations (4 values per rotation)
                    this._rotations.set(newRotations.subarray(newIndex * 4, newIndex * 4 + 4), rotIndex);

                    // Update scales (3 values per scale)
                    this._scales.set(newScales.subarray(newIndex * 3, newIndex * 3 + 3), scaleIndex);

                    // Update colors (4 values per color, assuming RGBA)
                    this._colors.set(newColors.subarray(newIndex * 4, newIndex * 4 + 4), colorIndex);

                    // Update selection
                    this._selection[i] = newSelection[newIndex];

                    newIndex++;
                }
            }

            // this._rendered = new Uint8Array(rendered);
            // this._positions = new Float32Array(positions);
            // this._rotations = new Float32Array(rotations);
            // this._scales = new Float32Array(scales);
            // this._colors = new Uint8Array(colors);
            // this._selection = new Uint8Array(selection);
            this.detached = false;
        };

        this.countRenderedSplats = () => {
            let count = 0;
            for (let i = 0; i < this._rendered.length; i++) {
                if (this._rendered[i] !== 0) {
                    count++;
                }
            }
            this._renderedSplats = count;
        };
    }
    

    static Deserialize(data: Uint8Array): SplatData {
        const vertexCount = data.length / SplatData.RowLength;
        const positions = new Float32Array(3 * vertexCount);
        const rotations = new Float32Array(4 * vertexCount);
        const scales = new Float32Array(3 * vertexCount);
        const colors = new Uint8Array(4 * vertexCount);

        const f_buffer = new Float32Array(data.buffer);
        const u_buffer = new Uint8Array(data.buffer);

        for (let i = 0; i < vertexCount; i++) {
            positions[3 * i + 0] = f_buffer[8 * i + 0];
            positions[3 * i + 1] = f_buffer[8 * i + 1];
            positions[3 * i + 2] = f_buffer[8 * i + 2];

            rotations[4 * i + 0] = (u_buffer[32 * i + 28 + 0] - 128) / 128;
            rotations[4 * i + 1] = (u_buffer[32 * i + 28 + 1] - 128) / 128;
            rotations[4 * i + 2] = (u_buffer[32 * i + 28 + 2] - 128) / 128;
            rotations[4 * i + 3] = (u_buffer[32 * i + 28 + 3] - 128) / 128;

            scales[3 * i + 0] = f_buffer[8 * i + 3 + 0];
            scales[3 * i + 1] = f_buffer[8 * i + 3 + 1];
            scales[3 * i + 2] = f_buffer[8 * i + 3 + 2];

            colors[4 * i + 0] = u_buffer[32 * i + 24 + 0];
            colors[4 * i + 1] = u_buffer[32 * i + 24 + 1];
            colors[4 * i + 2] = u_buffer[32 * i + 24 + 2];
            colors[4 * i + 3] = u_buffer[32 * i + 24 + 3];
        }
        
        return new SplatData(vertexCount, positions, rotations, scales, colors);
    }

    get vertexCount() {
        return this._vertexCount;
    }
    
    get renderedSplats() {
        return this._renderedSplats;
    }

    get positions() {
        return this._positions;
    }

    get rotations() {
        return this._rotations;
    }

    get scales() {
        return this._scales;
    }

    get colors() {
        return this._colors;
    }

    get selection() {
        return this._selection;
    }

    get rendered() {
        return this._rendered;
    }
}

export { SplatData };

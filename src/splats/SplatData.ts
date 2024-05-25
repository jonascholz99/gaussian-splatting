import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix3 } from "../math/Matrix3";
import {PointOctree} from "../Octree/points/PointOctree";

class SplatData {
    static RowLength = 3 * 4 + 3 * 4 + 4 + 4;

    public changed = false;
    public detached = false;
    
    private _vertexCount: number;
    private _positions: Float32Array;
    private _rotations: Float32Array;
    private _scales: Float32Array;
    private _colors: Uint8Array;
    private _selection: Uint8Array;
    private _rendered: Uint8Array;

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
    ) => void;
    
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
        this._rendered = rendered || new Uint8Array(this._vertexCount).fill(1);
        
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
        ) => {
            console.assert(
                positions.byteLength === this.vertexCount * 3 * 4,
                `Expected ${this.vertexCount * 3 * 4} bytes, got ${positions.byteLength} bytes`,
            );
            this._positions = new Float32Array(positions);
            this._rotations = new Float32Array(rotations);
            this._scales = new Float32Array(scales);
            this._colors = new Uint8Array(colors);
            this._selection = new Uint8Array(selection);
            this.detached = false;
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

import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix3 } from "../math/Matrix3";
import {PointOctree} from "../Octree/points/PointOctree";

class SplatData {
    static RowLength = 3 * 4 + 3 * 4 + 4 + 4;

    private firstTime = true;
    
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
    
    private _renderedPositions: Float32Array;
    private _renderedRotations: Float32Array;
    private _renderedScales: Float32Array;
    private _renderedColors: Uint8Array;
    private _renderedSelection: Uint8Array;
    private _renderedIndices: Uint32Array;

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
        this._renderedPositions = positions || new Float32Array(0);
        this._rotations = rotations || new Float32Array(0);
        this._renderedRotations = rotations || new Float32Array(0);
        this._scales = scales || new Float32Array(0);
        this._renderedScales = scales || new Float32Array(0);
        this._colors = colors || new Uint8Array(0);
        this._renderedColors = colors || new Uint8Array(0);
        this._selection = new Uint8Array(this.vertexCount);
        this._renderedSelection = new Uint8Array(this.vertexCount);
        this._rendered = new Uint8Array(this.vertexCount).fill(1);
        this._renderedSplats = vertexCount;

        this._renderedIndices = new Uint32Array(0);
        
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
            const receivedSplats = renderedFrame.reduce((count, value) => count + (value !== 0 ? 1 : 0), 0);

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
                    // Update positions (3 values per position)
                    this._positions[i * 3] = newPositions[newIndex * 3];
                    this._positions[i * 3 + 1] = newPositions[newIndex * 3 + 1];
                    this._positions[i * 3 + 2] = newPositions[newIndex * 3 + 2];

                    // Update rotations (4 values per rotation)
                    this._rotations[i * 4] = newRotations[newIndex * 4];
                    this._rotations[i * 4 + 1] = newRotations[newIndex * 4 + 1];
                    this._rotations[i * 4 + 2] = newRotations[newIndex * 4 + 2];
                    this._rotations[i * 4 + 3] = newRotations[newIndex * 4 + 3];

                    // Update scales (3 values per scale)
                    this._scales[i * 3] = newScales[newIndex * 3];
                    this._scales[i * 3 + 1] = newScales[newIndex * 3 + 1];
                    this._scales[i * 3 + 2] = newScales[newIndex * 3 + 2];

                    // Update colors (4 values per color, assuming RGBA)
                    this._colors[i * 4] = newColors[newIndex * 4];
                    this._colors[i * 4 + 1] = newColors[newIndex * 4 + 1];
                    this._colors[i * 4 + 2] = newColors[newIndex * 4 + 2];
                    this._colors[i * 4 + 3] = newColors[newIndex * 4 + 3];

                    // Update selection
                    this._selection[i] = newSelection[newIndex];

                    newIndex++;
                }
            }

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
    
    get renderedPositions() {
        return this._renderedPositions;
    }

    get rotations() {
        return this._rotations;
    }

    get renderedRotations() {
        return this._renderedRotations;
    }
    get scales() {
        return this._scales;
    }
    
    get renderedScales() {
        return this._renderedScales;
    }

    get colors() {
        return this._colors;
    }
    
    get renderedColors() {
        return this._renderedColors;
    }

    get selection() {
        return this._selection;
    }
    
    get renderedSelection() {
        return this._renderedSelection;
    }

    get rendered() {
        return this._rendered;
    }
    
    calculateRenderedTransforms() {
        const renderedCount = this._rendered.reduce((count, value) => count + value, 0);
        this._renderedPositions = new Float32Array(renderedCount * 3);
        this._renderedRotations = new Float32Array(renderedCount * 4);
        this._renderedScales = new Float32Array(renderedCount * 3);
        this._renderedColors = new Uint8Array(renderedCount * 4);
        this._renderedSelection = new Uint8Array(renderedCount);

        let tempIndex = 0;
        this._rendered.forEach((isRendered, i) => {
            if (isRendered === 1) {
                const positionScaleIndex = i * 3;
                const rotationColorIndex = i * 4;
                
                this._renderedPositions[tempIndex * 3] = this._positions[positionScaleIndex];
                this._renderedPositions[tempIndex * 3 + 1] = this._positions[positionScaleIndex + 1];
                this._renderedPositions[tempIndex * 3 + 2] = this._positions[positionScaleIndex + 2];
                
                this._renderedRotations[tempIndex * 4] = this._rotations[rotationColorIndex];
                this._renderedRotations[tempIndex * 4 + 1] = this._rotations[rotationColorIndex + 1];
                this._renderedRotations[tempIndex * 4 + 2] = this._rotations[rotationColorIndex + 2];
                this._renderedRotations[tempIndex * 4 + 3] = this._rotations[rotationColorIndex + 3];
                
                this._renderedScales[tempIndex * 3] = this._scales[positionScaleIndex];
                this._renderedScales[tempIndex * 3 + 1] = this._scales[positionScaleIndex + 1];
                this._renderedScales[tempIndex * 3 + 2] = this._scales[positionScaleIndex + 2];

                this._renderedColors[tempIndex * 4] = this._colors[rotationColorIndex];
                this._renderedColors[tempIndex * 4 + 1] = this._colors[rotationColorIndex + 1];
                this._renderedColors[tempIndex * 4 + 2] = this._colors[rotationColorIndex + 2];
                this._renderedColors[tempIndex * 4 + 3] = this._colors[rotationColorIndex + 3];
                
                this._renderedSelection[tempIndex] = this._selection[i];

                tempIndex++;
            }
        });
    }
}

export { SplatData };

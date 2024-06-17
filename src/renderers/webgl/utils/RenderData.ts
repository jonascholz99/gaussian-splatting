import { Scene } from "../../../core/Scene";
import { Splat } from "../../../splats/Splat";
import DataWorker from "web-worker:./DataWorker.ts";
import loadWasm from "../../../wasm/data";
import { Matrix4 } from "../../../math/Matrix4";
import {SingleSplat} from "../../../splats/SingleSplat";

class RenderData {
    public dataChanged = false;
    public transformsChanged = false;
    public colorTransformsChanged = false;

    private _splatIndices: Map<Splat, number>;
    private _singleSplatIndices: Map<SingleSplat, number>;
    private _offsets: Map<Splat, number>;
    private _singleOffsets: Map<SingleSplat, number>;
    private _data: Uint32Array;
    private _width: number;
    private _height: number;
    private _transforms: Float32Array;
    private _transformsWidth: number;
    private _transformsHeight: number;
    private _transformIndices: Uint32Array;
    private _transformIndicesWidth: number;
    private _transformIndicesHeight: number;
    private _colorTransforms: Float32Array;
    private _colorTransformsWidth: number;
    private _colorTransformsHeight: number;
    private _colorTransformIndices: Uint32Array;
    private _colorTransformIndicesWidth: number;
    private _colorTransformIndicesHeight: number;
    private _positions: Float32Array;
    private _rotations: Float32Array;
    private _scales: Float32Array;
    private _vertexCount: number;
    private _updating: Set<Splat> = new Set<Splat>();
    private _dirty: Set<Splat> = new Set<Splat>();
    private _worker: Worker;
    
    private _renderedSplats: number;
    
    getSplat: (index: number) => Splat | null;
    getLocalIndex: (splat: Splat, index: number) => number;
    markDirty: (splat: Splat) => void;
    rebuild: () => void;
    dispose: () => void;

    constructor(scene: Scene) {
        let vertexCount = 0;
        let splatIndex = 0;
        this._splatIndices = new Map<Splat, number>();
        this._singleSplatIndices = new Map<SingleSplat, number>();
        this._offsets = new Map<Splat, number>();
        this._singleOffsets = new Map<SingleSplat, number>();
        const lookup = new Map<number, Splat>();
        const singlelookup = new Map<number, SingleSplat>();
        for (const object of scene.objects) {
            if (object instanceof Splat) {
                this._splatIndices.set(object, splatIndex);
                this._offsets.set(object, vertexCount);
                lookup.set(vertexCount, object);
                vertexCount += object.splatCount;
                splatIndex++;
                
                for(let singleSplat of object.splats) {
                    this._singleSplatIndices.set(singleSplat, splatIndex);
                    this._singleOffsets.set(singleSplat, splatIndex);
                    singlelookup.set(vertexCount, singleSplat);
                    splatIndex++;
                }
            }
        }

        this._vertexCount = vertexCount;
        this._renderedSplats = vertexCount;
        this._width = 2048;
        this._height = Math.ceil((2 * this.vertexCount) / this.width);
        this._data = new Uint32Array(this.width * this.height * 4);

        this._transformsWidth = 5;
        this._transformsHeight = lookup.size;
        this._transforms = new Float32Array(this._transformsWidth * this._transformsHeight * 4);

        this._transformIndicesWidth = 1024;
        this._transformIndicesHeight = Math.ceil(this.vertexCount / this._transformIndicesWidth);
        this._transformIndices = new Uint32Array(this._transformIndicesWidth * this._transformIndicesHeight);

        this._colorTransformsWidth = 4;
        this._colorTransformsHeight = 64;
        this._colorTransforms = new Float32Array(this._colorTransformsWidth * this._colorTransformsHeight * 4);
        this._colorTransforms.fill(0);
        this._colorTransforms[0] = 1;
        this._colorTransforms[5] = 1;
        this._colorTransforms[10] = 1;
        this._colorTransforms[15] = 1;

        this._colorTransformIndicesWidth = 1024;
        this._colorTransformIndicesHeight = Math.ceil(this.vertexCount / this._colorTransformIndicesWidth);
        this._colorTransformIndices = new Uint32Array(
            this._colorTransformIndicesWidth * this._colorTransformIndicesHeight,
        );
        this.colorTransformIndices.fill(0);

        this._positions = new Float32Array(this.vertexCount * 3);
        this._rotations = new Float32Array(this.vertexCount * 4);
        this._scales = new Float32Array(this.vertexCount * 3);

        this._worker = new DataWorker();

        const updateRenderData = (splat: Splat) => {
            this._renderedSplats = splat.data.renderedSplats;
            this._height = Math.ceil((2 * this._renderedSplats) / this.width);
            this._data = new Uint32Array(this.width * this.height * 4);

            this._transformIndicesWidth = 1024;
            this._transformIndicesHeight = Math.ceil(this._renderedSplats / this._transformIndicesWidth);
            this._transformIndices = new Uint32Array(this._transformIndicesWidth * this._transformIndicesHeight);

            this._colorTransformIndicesWidth = 1024;
            this._colorTransformIndicesHeight = Math.ceil(this._renderedSplats / this._colorTransformIndicesWidth);
            this._colorTransformIndices = new Uint32Array(
                this._colorTransformIndicesWidth * this._colorTransformIndicesHeight,
            );
            this.colorTransformIndices.fill(0);

            this._positions = new Float32Array(this._renderedSplats * 3);
            this._rotations = new Float32Array(this._renderedSplats * 4);
            this._scales = new Float32Array(this._renderedSplats * 3);
        }
        const updateTransform = (splat: Splat) => {
            const splatIndex = this._splatIndices.get(splat) as number;
            this._transforms.set(splat.transform.buffer, splatIndex * 20);
            this._transforms[splatIndex * 20 + 16] = splat.selected ? 1 : 0;
            splat.positionChanged = false;
            splat.rotationChanged = false;
            splat.scaleChanged = false;
            splat.selectedChanged = false;
            this.transformsChanged = true;
        };

        const updateColorTransforms = () => {
            let colorTransformsChanged = false;
            for (const splat of this._splatIndices.keys()) {
                if (splat.colorTransformChanged) {
                    colorTransformsChanged = true;
                    break;
                }
            }
            if (!colorTransformsChanged) {
                return;
            }
            const colorTransformsMap: Matrix4[] = [new Matrix4()];
            this._colorTransformIndices.fill(0);
            let i = 1;
            for (const splat of this._splatIndices.keys()) {
                const offset = this._offsets.get(splat) as number;
                for (const colorTransform of splat.colorTransforms) {
                    if (!colorTransformsMap.includes(colorTransform)) {
                        colorTransformsMap.push(colorTransform);
                        i++;
                    }
                }
                for (const index of splat.colorTransformsMap.keys()) {
                    const colorTransformIndex = splat.colorTransformsMap.get(index) as number;
                    this._colorTransformIndices[index + offset] = colorTransformIndex + i - 1;
                }
                splat.colorTransformChanged = false;
            }
            for (let index = 0; index < colorTransformsMap.length; index++) {
                const colorTransform = colorTransformsMap[index];
                this._colorTransforms.set(colorTransform.buffer, index * 16);
            }
            this.colorTransformsChanged = true;
        };

        this._worker.onmessage = (e) => {
            if (e.data.response) {
                const response = e.data.response;
                const splat = lookup.get(response.offset) as Splat;
                updateTransform(splat);
                updateColorTransforms();

                const renderedFrame = new Uint8Array(response.rendered);
                let renderedCount = 0;
                for (let i = 0; i < response.vertexCount; i++) {
                    if (renderedFrame[i] === 1) {
                        renderedCount++;
                    }
                }

                const splatIndex = this._splatIndices.get(splat) as number;
                for (let i = 0; i < splat.splatCount; i++) {
                    this._transformIndices[response.offset + i] = splatIndex;
                }
                
                // console.log("this._data: " +this._data.length)
                // console.log("response.data: " + response.data.length)
                // console.log("response.offset: " + response.offset)
                this._data.set(response.data, response.offset * 8);
                splat.data.reattach(
                    response.positions,
                    response.rotations,
                    response.scales,
                    response.colors,
                    response.selection,
                    response.rendered,
                );

                this._positions.set(response.worldPositions, response.offset * 3);
                this._rotations.set(response.worldRotations, response.offset * 4);
                this._scales.set(response.worldScales, response.offset * 3);

                this._updating.delete(splat);

                splat.selectedChanged = false;
                splat.renderNumberChanged = false;

                this.dataChanged = true;
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let wasmModule: any;

        async function initWasm() {
            wasmModule = await loadWasm();
        }

        initWasm();

        async function waitForWasm() {
            while (!wasmModule) {
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }

        const buildImmediate = (splat: Splat) => {
            if (!wasmModule) {
                waitForWasm().then(() => {
                    buildImmediate(splat);
                });
                return;
            }

            updateTransform(splat);

            const positionsPtr = wasmModule._malloc(3 * splat.data.renderedSplats * 4);
            const rotationsPtr = wasmModule._malloc(4 * splat.data.renderedSplats * 4);
            const scalesPtr = wasmModule._malloc(3 * splat.data.renderedSplats * 4);
            const colorsPtr = wasmModule._malloc(4 * splat.data.renderedSplats);
            const selectionPtr = wasmModule._malloc(splat.data.renderedSplats);
            const renderedPtr = wasmModule._malloc(splat.splatCount)
            const dataPtr = wasmModule._malloc(8 * splat.data.renderedSplats * 4);
            const worldPositionsPtr = wasmModule._malloc(3 * splat.splatCount * 4);
            const worldRotationsPtr = wasmModule._malloc(4 * splat.splatCount * 4);
            const worldScalesPtr = wasmModule._malloc(3 * splat.splatCount * 4);
            

            wasmModule.HEAPF32.set(splat.Positions, positionsPtr / 4);
            wasmModule.HEAPF32.set(splat.Rotations, rotationsPtr / 4);
            wasmModule.HEAPF32.set(splat.Scales, scalesPtr / 4);
            wasmModule.HEAPU8.set(splat.Colors, colorsPtr);
            wasmModule.HEAPU8.set(splat.Selections, selectionPtr);
            wasmModule.HEAPU8.set(splat.Rendered, renderedPtr);

            wasmModule._pack(
                splat.selected,
                splat.splatCount,
                positionsPtr,
                rotationsPtr,
                scalesPtr,
                colorsPtr,
                selectionPtr,
                renderedPtr,
                dataPtr,
                worldPositionsPtr,
                worldRotationsPtr,
                worldScalesPtr,
            );

            const outData = new Uint32Array(wasmModule.HEAPU32.buffer, dataPtr, splat.data.renderedSplats * 8);
            const worldPositions = new Float32Array(
                wasmModule.HEAPF32.buffer,
                worldPositionsPtr,
                splat.splatCount * 3,
            );
            const worldRotations = new Float32Array(
                wasmModule.HEAPF32.buffer,
                worldRotationsPtr,
                splat.splatCount * 4,
            );
            const worldScales = new Float32Array(wasmModule.HEAPF32.buffer, worldScalesPtr, splat.splatCount * 3);

            const splatIndex = this._splatIndices.get(splat) as number;
            const offset = this._offsets.get(splat) as number;
            for (let i = 0; i < splat.splatCount; i++) {
                this._transformIndices[offset + i] = splatIndex;
            }
            this._data.set(outData, offset * 8);
            this._positions.set(worldPositions, offset * 3);
            this._rotations.set(worldRotations, offset * 4);
            this._scales.set(worldScales, offset * 3);

            wasmModule._free(positionsPtr);
            wasmModule._free(rotationsPtr);
            wasmModule._free(scalesPtr);
            wasmModule._free(colorsPtr);
            wasmModule._free(selectionPtr);
            wasmModule._free(renderedPtr);
            wasmModule._free(dataPtr);
            wasmModule._free(worldPositionsPtr);
            wasmModule._free(worldRotationsPtr);
            wasmModule._free(worldScalesPtr);
            

            this.dataChanged = true;
            this.colorTransformsChanged = true;
        };

        const build = (splat: Splat) => {

            splat.data.calculateRenderedTransforms();
            
            if (splat.positionChanged || splat.rotationChanged || splat.scaleChanged || splat.selectedChanged) {
                updateTransform(splat);
            }
            
            if(splat.renderNumberChanged) {
                updateRenderData(splat);
                splat.renderNumberChanged = false;
            }

            if (splat.colorTransformChanged) {
                updateColorTransforms();
            }
            
            if (!splat.data.changed || splat.data.detached || splat.renderNumberChanged) return;
            
            const serializedSplat = {
                position: new Float32Array(splat.position.flat()),
                rotation: new Float32Array(splat.rotation.flat()),
                scale: new Float32Array(splat.scale.flat()),
                selected: splat.selected,
                vertexCount: splat.splatCount,
                positions: splat.Positions,
                rotations: splat.Rotations,
                scales: splat.Scales,
                colors: splat.Colors,
                selection: splat.Selections,
                rendered: splat.Rendered,
                offset: this._offsets.get(splat) as number,
            };
            
            this._worker.postMessage(
                {
                    splat: serializedSplat,
                },
                [
                    serializedSplat.position.buffer,
                    serializedSplat.rotation.buffer,
                    serializedSplat.scale.buffer,
                    serializedSplat.positions.buffer,
                    serializedSplat.rotations.buffer,
                    serializedSplat.scales.buffer,
                    serializedSplat.colors.buffer,
                    serializedSplat.selection.buffer,
                    serializedSplat.rendered.buffer,
                ],
            );

            this._updating.add(splat);

            splat.data.detached = true;
        };

        this.getSplat = (index: number) => {
            let splat = null;
            for (const [key, value] of this._offsets) {
                if (index >= value) {
                    splat = key;
                } else {
                    break;
                }
            }
            return splat;
        };

        this.getLocalIndex = (splat: Splat, index: number) => {
            const offset = this._offsets.get(splat) as number;
            return index - offset;
        };

        this.markDirty = (splat: Splat) => {
            this._dirty.add(splat);
        };

        this.rebuild = () => {
            for (const splat of this._dirty) {
                build(splat);
            }

            this._dirty.clear();
        };

        this.dispose = () => {
            this._worker.terminate();
        };

        for (const splat of this._splatIndices.keys()) {
            buildImmediate(splat);
        }

        updateColorTransforms();
    }
    
    get offsets() {
        return this._offsets;
    }

    get singleOffsets() {
        return this._singleOffsets;
    }

    get data() {
        return this._data;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get transforms() {
        return this._transforms;
    }

    get transformsWidth() {
        return this._transformsWidth;
    }

    get transformsHeight() {
        return this._transformsHeight;
    }

    get transformIndices() {
        return this._transformIndices;
    }

    get transformIndicesWidth() {
        return this._transformIndicesWidth;
    }

    get transformIndicesHeight() {
        return this._transformIndicesHeight;
    }

    get colorTransforms() {
        return this._colorTransforms;
    }

    get colorTransformsWidth() {
        return this._colorTransformsWidth;
    }

    get colorTransformsHeight() {
        return this._colorTransformsHeight;
    }

    get colorTransformIndices() {
        return this._colorTransformIndices;
    }

    get colorTransformIndicesWidth() {
        return this._colorTransformIndicesWidth;
    }

    get colorTransformIndicesHeight() {
        return this._colorTransformIndicesHeight;
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

    get vertexCount() {
        return this._renderedSplats;
    }

    get needsRebuild() {
        return this._dirty.size > 0;
    }

    get updating() {
        return this._updating.size > 0;
    }
}

export { RenderData };

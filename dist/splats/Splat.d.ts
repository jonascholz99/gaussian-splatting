import { SplatData } from "./SplatData";
import { Object3D } from "../core/Object3D";
import { Matrix4 } from "../math/Matrix4";
import { Box3 } from "../math/Box3";
import { SingleSplat } from "./SingleSplat";
declare class Splat extends Object3D {
    selectedChanged: boolean;
    renderNumberChanged: boolean;
    colorTransformChanged: boolean;
    private _splats;
    private _data;
    private _selected;
    private _colorTransforms;
    private _colorTransformsMap;
    private _bounds;
    private _numberOfSplats;
    private _numberOfRenderedSplats;
    private _octree;
    recalculateBounds: () => void;
    createSplatsData: () => void;
    applySelection: () => void;
    createOctree: () => void;
    constructor(splat?: SplatData | undefined);
    saveToFile(name?: string | null, format?: string | null): void;
    get data(): SplatData;
    get splats(): SingleSplat[];
    getSplatAtIndex(index: number): SingleSplat | undefined;
    get selected(): boolean;
    set selected(selected: boolean);
    selectSplat(index: number, value: number): void;
    updateRenderingOfSplats(): void;
    get colorTransforms(): Matrix4[];
    get colorTransformsMap(): Map<number, number>;
    get bounds(): Box3;
    get splatCount(): number;
    get numberOfRenderedSplats(): number;
    serialize: () => Uint8Array;
    reattach: (positions: ArrayBufferLike, rotations: ArrayBufferLike, scales: ArrayBufferLike, colors: ArrayBufferLike, selection: ArrayBufferLike) => void;
    get Positions(): Float32Array;
    get Scales(): Float32Array;
    get Rotations(): Float32Array;
    get Colors(): Uint8Array;
    get Selections(): Uint8Array;
}
export { Splat };

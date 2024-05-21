declare class SplatData {
    static RowLength: number;
    changed: boolean;
    detached: boolean;
    private _vertexCount;
    private _positions;
    private _rotations;
    private _scales;
    private _colors;
    private _selection;
    private _rendered;
    private removeItemsFromArray;
    removeVertex: (index: number) => void;
    removeVertexRange: (index: number, count: number) => void;
    serialize: () => Uint8Array;
    reattach: (positions: ArrayBufferLike, rotations: ArrayBufferLike, scales: ArrayBufferLike, colors: ArrayBufferLike, selection: ArrayBufferLike) => void;
    constructor(vertexCount?: number, positions?: Float32Array | null, rotations?: Float32Array | null, scales?: Float32Array | null, colors?: Uint8Array | null, rendered?: Uint8Array | null);
    static Deserialize(data: Uint8Array): SplatData;
    get vertexCount(): number;
    get positions(): Float32Array;
    get rotations(): Float32Array;
    get scales(): Float32Array;
    get colors(): Uint8Array;
    get selection(): Uint8Array;
    get rendered(): Uint8Array;
}
export { SplatData };

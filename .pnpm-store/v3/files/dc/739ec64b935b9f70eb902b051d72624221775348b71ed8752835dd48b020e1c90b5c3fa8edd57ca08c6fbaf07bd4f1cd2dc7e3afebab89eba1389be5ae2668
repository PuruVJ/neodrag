export declare type Segment<T = '--'> = T extends '--' ? SegmentWithoutData : SegmentWithData<T>;
export declare type SegmentWithoutData = [
    string,
    // text
    string | undefined,
    // source
    number | [number, number]
] | string;
export declare type SegmentWithData<T> = [
    string,
    // text
    string | undefined,
    // source
    number | [number, number],
    T
] | string;
export declare function getLength(segments: Segment<any>[]): number;
export declare function toString(segments: Segment<any>[]): string;

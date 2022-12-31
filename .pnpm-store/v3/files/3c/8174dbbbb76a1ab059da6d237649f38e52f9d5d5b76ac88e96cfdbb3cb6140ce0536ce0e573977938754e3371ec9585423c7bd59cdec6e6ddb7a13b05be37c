/**
 * Flatten a complex type such as a union or intersection of objects into a
 * single object.
 */
declare type FlatternAlias<T> = {
    [P in keyof T]: T[P];
} & {};
/**
 * Get the value of the given key in the given object.
 */
declare type ValueOfKey<T extends Record<PropertyKey, unknown>, K extends PropertyKey> = K extends keyof T ? T[K] : never;
/**
 * Safely test whether or not the first given types extends the second.
 *
 * Needed in particular for testing if a type is "never".
 */
declare type Is<T1, T2> = [T1] extends [T2] ? true : false;
/**
 * Safely test whether or not the given type is "never".
 */
declare type IsNever<T> = Is<T, never>;
/**
 * Returns whether or not the given type a record.
 */
declare type IsRecord<T> = And<Not<IsNever<T>>, T extends Readonly<Record<PropertyKey, unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are records.
 */
declare type EveryIsRecord<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [infer Head, ...infer Rest] ? IsRecord<Head> extends true ? Rest extends ReadonlyArray<unknown> ? EveryIsRecord<Rest> : true : false : true;
/**
 * Returns whether or not the given type is an array.
 */
declare type IsArray<T> = And<Not<IsNever<T>>, T extends ReadonlyArray<unknown> ? true : false>;
/**
 * Returns whether or not all the given types are arrays.
 */
declare type EveryIsArray<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [infer T1] ? IsArray<T1> : Ts extends readonly [infer Head, ...infer Rest] ? IsArray<Head> extends true ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>] ? EveryIsArray<Rest> : false : false : false;
/**
 * Returns whether or not the given type is an set.
 *
 * Note: This may also return true for Maps.
 */
declare type IsSet<T> = And<Not<IsNever<T>>, T extends Readonly<ReadonlySet<unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are sets.
 *
 * Note: This may also return true if all are maps.
 */
declare type EveryIsSet<Ts extends ReadonlyArray<unknown>> = Ts extends Readonly<readonly [infer T1]> ? IsSet<T1> : Ts extends readonly [infer Head, ...infer Rest] ? IsSet<Head> extends true ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>] ? EveryIsSet<Rest> : false : false : false;
/**
 * Returns whether or not the given type is an map.
 */
declare type IsMap<T> = And<Not<IsNever<T>>, T extends Readonly<ReadonlyMap<unknown, unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are maps.
 */
declare type EveryIsMap<Ts extends ReadonlyArray<unknown>> = Ts extends Readonly<readonly [infer T1]> ? IsMap<T1> : Ts extends readonly [infer Head, ...infer Rest] ? IsMap<Head> extends true ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>] ? EveryIsMap<Rest> : false : false : false;
/**
 * And operator for types.
 */
declare type And<T1 extends boolean, T2 extends boolean> = T1 extends false ? false : T2;
/**
 * Not operator for types.
 */
declare type Not<T extends boolean> = T extends true ? false : true;
/**
 * Union of the sets' values' types
 */
declare type UnionSetValues<Ts extends ReadonlyArray<unknown>> = UnionSetValuesHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionSetValues.
 */
declare type UnionSetValuesHelper<Ts extends ReadonlyArray<unknown>, Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<ReadonlySet<infer V1>> ? Rest extends ReadonlyArray<unknown> ? UnionSetValuesHelper<Rest, Acc | V1> : Acc | V1 : never : Acc;
/**
 * Union of the maps' values' types
 */
declare type UnionMapKeys<Ts extends ReadonlyArray<unknown>> = UnionMapKeysHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionMapKeys.
 */
declare type UnionMapKeysHelper<Ts extends ReadonlyArray<unknown>, Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<ReadonlyMap<infer K1, unknown>> ? Rest extends readonly [] ? Acc | K1 : UnionMapKeysHelper<Rest, Acc | K1> : never : Acc;
/**
 * Union of the maps' keys' types
 */
declare type UnionMapValues<Ts extends ReadonlyArray<unknown>> = UnionMapValuesHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionMapValues.
 */
declare type UnionMapValuesHelper<Ts extends ReadonlyArray<unknown>, Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<ReadonlyMap<unknown, infer V1>> ? Rest extends readonly [] ? Acc | V1 : UnionMapValuesHelper<Rest, Acc | V1> : never : Acc;
/**
 * Get the keys of the type what match a certain criteria.
 */
declare type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
/**
 * Get the required keys of the type.
 */
declare type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>;
/**
 * Get all the required keys on the types in the tuple.
 */
declare type RequiredKeysOf<Ts extends readonly [unknown, ...ReadonlyArray<unknown>]> = RequiredKeysOfHelper<Ts, never>;
/**
 * Tail-recursive helper type for RequiredKeysOf.
 */
declare type RequiredKeysOfHelper<Ts extends readonly [unknown, ...ReadonlyArray<unknown>], Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Record<PropertyKey, unknown> ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>] ? RequiredKeysOfHelper<Rest, Acc | RequiredKeys<Head>> : Acc | RequiredKeys<Head> : never : Acc;
/**
 * Get the optional keys of the type.
 */
declare type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
/**
 * Get all the optional keys on the types in the tuple.
 */
declare type OptionalKeysOf<Ts extends readonly [unknown, ...ReadonlyArray<unknown>]> = OptionalKeysOfHelper<Ts, never>;
/**
 * Tail-recursive helper type for OptionalKeysOf.
 */
declare type OptionalKeysOfHelper<Ts extends readonly [unknown, ...ReadonlyArray<unknown>], Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Record<PropertyKey, unknown> ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>] ? OptionalKeysOfHelper<Rest, Acc | OptionalKeys<Head>> : Acc | OptionalKeys<Head> : never : Acc;
/**
 * Filter out nevers from a tuple.
 */
declare type FilterOutNever<T extends ReadonlyArray<unknown>> = FilterOutNeverHelper<T, []>;
/**
 * Tail-recursive helper type for FilterOutNever.
 */
declare type FilterOutNeverHelper<T extends ReadonlyArray<unknown>, Acc extends ReadonlyArray<unknown>> = T extends readonly [] ? Acc : T extends readonly [infer Head, ...infer Rest] ? IsNever<Head> extends true ? FilterOutNeverHelper<Rest, Acc> : FilterOutNeverHelper<Rest, [...Acc, Head]> : T;
/**
 * Is the type a tuple?
 */
declare type IsTuple<T extends ReadonlyArray<unknown>> = T extends readonly [] ? true : T extends readonly [unknown, ...ReadonlyArray<unknown>] ? true : false;

/**
 * Mapping of merge function URIs to the merge function type.
 */
interface DeepMergeMergeFunctionURItoKind<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> {
    readonly DeepMergeLeafURI: DeepMergeLeaf<Ts>;
    readonly DeepMergeRecordsDefaultURI: DeepMergeRecordsDefaultHKT<Ts, MF, M>;
    readonly DeepMergeArraysDefaultURI: DeepMergeArraysDefaultHKT<Ts, MF, M>;
    readonly DeepMergeSetsDefaultURI: DeepMergeSetsDefaultHKT<Ts>;
    readonly DeepMergeMapsDefaultURI: DeepMergeMapsDefaultHKT<Ts>;
}
/**
 * Get the type of the given merge function via its URI.
 */
declare type DeepMergeMergeFunctionKind<URI extends DeepMergeMergeFunctionURIs, Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = DeepMergeMergeFunctionURItoKind<Ts, MF, M>[URI];
/**
 * A union of all valid merge function URIs.
 */
declare type DeepMergeMergeFunctionURIs = keyof DeepMergeMergeFunctionURItoKind<ReadonlyArray<unknown>, DeepMergeMergeFunctionsURIs, unknown>;
/**
 * The merge functions to use when deep merging.
 */
declare type DeepMergeMergeFunctionsURIs = Readonly<{
    /**
     * The merge function to merge records with.
     */
    DeepMergeRecordsURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge arrays with.
     */
    DeepMergeArraysURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge sets with.
     */
    DeepMergeSetsURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge maps with.
     */
    DeepMergeMapsURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge other things with.
     */
    DeepMergeOthersURI: DeepMergeMergeFunctionURIs;
}>;
/**
 * Deep merge types.
 */
declare type DeepMergeHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = IsTuple<Ts> extends true ? Ts extends readonly [] ? undefined : Ts extends readonly [infer T1] ? T1 : EveryIsArray<Ts> extends true ? DeepMergeArraysHKT<Ts, MF, M> : EveryIsMap<Ts> extends true ? DeepMergeMapsHKT<Ts, MF, M> : EveryIsSet<Ts> extends true ? DeepMergeSetsHKT<Ts, MF, M> : EveryIsRecord<Ts> extends true ? DeepMergeRecordsHKT<Ts, MF, M> : DeepMergeOthersHKT<Ts, MF, M> : unknown;
/**
 * Deep merge records.
 */
declare type DeepMergeRecordsHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = DeepMergeMergeFunctionKind<MF["DeepMergeRecordsURI"], Ts, MF, M>;
/**
 * Deep merge arrays.
 */
declare type DeepMergeArraysHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = DeepMergeMergeFunctionKind<MF["DeepMergeArraysURI"], Ts, MF, M>;
/**
 * Deep merge sets.
 */
declare type DeepMergeSetsHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = DeepMergeMergeFunctionKind<MF["DeepMergeSetsURI"], Ts, MF, M>;
/**
 * Deep merge maps.
 */
declare type DeepMergeMapsHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = DeepMergeMergeFunctionKind<MF["DeepMergeMapsURI"], Ts, MF, M>;
/**
 * Deep merge other things.
 */
declare type DeepMergeOthersHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = DeepMergeMergeFunctionKind<MF["DeepMergeOthersURI"], Ts, MF, M>;
/**
 * The merge function that returns a leaf.
 */
declare type DeepMergeLeafURI = "DeepMergeLeafURI";
/**
 * Get the leaf type from many types that can't be merged.
 *
 * @deprecated Use `DeepMergeLeaf` instead.
 */
declare type DeepMergeLeafHKT<Ts extends ReadonlyArray<unknown>> = DeepMergeLeaf<Ts>;
/**
 * Get the leaf type from many types that can't be merged.
 */
declare type DeepMergeLeaf<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [] ? never : Ts extends readonly [infer T] ? T : Ts extends readonly [...infer Rest, infer Tail] ? IsNever<Tail> extends true ? Rest extends ReadonlyArray<unknown> ? DeepMergeLeaf<Rest> : never : Tail : never;
/**
 * The meta data deepmerge is able to provide.
 */
declare type DeepMergeBuiltInMetaData = Readonly<{
    key: PropertyKey;
    parents: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>;
}>;

/**
 * The default merge function to merge records with.
 */
declare type DeepMergeRecordsDefaultURI = "DeepMergeRecordsDefaultURI";
/**
 * The default merge function to merge arrays with.
 */
declare type DeepMergeArraysDefaultURI = "DeepMergeArraysDefaultURI";
/**
 * The default merge function to merge sets with.
 */
declare type DeepMergeSetsDefaultURI = "DeepMergeSetsDefaultURI";
/**
 * The default merge function to merge maps with.
 */
declare type DeepMergeMapsDefaultURI = "DeepMergeMapsDefaultURI";
/**
 * The default merge functions to use when deep merging.
 */
declare type DeepMergeMergeFunctionsDefaultURIs = Readonly<{
    DeepMergeRecordsURI: DeepMergeRecordsDefaultURI;
    DeepMergeArraysURI: DeepMergeArraysDefaultURI;
    DeepMergeSetsURI: DeepMergeSetsDefaultURI;
    DeepMergeMapsURI: DeepMergeMapsDefaultURI;
    DeepMergeOthersURI: DeepMergeLeafURI;
}>;
/**
 * A union of all the props that should not be included in type information for
 * merged records.
 */
declare type BlacklistedRecordProps = "__proto__";
/**
 * Deep merge records.
 */
declare type DeepMergeRecordsDefaultHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? FlatternAlias<Omit<DeepMergeRecordsDefaultHKTInternalProps<Ts, MF, M>, BlacklistedRecordProps>> : {};
/**
 * Deep merge record props.
 */
declare type DeepMergeRecordsDefaultHKTInternalProps<Ts extends readonly [unknown, ...ReadonlyArray<unknown>], MF extends DeepMergeMergeFunctionsURIs, M> = {
    [K in OptionalKeysOf<Ts>]?: DeepMergeHKT<DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K, M>, MF, M>;
} & {
    [K in RequiredKeysOf<Ts>]: DeepMergeHKT<DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K, M>, MF, M>;
};
/**
 * Get the value of the property.
 */
declare type DeepMergeRecordsDefaultHKTInternalPropValue<Ts extends readonly [unknown, ...ReadonlyArray<unknown>], K extends PropertyKey, M> = FilterOutNever<DeepMergeRecordsDefaultHKTInternalPropValueHelper<Ts, K, M, readonly []>>;
/**
 * Tail-recursive helper type for DeepMergeRecordsDefaultHKTInternalPropValue.
 */
declare type DeepMergeRecordsDefaultHKTInternalPropValueHelper<Ts extends readonly [unknown, ...ReadonlyArray<unknown>], K extends PropertyKey, M, Acc extends ReadonlyArray<unknown>> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<Record<PropertyKey, unknown>> ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>] ? DeepMergeRecordsDefaultHKTInternalPropValueHelper<Rest, K, M, [
    ...Acc,
    ValueOfKey<Head, K>
]> : [...Acc, ValueOfKey<Head, K>] : never : never;
/**
 * Deep merge 2 arrays.
 */
declare type DeepMergeArraysDefaultHKT<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M> = DeepMergeArraysDefaultHKTHelper<Ts, MF, M, []>;
/**
 * Tail-recursive helper type for DeepMergeArraysDefaultHKT.
 */
declare type DeepMergeArraysDefaultHKTHelper<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs, M, Acc extends ReadonlyArray<unknown>> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends ReadonlyArray<unknown> ? Rest extends readonly [
    ReadonlyArray<unknown>,
    ...ReadonlyArray<ReadonlyArray<unknown>>
] ? DeepMergeArraysDefaultHKTHelper<Rest, MF, M, [...Acc, ...Head]> : [...Acc, ...Head] : never : never;
/**
 * Deep merge 2 sets.
 */
declare type DeepMergeSetsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Set<UnionSetValues<Ts>>;
/**
 * Deep merge 2 maps.
 */
declare type DeepMergeMapsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Map<UnionMapKeys<Ts>, UnionMapValues<Ts>>;
/**
 * Get the merge functions with defaults apply from the given subset.
 */
declare type GetDeepMergeMergeFunctionsURIs<PMF extends Partial<DeepMergeMergeFunctionsURIs>> = Readonly<{
    DeepMergeRecordsURI: PMF["DeepMergeRecordsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeRecordsURI"] : DeepMergeRecordsDefaultURI;
    DeepMergeArraysURI: PMF["DeepMergeArraysURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeArraysURI"] : DeepMergeArraysDefaultURI;
    DeepMergeSetsURI: PMF["DeepMergeSetsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeSetsURI"] : DeepMergeSetsDefaultURI;
    DeepMergeMapsURI: PMF["DeepMergeMapsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeMapsURI"] : DeepMergeMapsDefaultURI;
    DeepMergeOthersURI: PMF["DeepMergeOthersURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeOthersURI"] : DeepMergeLeafURI;
}>;

/**
 * The options the user can pass to customize deepmerge.
 */
declare type DeepMergeOptions<M, MM extends Readonly<Record<PropertyKey, unknown>> = DeepMergeBuiltInMetaData> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;
declare type MetaDataUpdater<M, MM extends DeepMergeBuiltInMetaData> = (previousMeta: M | undefined, metaMeta: Readonly<Partial<MM>>) => M;
/**
 * All the options the user can pass to customize deepmerge.
 */
declare type DeepMergeOptionsFull<M, MM extends DeepMergeBuiltInMetaData> = Readonly<{
    mergeRecords: DeepMergeMergeFunctions<M, MM>["mergeRecords"] | false;
    mergeArrays: DeepMergeMergeFunctions<M, MM>["mergeArrays"] | false;
    mergeMaps: DeepMergeMergeFunctions<M, MM>["mergeMaps"] | false;
    mergeSets: DeepMergeMergeFunctions<M, MM>["mergeSets"] | false;
    mergeOthers: DeepMergeMergeFunctions<M, MM>["mergeOthers"];
    metaDataUpdater: MetaDataUpdater<M, MM>;
    enableImplicitDefaultMerging: boolean;
}>;
/**
 * All the merge functions that deepmerge uses.
 */
declare type DeepMergeMergeFunctions<M, MM extends DeepMergeBuiltInMetaData> = Readonly<{
    mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
}>;
/**
 * The utils provided to the merge functions.
 */
declare type DeepMergeMergeFunctionUtils<M, MM extends DeepMergeBuiltInMetaData> = Readonly<{
    mergeFunctions: DeepMergeMergeFunctions<M, MM>;
    defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
    metaDataUpdater: MetaDataUpdater<M, MM>;
    deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
    useImplicitDefaultMerging: boolean;
    actions: Readonly<{
        defaultMerge: symbol;
        skip: symbol;
    }>;
}>;

declare const defaultMergeFunctions: {
    readonly mergeMaps: typeof defaultMergeMaps;
    readonly mergeSets: typeof defaultMergeSets;
    readonly mergeArrays: typeof defaultMergeArrays;
    readonly mergeRecords: typeof defaultMergeRecords;
    readonly mergeOthers: typeof leaf;
};
/**
 * The default merge functions.
 */
declare type DeepMergeMergeFunctionsDefaults = typeof defaultMergeFunctions;
/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
declare function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(...objects: readonly [...Ts]): DeepMergeHKT<Ts, DeepMergeMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData>;
/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
declare function deepmergeCustom<PMF extends Partial<DeepMergeMergeFunctionsURIs>>(options: DeepMergeOptions<DeepMergeBuiltInMetaData, DeepMergeBuiltInMetaData>): <Ts extends ReadonlyArray<unknown>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, DeepMergeBuiltInMetaData>;
/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
declare function deepmergeCustom<PMF extends Partial<DeepMergeMergeFunctionsURIs>, MetaData, MetaMetaData extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData>(options: DeepMergeOptions<MetaData, MetaMetaData>, rootMetaData?: MetaData): <Ts extends ReadonlyArray<unknown>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, MetaData>;
/**
 * The default strategy to merge records.
 *
 * @param values - The records.
 */
declare function defaultMergeRecords<Ts extends ReadonlyArray<Record<PropertyKey, unknown>>, U extends DeepMergeMergeFunctionUtils<M, MM>, MF extends DeepMergeMergeFunctionsURIs, M, MM extends DeepMergeBuiltInMetaData>(values: Ts, utils: U, meta: M | undefined): DeepMergeRecordsDefaultHKT<Ts, MF, M>;
/**
 * The default strategy to merge arrays.
 *
 * @param values - The arrays.
 */
declare function defaultMergeArrays<Ts extends ReadonlyArray<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs, M>(values: Ts): DeepMergeArraysDefaultHKT<Ts, MF, M>;
/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 */
declare function defaultMergeSets<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(values: Ts): DeepMergeSetsDefaultHKT<Ts>;
/**
 * The default strategy to merge maps.
 *
 * @param values - The maps.
 */
declare function defaultMergeMaps<Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>>(values: Ts): DeepMergeMapsDefaultHKT<Ts>;
/**
 * Get the last value in the given array.
 */
declare function leaf<Ts extends ReadonlyArray<unknown>>(values: Ts): unknown;

export { DeepMergeArraysDefaultHKT, DeepMergeBuiltInMetaData, DeepMergeHKT, DeepMergeLeaf, DeepMergeLeafHKT, DeepMergeLeafURI, DeepMergeMapsDefaultHKT, DeepMergeMergeFunctionURItoKind, DeepMergeMergeFunctionUtils, DeepMergeMergeFunctionsDefaultURIs, DeepMergeMergeFunctionsDefaults, DeepMergeMergeFunctionsURIs, DeepMergeOptions, DeepMergeRecordsDefaultHKT, DeepMergeSetsDefaultHKT, deepmerge, deepmergeCustom };

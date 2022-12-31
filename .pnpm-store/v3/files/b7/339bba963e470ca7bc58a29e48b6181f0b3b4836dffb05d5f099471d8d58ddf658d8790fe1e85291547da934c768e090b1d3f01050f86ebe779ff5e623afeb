'use strict';

var isWhat = require('is-what');

function concatArrays(originVal, newVal) {
    if (isWhat.isArray(originVal) && isWhat.isArray(newVal)) {
        // concat logic
        return originVal.concat(newVal);
    }
    return newVal; // always return newVal as fallback!!
}

function assignProp(carry, key, newVal, originalObject) {
    const propType = {}.propertyIsEnumerable.call(originalObject, key)
        ? 'enumerable'
        : 'nonenumerable';
    if (propType === 'enumerable')
        carry[key] = newVal;
    if (propType === 'nonenumerable') {
        Object.defineProperty(carry, key, {
            value: newVal,
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }
}
function mergeRecursively(origin, newComer, compareFn) {
    // always return newComer if its not an object
    if (!isWhat.isPlainObject(newComer))
        return newComer;
    // define newObject to merge all values upon
    let newObject = {};
    if (isWhat.isPlainObject(origin)) {
        const props = Object.getOwnPropertyNames(origin);
        const symbols = Object.getOwnPropertySymbols(origin);
        newObject = [...props, ...symbols].reduce((carry, key) => {
            const targetVal = origin[key];
            if ((!isWhat.isSymbol(key) && !Object.getOwnPropertyNames(newComer).includes(key)) ||
                (isWhat.isSymbol(key) && !Object.getOwnPropertySymbols(newComer).includes(key))) {
                assignProp(carry, key, targetVal, origin);
            }
            return carry;
        }, {});
    }
    // newObject has all properties that newComer hasn't
    const props = Object.getOwnPropertyNames(newComer);
    const symbols = Object.getOwnPropertySymbols(newComer);
    const result = [...props, ...symbols].reduce((carry, key) => {
        // re-define the origin and newComer as targetVal and newVal
        let newVal = newComer[key];
        const targetVal = isWhat.isPlainObject(origin) ? origin[key] : undefined;
        // When newVal is an object do the merge recursively
        if (targetVal !== undefined && isWhat.isPlainObject(newVal)) {
            newVal = mergeRecursively(targetVal, newVal, compareFn);
        }
        const propToAssign = compareFn ? compareFn(targetVal, newVal, key) : newVal;
        assignProp(carry, key, propToAssign, newComer);
        return carry;
    }, newObject);
    return result;
}
/**
 * Merge anything recursively.
 * Objects get merged, special objects (classes etc.) are re-assigned "as is".
 * Basic types overwrite objects or other basic types.
 */
function merge(object, ...otherObjects) {
    return otherObjects.reduce((result, newComer) => {
        return mergeRecursively(result, newComer);
    }, object);
}
function mergeAndCompare(compareFn, object, ...otherObjects) {
    return otherObjects.reduce((result, newComer) => {
        return mergeRecursively(result, newComer, compareFn);
    }, object);
}
function mergeAndConcat(object, ...otherObjects) {
    return otherObjects.reduce((result, newComer) => {
        return mergeRecursively(result, newComer, concatArrays);
    }, object);
}
// import { Timestamp } from '../test/Timestamp'
// type T1 = { date: Timestamp }
// type T2 = [{ b: string[] }, { b: number[] }, { date: Timestamp }]
// type TestT = Merge<T1, T2>
// type A1 = { arr: string[] }
// type A2 = { arr: number[] }
// type A3 = { arr: boolean[] }
// type TestA = Merge<A1, [A2, A3]>
// interface I1 {
//   date: Timestamp
// }
// interface I2 {
//   date: Timestamp
// }
// const _a: I2 = { date: '' } as unknown as I2
// type TestI = Merge<I1, [I2]>
// // ReturnType<(typeof merge)<I1, I2>>
// const a = merge(_a, [_a])
// interface Arguments extends Record<string | number | symbol, unknown> {
//     key: string;
// }
// const aa1: Arguments = { key: "value1" }
// const aa2: Arguments = { key: "value2" }
// const aa = merge(a1, a2);
// interface Barguments {
//   key: string
// }
// const ba1: Barguments = { key: 'value1' }
// const ba2: Barguments = { key: 'value2' }
// const ba = merge(ba1, ba2)
// interface Carguments {
//   key: string
// }
// const ca = merge<Carguments, Carguments[]>({ key: 'value1' }, { key: 'value2' })
// type P = Pop<Carguments[]>

exports.concatArrays = concatArrays;
exports.merge = merge;
exports.mergeAndCompare = mergeAndCompare;
exports.mergeAndConcat = mergeAndConcat;

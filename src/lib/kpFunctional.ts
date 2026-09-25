import _ from 'lodash';

import KPMath from './kpMath';
import Vic from './vic';

type DimDef = [number] | [number, number] | [number, number, number];

interface iterDim<T> {
  iterDim(d: number, fn: (i: number, di: number) => T): T[];
  iterDim(d: [number, number], fn: (i: [number, number], di: [number, number]) => T): T[][];

  iterDim(
    d: [number, number, number],
    fn: (i: [number, number, number], di: [number, number, number]) => T
  ): T[][][];
  iterDim(d: [number, number], fn: (i: [number, number], di: [number, number]) => T): T[][];
}

// Oh NOW i get higher kinded types.
export type MaskField = (v: Vic) => boolean;
export type FloatField = (v: Vic) => number;
export type VectorField = (v: Vic) => Vic;

export type UnitMapping = (t: number) => number;
export type VecMapping = (t: number) => Vic;

export interface IChain {
  <T>(...fns: ((t: T) => T)[]): (t: T) => T;
  <T, U>(_t: (t: T) => U): (t: T) => U;
  <T, U, V>(_t: (t: T) => U, _u: (u: U) => V): (t: T) => V;
  <T, U, V, W>(_t: (t: T) => U, _u: (u: U) => V, _v: (v: V) => W): (t: T) => W;
  <T, U, V, W, X>(_t: (t: T) => U, _u: (u: U) => V, _v: (v: V) => W, _w: (w: W) => X): (t: T) => X;
}

export const chain: IChain =
  (...fns: Function[]) =>
  (x: any) =>
    fns.reduce((cur, fn) => fn(cur), x);

export function cartesianProduct<T>(...allEntries: T[][]): T[][] {
  const init: T[][] = [[]];
  return allEntries.reduce<T[][]>(
    (results, entries) => results.flatMap((result) => entries.map((entry) => [...result, entry])),
    init
  );
}

export default class KPFunctional {
  /**
   *
   * @returns an array of length iterations from [0,1], evenly spaced
   */
  static linspace(iterations: number) {
    const di = 1 / iterations;
    return _.times(iterations, (i) => i * di);
  }

  //  normalizeArray([{ id:1, val:1}, { id:2, val:1}], 'id') => { 1: { val: 1 }, 2: { val: 2 } };
  //  https://frontendsociety.com/how-to-cast-an-array-of-objects-into-a-dictionary-object-in-typescript-2a3b9790da81
  static normalizeOnKey<T>(array: Array<T>, indexKey: keyof T) {
    const normalizedObject: any = {};
    for (const element of array) {
      const key = element[indexKey];
      normalizedObject[key] = element;
    }
    return normalizedObject as { [key: string]: T };
  }

  // maybe i want linspace?
  // TODO: can i type check this to make sure everything is the same dimensions?
  static foreachD<D extends DimDef>(dims: D, fn: (i: D, di: D) => any) {
    // // num -> [num]
    // if (!Array.isArray(dims)) {
    //   dims = [dims];
    // }

    // // linear
    // if (dims.length === 1) {
    //   dims = Array.isArray(dims) ? dims[0] : dims;
    //   const di = 1 / dims;
    //   return _.times(dims, (i: number) => fn(i, di));
    // }

    // square
    if (dims.length === 2) {
      const [x, y] = dims;
      const delta: DimDef = [1 / dims[0], 1 / dims[1]];
      return _.times(x, (i: number) => _.times(y, (j: number) => fn([i, j] as D, delta as D)));
    }

    // cube
    if (dims.length === 3) {
      const [x, y, z] = dims;
      const delta: DimDef = [1 / dims[0], 1 / dims[1], 1 / dims[2]];
      return _.times(x, (i: number) =>
        _.times(y, (j: number) => {
          _.times(z, (k: number) => fn([i, j, k] as D, delta as D));
        })
      );
    }

    throw new Error('Cannot support foreach dimension of length');
  }

  /**
 * Lerp between items in a list, where 0 is `l[0]` and 1 is `l[:-1]`
 ```ts
 lerpList([0,10], t) === lerp(0, 10, t)
 lerpList([0,10, 100], .3); //~> 5
 lerpList([0,10, 100], .6); //~> 50
 ```
*/
  static lerpList(l: number[], t: number): number {
    if (l.length === 1) {
      return l[0];
    }
    if (l.length === 2) {
      return KPMath.lerp(l[0], l[1], t);
    }
    if (t < 0) {
      return l[0];
    }
    if (t >= 1) {
      return l[l.length - 1];
    }
    const ratio = t * (l.length - 1);
    const idx = Math.floor(ratio);
    const tt = ratio - idx;
    return KPMath.lerp(l[idx], l[idx + 1], tt);
  }

  static lerpObjects<T extends Record<string, number | Vic>>(a: T, b: T, t: number): T {
    return _.mapValues(a, (v, k) => {
      if (typeof v === 'number' && typeof b[k] === 'number') {
        return KPMath.lerp(v, b[k] as number, t);
      }
      if (v instanceof Vic) {
        return v.lerp(b[k] as Vic, t);
      }
      return v;
    }) as T;
  }

  static lerpObject(obj: { [key: string]: [number] }, t: number) {
    return _.mapValues(obj, (v: number[], _k: any) => {
      if (Array.isArray(v)) {
        return KPFunctional.lerpList(v, t);
      }
      return v;
    });
  }

  ///
  static concatByKeys(a: any, b: any) {
    const curkeys = _.flatMap([a, b], _.keys);

    const obj = _.map(curkeys, (key: any) => {
      const vals = _.compact(_.concat(_.get(a, key), _.get(b, key)));
      if (vals.length === 1) return vals[0];
      return vals;
    });
    return _.zipObject(curkeys, obj);
  }

  // U is across each individual object
  // v is down the 2 objects
  // 2d lerp object
  static bilerpObject(
    top: { [key: string]: [number] },
    bottom: { [key: string]: [number] },
    u: number,
    v: number
  ) {
    const tu = KPFunctional.lerpObject(top, u);
    const bu = KPFunctional.lerpObject(bottom, u);
    return KPFunctional.lerpObject(KPFunctional.concatByKeys(tu, bu), v);
  }

  // from NPM each-cons
  // Take an n-sized sliding window of A: [0,1] [1,2] [2,3]
  static eachCons<T>(a: T[], window: number, step:number = 1): T[][] {
    const r = [];
    for (let i = 0; i < a.length - window + 1; i+= step) {
      r.push(this.rangeSlice(a, i, window));
    }
    return r;
  }

  static takeN = KPFunctional.eachCons;

  static rangeSlice<T>(a: T[], i: number, n: number): T[] {
    const r = [];
    for (let j = 0; j < n; j++) {
      r.push(a[i + j]);
    }
    return r;
  }

  /**
   * Sorta shuffle an array
   * Modified from "sort(random order) https://bost.ocks.org/mike/shuffle/compare.html
   * @param arr The array to shuffle
   * @param tuning 0 = sorted (untouched), 1 = completely random
   */
  static shittyShuffle<T>(arr: T[], tuning: number) {
    // Assign each element a weight
    const weights: [T, number][] = arr.map((v, i, l) => {
      const weight = KPMath.lerp(i / l.length, Math.random(), tuning);
      return [v, weight];
    });

    // Sort by weight and extract the value back out
    return weights.sort((a, b) => a[1] - b[1]).map(([v, _w]) => v);
  }
}

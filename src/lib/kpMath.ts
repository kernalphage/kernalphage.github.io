import _ from 'lodash';

import { UnitMapping } from './kpFunctional';
import vic from './vic';

export default class KPMath {
  static readonly tau = 6.28;

  static readonly goldenRatio = 1.618_03;

  static readonly e = 2.718_28;

  static readonly EPSILON = 0.000_000_000_1;
  // Golden functions folow this convention:
  // |--------l--------|
  // |-----a-----|--b--|
  // eg: a is longer than b

  // Divide a length into
  static goldenParts(l: number): [number, number] {
    const a = l / this.goldenRatio;
    const b = l - a;
    return [a, b];
  }

  static goldenSmaller(a: number): number {
    return a / this.goldenRatio;
  }

  static goldenLarger(b: number): number {
    return b * this.goldenRatio;
  }

  static goldenPositions(numCuts: number) {
    return _.times(numCuts, (i: number) => {
      const theta = 3.141 * this.goldenRatio * i;
      return vic.vFromPolar(KPMath.rangeMap(i, 0, numCuts, 0, 1, true), theta);
    });
  }

  /**
   * scale `n` by a 'visually pleasing' amount
   * @returns
   */
  static pleasingScale(n: number, allowIdentity = true): number {
    const scalers = [
      KPMath.goldenRatio,
      1 / KPMath.goldenRatio,
      2, // double
      0.5, // halve
    ];
    if (allowIdentity) {
      scalers.push(1);
    }

    return (_.sample(scalers) ?? 1) * n;
  }

  static lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  }

  /**
   * snaps (floors) `value` so `return` * `parts` is a whole number
   * TODO: Round? different util?
   * @returns
   */
  static nParts(value: number, parts: number) {
    const size = Math.floor(value * parts);
    return (1 * size) / parts;
  }

  /**
   * @returns a value between 0 and `outMax`
   */
  static mapAt0(value: number, inMax: number, outMax: number, clamp = false) {
    return KPMath.rangeMap(value, 0, inMax, 0, outMax, clamp);
  }

  /**
   * Map a value between an input range and an output range. Works if max/min are swapped, or if the ranges intersect.
   * Reference: // https://openframeworks.cc/documentation/math/ofMath/
   * @returns  `value` proportionately between `outputMin` and  `outputMax`, proportional to output if clamp is false
   */
  static rangeMap(
    value: number,
    inputMin: number,
    inputMax: number,
    outputMin: number,
    outputMax: number,
    clamp = false
  ): number {
    if (Math.abs(inputMin - inputMax) < KPMath.EPSILON) {
      return outputMin;
    }
    let outVal = ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
    if (clamp) {
      if (outputMax < outputMin) {
        if (outVal < outputMax) outVal = outputMax;
        else if (outVal > outputMin) outVal = outputMin;
      } else if (outVal > outputMax) outVal = outputMax;
      else if (outVal < outputMin) outVal = outputMin;
    }
    return outVal;
  }

  // https://codepen.io/baku89-the-scripter/pen/KKvpMda
  static circleWave(t: number, curvature: number) {
    const st = Math.sin((curvature * Math.PI) / 2);
    const p = (KPMath.fmod(t * 4, 2) - 1) * st;
    const a = Math.sqrt(1 - p * p);
    const amax = Math.sqrt(1 - p * p);
    const b = Math.sign(KPMath.fmod(t, 1) - 0.5);
    return (-b * (a - amax)) / (1 - amax);
  }

  /**
   * @returns [0,1], 1 when `c` is near `x`, 0 when `c` is `w` away from `x`
   */
  static cubicPulse(c: number, w: number, x: number) {
    let k = Math.abs(x - c);
    if (k > w) return 0;
    k /= w;
    return 1 - k * k * (3 - 2 * k);
  }

  /**
   *
   * @param fn a function T => T
   * @param x the location to derive fn at
   * @param h epsilon for the derivative calculation
   * @returns
   */
  static derivative(fn: UnitMapping, x: number, h = 0.01) {
    const dx = fn(x + h) - fn(x - h);
    return dx / (h * 2);
  }

  /**
   * https://codepen.io/baku89-the-scripter/pen/KKvpMda
   * @returns a mod b, including the fracional part
   * */
  static fmod(a: number, b: number) {
    return ((a % b) + b) % b;
  }

  static toRadians(degrees: number) {
    return (Math.PI * degrees) / 180;
  }

  static toDegrees(radians: number) {
    return (radians * 180) / Math.PI;
  }
}

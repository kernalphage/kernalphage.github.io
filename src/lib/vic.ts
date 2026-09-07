import { Vector2, Vector3, Vector4, Vector4Like } from "three";

export default class Vic {
  // TODO: Rotate axis/angle?
  // TODO: applyOnElements(fn:(number)=>number)

  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 0
  ) {}

  
  isEqual(other: Vic) {
    function fltEquals(a: number, b: number) {
      return Math.abs(a - b) < 1e-18;
    }
    return (
      fltEquals(this.x, other.x) &&
      fltEquals(this.y, other.y) &&
      fltEquals(this.z, other.z) &&
      fltEquals(this.w, other.w)
    );
  }

  notEquals(other: Vic) {
    function fltEquals(a: number, b: number) {
      return Math.abs(a - b) < 1e-18;
    }

    return (
      !fltEquals(this.x, other.x) ||
      !fltEquals(this.y, other.y) ||
      !fltEquals(this.z, other.z) ||
      !fltEquals(this.w, other.w)
    );
  }

  /**
   *
   * @param fn function to apply to each axis
   * @returns
   */
  map(fn: (n: number, i: number) => number, out?: Vic): Vic {
    out = Vic.cloneStamp(this, out);
    return out.mapEquals(fn);
  }

  mapEquals(fn: (n: number, i: number) => number): Vic {
    this.x = fn(this.x, 0);
    this.y = fn(this.y, 1);
    this.z = fn(this.z, 2);
    this.w = fn(this.w, 3);
    return this;
  }

  add(b: Vic, out?: Vic): Vic {
    out = Vic.cloneStamp(this, out);
    return out.addEquals(b);
  }

  addEquals(b: Vic): Vic {
    this.x += b.x;
    this.y += b.y;
    this.z += b.z;
    this.w += b.w;
    return this;
  }

  sub(b: Vic, out?: Vic): Vic {
    out = Vic.cloneStamp(this, out);
    return out.subEquals(b);
  }

  subEquals(b: Vic): Vic {
    this.x -= b.x;
    this.y -= b.y;
    this.z -= b.z;
    this.w -= b.w;

    return this;
  }

  norm(out?: Vic): Vic {
    out = Vic.cloneStamp(this, out);
    return out.normEquals();
  }

  normEquals(): Vic {
    const len = this.mag();
    this.x /= len;
    this.y /= len;
    this.z /= len;
    this.w /= len;
    return this;
  }

  mul(s: number, out?: Vic): Vic {
    out = Vic.cloneStamp(this, out);
    return out.mulEquals(s);
  }

  mulEquals(n: number): Vic {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    this.w *= n;
    return this;
  }

  mulElements(b: Vic, out?: Vic) {
    out = Vic.cloneStamp(this, out);
    return out.mulElementsEquals(b);
  }

  mulElementsEquals(...scale: [Vic] | number[]): Vic {
    if (
      (typeof scale[0] === 'number' || typeof scale[0] === 'undefined') &&
      (typeof scale[1] === 'number' || typeof scale[1] === 'undefined') &&
      (typeof scale[2] === 'number' || typeof scale[2] === 'undefined') &&
      (typeof scale[3] === 'number' || typeof scale[3] === 'undefined')
    ) {
      this.x *= scale[0] || 1;
      this.y *= scale[1] || 1;
      this.z *= scale[2] || 1;
      this.w *= scale[3] || 1;
    } else if (typeof scale[0] === 'object') {
      const vscale = scale[0];
      this.x *= vscale.x;
      this.y *= vscale.y;
      this.z *= vscale.z;
      this.w *= vscale.w;
    }
    return this;
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  mag(): number {
    return Math.sqrt(this.magSq());
  }

  dot(b: Vic): number {
    return this.x * b.x + this.y * b.y + this.z * b.z + this.w * b.w;
  }

  // a '2d cross', Wedge Product, Outer Product and Perpendicular Dot Product
  determinant(b: Vic): number {
    return this.x * b.y - this.y * b.x;
  }

  cross(b: Vic) {
    const cx = this.y * b.z - this.z * b.y;
    const cy = this.z * b.x - this.x * b.z;
    const cz = this.x * b.y - this.y * b.x;
    return new Vic(cx, cy, cz);
  }

  lerp(b: Vic, t: number, out?: Vic): Vic {
    out = Vic.cloneStamp(this, out);
    return out.lerpEquals(b, t);
  }

  lerpEquals(b: Vic, t: number): Vic {
    this.x += (b.x - this.x) * t;
    this.y += (b.y - this.y) * t;
    this.z += (b.z - this.z) * t;
    this.w += (b.w - this.w) * t;
    return this;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  perp(out?: Vic) {
    out = Vic.cloneStamp(this, out);
    return out.perpEq();
  }

  // Right turn 90degrees;
  perpEq() {
    const tmp = -this.y;
    this.y = this.x;
    this.x = tmp;
    return this;
  }

  // Rotate
  rotate(angle: number, out?: Vic) {
    out = Vic.cloneStamp(this, out);
    return out.rotateEq(angle);
  }

  rotateEq(angle: number) {
    angle = this.angle() + angle;
    const nx = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const ny = this.x * Math.sin(angle) + this.y * Math.cos(angle);

    this.x = nx;
    this.y = ny;

    return this;
  }

  rotate90CCW(out?: Vic) {
    out = Vic.cloneStamp(this, out);
    out.x = -this.y;
    out.y = this.x;
    return out;
  }

  // Geometirc functions
  distance(b: Vic, out?: Vic) {
    return this.sub(b, out).mag();
  }

  distanceSq(b: Vic, out?: Vic) {
    return this.sub(b, out).magSq();
  }

  // I don't know if these are the same
  subAngleBetween(b: Vic) {
    return Math.atan2(this.y - b.y, this.x - b.x);
  }

  angleBetween(b: Vic) {
    const d = this.dot(b);
    const m = this.mag() * b.mag();
    return Math.acos(d / m);
  }

  lengthAlong(b: Vic) {
    return this.dot(b) / b.mag();
  }

  projectOnto(b: Vic, out?: Vic) {
    const det = this.dot(b) / this.magSq();
    return Vic.cloneStamp(this, out).mulEquals(det);
  }

  //   "Utility" functions
  isEpsilon(epsilon = 0.0001) {
    return this.magSq() < epsilon;
  }

  toArray(): number[] {
    return [this.x, this.y, this.z, this.w];
  }

  toString() {
    return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`;
  }

  static sDist(a: Vic, b: Vic, out?: Vic) {
    return a.distanceSq(b, out);
  }

  static readonly vUp = new Vic(1, 0, 0);

  static readonly vDown = new Vic(-1, 0, 0);

  static readonly vLeft = new Vic(0, 1, 0);

  static readonly vRight = new Vic(0, -1, 0);

  static readonly vZUp = new Vic(0, 0, 1);

  static readonly vZDown = new Vic(0, 0, -1);

  static readonly vWUp = new Vic(0, 0, 0, 1);

  static readonly vWDown = new Vic(0, 0, 0, -1);

  // Copy values, or create a new vic
  static cloneStamp(from: Vic, to?: Vic) {
    if (!to) {
      to = Vic.vclone(from);
    } else {
      to.x = from.x;
      to.y = from.y;
      to.z = from.z;
      to.w = from.w;
    }
    return to;
  }

  static vFromTHREE(v: Vector2 | Vector3 | Vector4) {
    const cast = v as Vector4;
    return this.vFromArray([cast.x, cast.y, cast.z, cast.w])
  }

  static vFromArray(arr: number[]) {
    if (arr.length < 4) {
      arr[0] = arr[0] || 0;
      arr[1] = arr[1] || 0;
      arr[2] = arr[2] || 0;
      arr[3] = arr[3] || 0;
    }
    return new Vic(arr[0], arr[1], arr[2], arr[3]);
  }

  static vFromPolar(r: number, t: number) {
    return new Vic(Math.sin(t) * r, Math.cos(t) * r);
  }

  static vFromRepeat(n: number): Vic {
    return new Vic(n, n, n, n);
  }

  static vclone(v: Vic) {
    return new Vic(v.x, v.y, v.z, v.w);
  }

  // 2D piecewise lerp? i don't think this is right for slerp
  static unitLerp(a: Vic, b: Vic, t0: number, t1: number) {
    const res = a.mul(t0);
    res.addEquals(b.mul(t1));
    res.normEquals();
    return res;
  }

  /* 
     slerp for vectors: https://observablehq.com/@mourner/approximating-geometric-slerp?collection=@mourner/explorables
     I wonder how this would fare for color lerps? 
*/
  static slerp2D(pa: Vic, pb: Vic, t: number): Vic {
    const a = Vic.cloneStamp(pa);
    const b = Vic.cloneStamp(pb);

    if (t === 0.5) return Vic.unitLerp(a, b, t, t);
    const d = a.dot(b);

    if (d < 0) {
      // angle > 90; recurse into one of the halves
      const m = Vic.unitLerp(a, b, 0.5, 0.5);
      return t < 0.5 ? Vic.slerp2D(a, m, t * 2) : Vic.slerp2D(m, b, t * 2 - 1);
    }
    const A = 1.0904 + d * (-3.2452 + d * (3.556_45 - d * 1.435_19));
    const B = 0.848_013 + d * (-1.060_21 + d * 0.215_638);
    const K = A * (t - 0.5) * (t - 0.5) + B;
    const p = t + t * (t - 0.5) * (t - 1) * K;
    return Vic.unitLerp(a, b, 1 - p, p);
  }

  // Determines if a,b,c is clockwise in a 2d plane.
  // https://math.stackexchange.com/questions/1324179/how-to-tell-if-3-connected-points-are-connected-clockwise-or-counter-clockwise
  // True for clockwise
  static windingClockwise(a: Vic, b: Vic, c: Vic) {
    const dA = b.x * a.y + c.x * b.y + a.x * c.y;
    const dB = a.x * b.y + b.x * c.y + c.x * a.y;
    return dA > dB;
  }
}

Vic.prototype.toString = function toString() {
  if (this.z === 0 && this.w === 0) {
    return `[${this.x}, ${this.y}]`;
  }
  return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`;
};

/*
export type MutableMembers = `${string & keyof Vic}Equals` | `${string & keyof Vic}Eq`;
export type ConstVic = Omit<Vic, MutableMembers> 

const t= Vic.vFromPolar(1,0);

function usevic(a:ConstVic) {
  return a.add(new Vic(1,2,3));
}

const c = usevic(t);
*/

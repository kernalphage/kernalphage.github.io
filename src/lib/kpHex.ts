// Converted from redblobgames' hex
//
// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/

// import { kisPoly, kpKis } from './kpKis';
import Vic from './vic';

// TODO: AddEquals and MulEquals functions?
export class Hex {
  constructor(readonly q: number, readonly r: number, readonly s: number = -(q + r)) {
    if (Math.round(q + r + s) !== 0) throw 'q + r + s must be 0';
  }

  public add(b: Hex): Hex {
    return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
  }

  public subtract(b: Hex): Hex {
    return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
  }

  public scale(k: number): Hex {
    return new Hex(this.q * k, this.r * k, this.s * k);
  }

  /**
   * @returns A hexagon rotated 60 degrees (one 'tick') to the left
   */
  public rotateLeft(): Hex {
    return new Hex(-this.s, -this.q, -this.r);
  }

  /**
   * @returns A hexagon rotated 60 degrees (one 'tick') to the right
   */
  public rotateRight(): Hex {
    return new Hex(-this.r, -this.s, -this.q);
  }


  /**
   *  Constraints:
   *  - no more than 3 connections 
   *  - cannot have 3 connections of the same type
   *  - output cannot be adjacent to an input
   */

  /**
   * The neighbors of the Hex (0,0), oriented clockwise - starting East
   */
  public static directions: Hex[] = [
    new Hex(1, 0, -1),
    new Hex(0, 1, -1),
    new Hex(-1, 1, 0),
    new Hex(-1, 0, 1),
    new Hex(0, -1, 1),
    new Hex(1, -1, 0),
  ];

  public static direction(direction: number): Hex {
    return Hex.directions[direction];
  }

  /**
   *
   * @returns The neighbor cells touching `this`
   */
  public neighbors(): Hex[] {
    return [0, 1, 2, 3, 4, 5].map((dir) => this.neighbor(dir));
  }

  /**
   * @param direction [0,5] inclusive
   */
  public neighbor(direction: number): Hex {
    return this.add(Hex.direction(direction));
  }

  public static diagonals: Hex[] = [
    new Hex(2, -1, -1),
    new Hex(1, -2, 1),
    new Hex(-1, -1, 2),
    new Hex(-2, 1, 1),
    new Hex(-1, 2, -1),
    new Hex(1, 1, -2),
  ];

  /**
   * @param direction [0,5], inclusive
   */
  public diagonalNeighbor(direction: number): Hex {
    return this.add(Hex.diagonals[direction]);
  }

  public diagonalNeighbors(): Hex[] {
    return [0, 1, 2, 3, 4, 5].map(this.diagonalNeighbor.bind(this));
  }

  /**
   * @returns TODO_DOC: (Euclidian, taxicab?) distance from the origin
   */
  public len(): number {
    return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
  }

  /**
   * @returns TODO_DOC: (Euclidian, taxicab?) distance from `b`
   */
  public distance(b: Hex): number {
    return this.subtract(b).len();
  }

  /**
   *
   * @returns Hex rounded to the nearest whole number cell
   */
  public round(): Hex {
    let qi: number = Math.round(this.q);
    let ri: number = Math.round(this.r);
    let si: number = Math.round(this.s);
    const q_diff: number = Math.abs(qi - this.q);
    const r_diff: number = Math.abs(ri - this.r);
    const s_diff: number = Math.abs(si - this.s);
    if (q_diff > r_diff && q_diff > s_diff) {
      qi = -ri - si;
    } else if (r_diff > s_diff) {
      ri = -qi - si;
    } else {
      si = -qi - ri;
    }
    return new Hex(qi, ri, si);
  }

  public lerp(b: Hex, t: number): Hex {
    return new Hex(
      this.q * (1 - t) + b.q * t,
      this.r * (1 - t) + b.r * t,
      this.s * (1 - t) + b.s * t
    );
  }

  /**
   * TODO: use a similar algo for taxicab distance?
   * @returns the shortest path between `this` and `b`
   */
  public linedraw(b: Hex): Hex[] {
    const N: number = this.distance(b);
    const a_nudge: Hex = new Hex(this.q + 1e-6, this.r + 1e-6, this.s - 2e-6);
    const b_nudge: Hex = new Hex(b.q + 1e-6, b.r + 1e-6, b.s - 2e-6);
    const results: Hex[] = [];
    const step: number = 1 / Math.max(N, 1);
    for (let i = 0; i <= N; i++) {
      results.push(a_nudge.lerp(b_nudge, step * i).round());
    }
    return results;
  }
}

/**
 * A hexagon using `x,y` coordinates because they are easier to store
 * Math should be done on the base `Hex` class
 */
export class OffsetCoord {
  constructor(public col: number, public row: number) { }

  public static EVEN = 1;

  public static ODD = -1;

  public static qoffsetFromCube(offset: number, h: Hex): OffsetCoord {
    const col: number = h.q;
    const row: number = h.r + (h.q + offset * (h.q & 1)) / 2;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw 'offset must be EVEN (+1) or ODD (-1)';
    }
    return new OffsetCoord(col, row);
  }

  public static qoffsetToCube(offset: number, h: OffsetCoord): Hex {
    const q: number = h.col;
    const r: number = h.row - (h.col + offset * (h.col & 1)) / 2;
    const s: number = -q - r;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw 'offset must be EVEN (+1) or ODD (-1)';
    }
    return new Hex(q, r, s);
  }

  public static roffsetFromCube(offset: number, h: Hex): OffsetCoord {
    const col: number = h.q + (h.r + offset * (h.r & 1)) / 2;
    const row: number = h.r;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw 'offset must be EVEN (+1) or ODD (-1)';
    }
    return new OffsetCoord(col, row);
  }

  public static roffsetToCube(offset: number, h: OffsetCoord): Hex {
    const q: number = h.col - (h.row + offset * (h.row & 1)) / 2;
    const r: number = h.row;
    const s: number = -q - r;
    if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw 'offset must be EVEN (+1) or ODD (-1)';
    }
    return new Hex(q, r, s);
  }
}

export class DoubledCoord {
  constructor(public col: number, public row: number) { }

  public static qdoubledFromCube(h: Hex): DoubledCoord {
    const col: number = h.q;
    const row: number = 2 * h.r + h.q;
    return new DoubledCoord(col, row);
  }

  public qdoubledToCube(): Hex {
    const q: number = this.col;
    const r: number = (this.row - this.col) / 2;
    const s: number = -q - r;
    return new Hex(q, r, s);
  }

  public static rdoubledFromCube(h: Hex): DoubledCoord {
    const col: number = 2 * h.q + h.r;
    const row: number = h.r;
    return new DoubledCoord(col, row);
  }

  public rdoubledToCube(): Hex {
    const q: number = (this.col - this.row) / 2;
    const r: number = this.row;
    const s: number = -q - r;
    return new Hex(q, r, s);
  }
}

/**
 * Info needed to render a hex with a given `Layout`
 */
export class Orientation {
  constructor(
    public f0: number,
    public f1: number,
    public f2: number,
    public f3: number,
    public b0: number,
    public b1: number,
    public b2: number,
    public b3: number,
    public start_angle: number
  ) { }
}

/** Utility functions to go from Kis <=> Hexagons <=> pixels  */
export class Layout {
  constructor(public orientation: Orientation) { }

  public static pointy: Orientation = new Orientation(
    Math.sqrt(3),
    Math.sqrt(3) / 2,
    0,
    3 / 2,
    Math.sqrt(3) / 3,
    -1 / 3,
    0,
    2 / 3,
    0.5
  );

  public static flat: Orientation = new Orientation(
    3 / 2,
    0,
    Math.sqrt(3) / 2,
    Math.sqrt(3),
    2 / 3,
    0,
    -1 / 3,
    Math.sqrt(3) / 3,
    0
  );


  public static directions: Hex[] = [
    new Hex(0, 0, 0),
    new Hex(1, 0, -1),
    new Hex(1, -1, 0),
    new Hex(0, -1, 1),
    new Hex(-1, 0, 1),
    new Hex(-1, 1, 0),
    new Hex(0, 1, -1)];


  public static diagonals: Hex[] = [
    new Hex(2, -1, -1),
    new Hex(1, -2, 1),
    new Hex(-1, -1, 2),
    new Hex(-2, 1, 1),
    new Hex(-1, 2, -1),
    new Hex(1, 1, -2)
  ];

  public hexToPixel(h: Hex): Vic {
    const M: Orientation = this.orientation;
    const x: number = (M.f0 * h.q + M.f1 * h.r);
    const y: number = (M.f2 * h.q + M.f3 * h.r);
    return new Vic(x, y, 0);
  }

  // TODO: Make sure this plays nicely with threejS's y-up
  public pixelToHex(p: Vic): Hex {
    const M: Orientation = this.orientation;

    const pt: Vic = new Vic(p.x,p.y);
    const q: number = M.b0 * pt.x + M.b1 * pt.y;
    const r: number = M.b2 * pt.x + M.b3 * pt.y;
    return new Hex(q, r, -q - r).round();
  }


  public hexCornerOffset(corner: number): Vic {
    const M: Orientation = this.orientation;
    const angle: number = (2 * Math.PI * (corner - M.start_angle)) / 6;
    return new Vic(Math.cos(angle), Math.sin(angle));
  }

  //   public kisCorners(k: kisPoly): Vic[] {
  //     return k.outlineVerts().map(this.kisToPixel.bind(this));
  //   }


  // The corners of a hex - at least for pointy, this is clockwise starting NE
  public polygonCorners(h: Hex): Vic[] {
    const corners: Vic[] = [];
    const center: Vic = this.hexToPixel(h);
    for (let i = 0; i < 6; i++) {
      const offset: Vic = this.hexCornerOffset(i);
      corners.push(new Vic(center.x + offset.x, center.y + offset.y));
    }
    return corners;
  }
}

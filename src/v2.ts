export default class v2 {
    x: number;
    y: number;

    constructor(x: number, y = x) {
        this.x = x;
        this.y = y;
    }
    add(v: number | v2) {
        if (v instanceof v2) {
            this.x += v.x;
            this.y += v.y;
        } else if (typeof v === 'number') {
            this.x += v;
            this.y += v;
        }

        return this;
    }
    sub(v: number | v2) {
        if (v instanceof v2) {
            this.x -= v.x;
            this.y -= v.y;
        } else if (typeof v === 'number') {
            this.x -= v;
            this.y -= v;
        }
        return this;
    }
    mul(v: number | v2) {
        if (v instanceof v2) {
            this.x *= v.x;
            this.y *= v.y;
        } else if (typeof v === 'number') {
            this.x *= v;
            this.y *= v;
        }
        return this;
    }
    scale(factor: number) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }
    div(v: number | v2) {
        if (v instanceof v2) {
            if (v.x !== 0)
                this.x /= v.x;
            if (v.y !== 0)
                this.y /= v.y;
        } else if (typeof v === 'number') {
            if (v !== 0)
                this.x /= v;
            if (v !== 0)
                this.y /= v;
        }
        return this;
    }
    distTo(v: v2) {
        return Math.sqrt(Math.pow((this.x - v.x), 2) +
            Math.pow((this.y - v.y), 2));
    }
    diff(v: v2) {
        return new v2(Math.abs(this.x - v.x), Math.abs(this.y - v.y));
    }
    get magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) +
            Math.pow(this.y, 2));
    }
    normalise() {
        const m = this.magnitude;
        if (m !== 0)
            this.scale(1 / m);
        else
            console.error(`Cannot normalise vector with magnitude 0`);
        return this;
    }
    get clone() {
        return new v2(this.x, this.y);
    }
    get angle() {
        return -Math.atan2(-this.y, this.x);
    }
    get str() {
        return `x: ${this.x} \ny: ${this.y}`;
    }
    equals(v: v2) {
        return (v.x === this.x &&
            v.y === this.y);
    }
    isInRect(rectPos: v2, rectDimensions: v2) {
        return (this.x > rectPos.x &&
            this.x < rectPos.x + rectDimensions.x &&
            this.y > rectPos.y &&
            this.y < rectPos.y + rectDimensions.y);
    }
    set(to: v2) {
        this.x = to.x;
        this.y = to.y;
        return this;
    }
    apply(m: (n: number) => number) {
        this.x = m(this.x);
        this.y = m(this.y);
        return this;
    }
    dot(v: v2) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v: v2) {
        return this.x * v.y - this.y * v.x;
    }
    get negative() {
        return this.clone.scale(-1);
    }
    toInt() {
        this.apply(Math.round);
        return this;
    }
    get array() {
        return [this.x, this.y];
    }
    isIn (v2s: v2[]): boolean {
        for (let v of v2s) {
            if (v.equals(this))
                return true;
        }
        return false;
    }
    static fromArray(arr: [number, number] | v2) {
        if (arr instanceof v2) return arr.clone;
        return new v2(arr[0], arr[1]);
    }
    static get up() {
        return new v2(0, 1);
    }
    static get down() {
        return new v2(0, -1);
    }
    static get right() {
        return new v2(1, 0);
    }
    static get left() {
        return new v2(-1, 0);
    }
    static get zero() {
        return new v2(0, 0);
    }
    static avPoint(points: v2[]) {
        let total = v2.zero;
        for (let point of points)
            total.add(point);
        return total.scale(1 / points.length);
    }
};
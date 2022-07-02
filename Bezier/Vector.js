export default class Vector {
	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	/** @param {Vector} v */
	add(v) {
		return new Vector(this.x + v.x, this.y + v.y)
	}
	/** @param {Vector} v */
	sub(v) {
		return new Vector(this.x - v.x, this.y - v.y)
	}
	/** @param {number} n */
	mul(n) {
		return new Vector(this.x * n, this.y * n)
	}
	/** @param {number} n */
	div(n) {
		return new Vector(this.x / n, this.y / n)
	}
	/** @param {Vector} v */
	dist(v) {
		return Math.hypot(this.x - v.x, this.y - v.y)
	}
}
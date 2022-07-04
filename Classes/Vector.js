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
	/** @param {Vector} v */
	dist(v) {
		return Math.hypot(this.x - v.x, this.y - v.y)
	}
	/** @param {Vector} v */
	entrywise(v) {
		return new Vector(this.x * v.x, this.y * v.y)
	}

	*[Symbol.iterator] () {
		yield this.x
		yield this.y
	}
}
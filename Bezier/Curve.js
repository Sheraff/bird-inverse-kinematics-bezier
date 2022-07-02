/** @typedef {import('./Point.js').default} Point */

export default class Curve {
	static resolution = 30

	/** @param {...Point} points */
	constructor(...points) {
		this.points = points
	}

	draw(ctx) {
		ctx.beginPath()
		ctx.moveTo(this.points[0].center.x, this.points[0].center.y)
		for (let i = 1; i < this.points.length; i++) {
			const a = this.points[i - 1]
			const b = this.points[i]
			for (let t = 0; t <= 1; t += 1 / Curve.resolution) {
				const p0 = a.center.mul(-1*t**3 + 3*t**2 - 3*t + 1)
				const p1 = a.hAfter.mul(3*t**3 - 6*t**2 + 3*t)
				const p2 = b.hBefore.mul(-3*t**3 + 3*t**2)
				const p3 = b.center.mul(t**3)
				const next = p0.add(p1).add(p2).add(p3)
				ctx.lineTo(next.x, next.y)
			}
		}
		ctx.stroke()

		// for (let i = 0; i < this.points.length; i++) {
		// 	const stop = i === 0 ? 'first' : i === this.points.length - 1 ? 'last' : null
		// 	this.points[i].draw(ctx, stop)
		// }
	}
}
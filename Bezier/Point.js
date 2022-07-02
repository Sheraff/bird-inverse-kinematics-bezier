import Vector from "./Vector.js"

export default class Point {

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} hx
	 * @param {number} hy
	 */
	constructor(x, y, hx, hy) {
		this.center = new Vector(x, y)
		this.hBefore = new Vector(hx, hy)
		const delta = this.center.sub(this.hBefore)
		this.hAfter = this.center.add(delta)
		this.active = null
	}

	updateCenter(mouse) {
		const delta = mouse.sub(this.center)
		this.hBefore = delta.add(this.hBefore)
		this.hAfter = delta.add(this.hAfter)
		this.center = mouse
	}

	updateHandle(mouse, which) {
		const other = which === 'hBefore' ? 'hAfter' : 'hBefore'
		this[which] = mouse
		const delta = this.center.sub(this[which])
		this[other] = this.center.add(delta)
	}

	/** @param {CanvasRenderingContext2D} ctx */
	draw(ctx, stop) {
		if(stop !== 'first')
			this.drawHandle(ctx, this.hBefore)
		if(stop !== 'last')
			this.drawHandle(ctx, this.hAfter)
		// this.drawCenter(ctx)
	}

	drawHandle(ctx, handle) {
		// ctx.beginPath()
		// ctx.moveTo(this.center.x, this.center.y)
		// ctx.lineTo(handle.x, handle.y)
		// ctx.strokeStyle = '#555'
		// ctx.stroke()
		// ctx.closePath()
		ctx.beginPath()
		ctx.arc(handle.x, handle.y, 5, 0, Math.PI * 2)
		ctx.strokeStyle = this.active && this.active !== 'center' ? 'limegreen' : '#fff'
		ctx.stroke()
		ctx.closePath()
	}

	drawCenter(ctx) {
		ctx.beginPath()
		ctx.arc(this.center.x, this.center.y, 5, 0, Math.PI * 2)
		ctx.fillStyle =  this.active === 'center' ? 'limegreen' : '#fff'
		ctx.fill()
		ctx.closePath()
	}
}
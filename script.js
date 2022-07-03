import Curve from "./Bezier/Curve.js"
import Point from "./Bezier/Point.js"
import Vector from "./Bezier/Vector.js"

const UPPER_ARM_LENGTH = 55
const FOREARM_LENGTH = 70
const FOOT_HEIGHT = 6
const BODY_RADIUS = 22
const BEAK_LENGTH = 40
const STEP_DURATION = 400

const canvas = document.querySelector('canvas')
if(!canvas)
	throw new Error('No canvas found')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext('2d')
if(!ctx)
	throw new Error('No context found')

/**
 * @param {CanvasRenderingContext2D} ctx
 */
void function (ctx) {
	const startX = ctx.canvas.width / 2
	const startY = ctx.canvas.height - (UPPER_ARM_LENGTH + FOREARM_LENGTH) * .9
	/** @type {Bird} */
	const bird = {
		direction: 1,
		pos: new Vector(startX, startY),
		feet: [
			{
				pos: new Vector(startX, ctx.canvas.height - FOOT_HEIGHT),
				lerp: null,
			},
			{
				pos: new Vector(startX + BODY_RADIUS * 2, ctx.canvas.height - FOOT_HEIGHT),
				lerp: null,
			},
		],
		head: {
			pos: new Vector(startX + BODY_RADIUS, startY - (UPPER_ARM_LENGTH + FOREARM_LENGTH) * .75),
			nape: new Vector(-BODY_RADIUS * 2, (UPPER_ARM_LENGTH + FOREARM_LENGTH) * .2),
			sternum: new Vector(-BODY_RADIUS * 2, BODY_RADIUS * 2),
			lerp: null,
		},
		shoulder: new Vector(
			startX - 1 * BODY_RADIUS / 2,
			startY + BODY_RADIUS
		)
	}
	/** @type {Vector} */
	const mousePos = new Vector(bird.pos.x, bird.pos.y)
	update(ctx, mousePos, bird)
	draw(ctx, mousePos, bird)
}(ctx)


/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Vector} mousePos
 * @param {Bird} bird
 */
function update(ctx, mousePos, bird) {
	window.addEventListener('pointermove', event => {
		mousePos.x = event.clientX
		mousePos.y = event.clientY
	})
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Vector} mousePos
 * @param {Bird} bird
 */
function draw(ctx, mousePos, bird) {
	/**
	 * @param {number} lastTime
	 */
	function loop(lastTime) {
		requestAnimationFrame((time) => {
			const delta = lastTime ? time - lastTime : 0
			updateBird(mousePos, bird, delta, time, ctx)
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			drawBird(ctx, bird)
			loop(time)
		})
	}
	loop(0)
}

/**
 * @param {Vector} mousePos
 * @param {Bird} bird
 * @param {number} dt
 * @param {number} time
 * @param {CanvasRenderingContext2D} ctx
 */
function updateBird(mousePos, bird, dt, time, ctx) {
	const speed = (mousePos.x - bird.pos.x) * dt / 1000

	// Update body
	{
		bird.pos.x += speed
		bird.direction = Math.sign(speed)
		bird.pos.y = ctx.canvas.height - (UPPER_ARM_LENGTH + FOREARM_LENGTH) * .9 - Math.sin(time / 500) * 5 + Math.abs(speed) * 3
		bird.shoulder.x = bird.pos.x - bird.direction * BODY_RADIUS / 2
		bird.shoulder.y = bird.pos.y + BODY_RADIUS
	}

	// Update feet
	{
		// if (Math.abs(speed) > 5 || !bird.feet.some(foot => foot.lerp)) {
		// 	const which = (bird.feet[0].pos.x < bird.feet[1].pos.x) === (bird.direction === 1)
		// 	const furthest = which ? bird.feet[0] : bird.feet[1]
		// 	const other = which ? bird.feet[1] : bird.feet[0]
		// 	if (
		// 		!furthest.lerp
		// 		&& (
		// 			bird.shoulder.dist(furthest.pos) > .9 * (UPPER_ARM_LENGTH + FOREARM_LENGTH)
		// 			|| (
		// 				(!other.lerp || time - other.lerp.start > 0.9 * (other.lerp.end - other.lerp.start))
		// 				// && !other.lerp
		// 				&& Math.abs(bird.shoulder.x - furthest.pos.x) > BODY_RADIUS * 2
		// 				&& bird.shoulder.dist(furthest.pos) > (UPPER_ARM_LENGTH + FOREARM_LENGTH) * Math.min(1, Math.abs(speed) / 10)
		// 			)
		// 		)
		// 	) {
		// 		furthest.lerp = {
		// 			start: time,
		// 			end: time + STEP_DURATION / Math.max(1, Math.abs(speed) / 4),
		// 			from: new Vector(furthest.pos.x, furthest.pos.y),
		// 			to: new Vector(
		// 				bird.pos.x - bird.direction * BODY_RADIUS * 1 * Math.abs(speed / 10),
		// 				furthest.pos.y - 30 + Math.abs(speed),
		// 			),
		// 			meta: {
		// 				bodyX: bird.pos.x,
		// 			}
		// 		}
		// 	}
		// }
		const furthest = (bird.feet[0].pos.x < bird.feet[1].pos.x) === (bird.direction === 1)
			? 0 : 1
		bird.feet.forEach((foot, i) => {
			const other = bird.feet[i === 0 ? 1 : 0]
			const distanceToShoulder = bird.shoulder.dist(foot.pos)
			if (
				!foot.lerp
				&& (
					distanceToShoulder > .98 * (UPPER_ARM_LENGTH + FOREARM_LENGTH)
					|| (
						Math.abs(speed) < 6
						&& i === furthest
						&& !other.lerp
						&& Math.abs(bird.shoulder.x - foot.pos.x) > BODY_RADIUS * 2
					)
					|| (
						Math.abs(speed) >= 6
						&& (
							!other.lerp
							|| time - other.lerp.start > 0.8 * (other.lerp.end - other.lerp.start)
						)
						&& distanceToShoulder > (UPPER_ARM_LENGTH + FOREARM_LENGTH) * Math.min(1, Math.abs(speed) / 7)
					)
				)
			) {
				foot.lerp = {
					start: time,
					end: time + STEP_DURATION / Math.max(1, Math.abs(speed) / 4),
					from: new Vector(foot.pos.x, ctx.canvas.height - FOOT_HEIGHT),
					to: new Vector(
						bird.shoulder.x - bird.direction * BODY_RADIUS * (-1 + Math.abs(speed / 5)),
						ctx.canvas.height - FOOT_HEIGHT - 30 + Math.abs(speed),
					),
					meta: {
						bodyX: bird.pos.x,
					}
				}
			}
			if(foot.lerp) {
				const t = (time - foot.lerp.start) / (foot.lerp.end - foot.lerp.start)
				if(t >= 1) {
					foot.pos.x = (bird.pos.x - foot.lerp.meta.bodyX) + foot.lerp.to.x
					foot.pos.y = foot.lerp.from.y
					foot.lerp = null
				} else {
					foot.pos.x = (bird.pos.x - foot.lerp.meta.bodyX) + lerp(foot.lerp.from.x, foot.lerp.to.x, t)
					foot.pos.y = lerp(foot.lerp.from.y, foot.lerp.to.y, t, easeSin)
				}
			}
		})
	}

	// Update head
	{
		bird.head.pos.y = bird.pos.y - (UPPER_ARM_LENGTH + FOREARM_LENGTH) * .75 + Math.sin(time / 500 - 300) * 7 + Math.abs(speed) * 3
		bird.head.nape.x = -BODY_RADIUS * 3 + BODY_RADIUS * Math.min(1, Math.abs(speed) / 4)
		bird.head.nape.y = (UPPER_ARM_LENGTH + FOREARM_LENGTH) * .3 - (UPPER_ARM_LENGTH + FOREARM_LENGTH) * .1 * Math.max(1, Math.abs(speed) / 4)
		bird.head.sternum.x = -BODY_RADIUS * 3 + BODY_RADIUS * Math.min(1, Math.abs(speed) / 4)
		bird.head.sternum.y = BODY_RADIUS * 3 - BODY_RADIUS * Math.min(1, Math.abs(speed) / 4)
		if (bird.head.lerp) {
			const t = (time - bird.head.lerp.start) / (bird.head.lerp.end - bird.head.lerp.start)
			if(t >= 1) {
				bird.head.lerp = null
			} else {
				bird.head.pos.x = lerp(bird.head.lerp.from.x, bird.head.lerp.to.x, t)
			}
		} else if (Math.abs(speed) < 6 && (bird.head.pos.x - bird.pos.x) * bird.direction < 0) {
			bird.head.lerp = {
				start: time,
				end: time + STEP_DURATION / Math.max(1, Math.abs(speed)),
				from: new Vector(bird.head.pos.x, 0),
				to: new Vector(bird.pos.x + bird.direction * BODY_RADIUS * 3, 0),
			}
		} else if(Math.abs(speed) >= 6) {
			bird.head.pos.x += speed + (dt / 1000) * (speed) * Math.abs(bird.head.pos.x - bird.pos.x)
			if (bird.head.pos.dist(bird.pos) > BODY_RADIUS * 6) {
				bird.head.pos.x = bird.pos.x + bird.direction * Math.sqrt((BODY_RADIUS * 6)**2 - (bird.head.pos.y - bird.pos.y)**2)
			}
		}
	}
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Bird} bird
 */
function drawBird(ctx, bird) {
	const primary = '#777'
	const secondary = '#111'

	ctx.fillStyle = primary
	ctx.strokeStyle = secondary
	ctx.lineJoin = 'round'

	// legs
	ctx.lineWidth = 4
	bird.feet.forEach(foot => {
		const elbow = inverseKinematicsWithTwoJoints(bird.shoulder, foot.pos, UPPER_ARM_LENGTH, FOREARM_LENGTH, -bird.direction)
		// arms
		ctx.beginPath()
		ctx.moveTo(bird.shoulder.x, bird.shoulder.y)
		ctx.lineTo(elbow.x, elbow.y)
		ctx.lineTo(foot.pos.x, foot.pos.y)
		ctx.stroke()
		// elbow
		ctx.beginPath()
		ctx.arc(elbow.x, elbow.y, 5, 0, 2 * Math.PI)
		ctx.fill()
		// foot
		ctx.beginPath()
		ctx.moveTo(foot.pos.x, foot.pos.y - 3)
		ctx.lineTo(foot.pos.x - 8, foot.pos.y + FOOT_HEIGHT)
		ctx.lineTo(foot.pos.x + 8, foot.pos.y + FOOT_HEIGHT)
		ctx.closePath()
		ctx.fill()
	})

	// neck
	{
		ctx.lineWidth = 5
		const sternumAnchor = new Vector(
			bird.pos.x + bird.direction * BODY_RADIUS * Math.cos(Math.PI / 4),
			bird.pos.y - BODY_RADIUS * Math.cos(Math.PI / 4),
		)
		const sternumPoint = new Point(
			sternumAnchor.x,
			sternumAnchor.y,
			sternumAnchor.x + bird.direction * bird.head.sternum.x,
			sternumAnchor.y + bird.head.sternum.y
		)
		const napePoint = new Point(
			bird.head.pos.x,
			bird.head.pos.y,
			bird.head.pos.x + bird.direction * bird.head.nape.x,
			bird.head.pos.y + bird.head.nape.y
		)
		const neckCurve = new Curve(sternumPoint, napePoint)
		neckCurve.draw(ctx)
	}

	// head
	{
		const headRadius = BODY_RADIUS / 2
		// face
		ctx.beginPath()
		ctx.arc(bird.head.pos.x, bird.head.pos.y, headRadius, 0, 2 * Math.PI)
		ctx.fill()
		// beak
		ctx.beginPath()
		ctx.moveTo(bird.head.pos.x, bird.head.pos.y - headRadius / 2)
		ctx.lineTo(bird.head.pos.x + bird.direction * (headRadius + BEAK_LENGTH), bird.head.pos.y)
		ctx.lineTo(bird.head.pos.x, bird.head.pos.y + headRadius / 2)
		ctx.closePath()
		ctx.fill()
		// eye
		ctx.fillStyle = secondary
		ctx.beginPath()
		ctx.arc(bird.head.pos.x, bird.head.pos.y, headRadius / 3, 0, 2 * Math.PI)
		ctx.fill()
		ctx.fillStyle = primary
	}

	// body
	{
		ctx.beginPath()
		ctx.arc(bird.pos.x, bird.pos.y, BODY_RADIUS, 0, 2 * Math.PI)
		ctx.fill()
		ctx.beginPath()
		ctx.moveTo(bird.pos.x - bird.direction * BODY_RADIUS, bird.pos.y)
		ctx.lineTo(bird.pos.x - bird.direction * BODY_RADIUS * 2, bird.pos.y + BODY_RADIUS)
		ctx.lineTo(bird.pos.x, bird.pos.y + BODY_RADIUS)
		ctx.closePath()
		ctx.fill()
	}
}


/**
 * @param {number} from
 * @param {number} to
 * @param {number} t [0 - 1]
 * @param {(t: number) => number} easing ([0-1]) -> [0-1]
 */
function lerp(from, to, t, easing = a => a) {
	return from + (to - from) * Math.min(1, easing(t))
}

function easeSin(t) {
	return Math.sin(t * Math.PI)
}

/**
 * @param {Vector} shoulder
 * @param {Vector} wrist
 * @param {number} upperJointLength
 * @param {number} lowerJointLength
 * @param {1 | -1} direction
 * @returns {Vector}
 */
 function inverseKinematicsWithTwoJoints(shoulder, wrist, upperJointLength, lowerJointLength, direction) {
	const d = wrist.dist(shoulder)
	
	const startToElbowNormal = (d**2 - lowerJointLength**2 + upperJointLength**2) / (2 * d)
	const shoulderAngle = Math.acos(startToElbowNormal / upperJointLength)
	const baseAngle = ((shoulder.x >= wrist.x) === (direction === 1))
		? Math.acos((wrist.y - shoulder.y) / d)
		: -Math.acos((wrist.y - shoulder.y) / d)
	const angle = - baseAngle + shoulderAngle + Math.PI / 2
	const elbowX = shoulder.x - upperJointLength * Math.cos(angle) * direction
	const elbowY = shoulder.y + upperJointLength * Math.sin(angle)
	return new Vector(elbowX, elbowY)
}
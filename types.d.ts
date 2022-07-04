import Vector from "./Classes/Vector"

export type Bird = {
	direction: 1 | -1
	speed: number
	pos: Vector
	feet: [Foot, Foot]
	head: Head
	shoulder: Vector
	neck: Vector
}

type Foot = {
	pos: Vector
	lerp: null | Lerp
}

type Head = {
	pos: Vector
	nape: Vector
	sternum: Vector
	lerp: null | Lerp
}

type Lerp = {
	start: number
	end: number
	from: Vector
	to: Vector
	meta?: any
}
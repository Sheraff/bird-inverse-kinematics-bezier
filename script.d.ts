import Vector from "./Bezier/Vector"

type Bird = {
	direction: 1 | -1
	pos: Vector
	feet: [Foot, Foot]
	head: Head
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
}
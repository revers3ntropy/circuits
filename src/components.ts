import v2 from './v2';
import {blue, Direction, enumDict, red} from "./util";
import type {atFunction} from "./game";
import {selection, squareSize} from "./game";
import {green, worldSpaceToScreenSpace} from "./util";
import {arrow, circle, rect} from "./drawing";

export type componentTypes = number;

export enum ct {
	wire,
	light ,
	power,
	switch,
	not,
	custom,
	delay,
	clock,
}

export abstract class Component {
	position: v2;
	type: componentTypes;
	powered: boolean;
	order: number;
	rotation: Direction;

	protected constructor (
		position: v2 | [number, number],
		type: componentTypes,
		order: number,
		direction: number
	) {
		this.order = order;

		if (Array.isArray(position))
			this.position = v2.fromArray(position);
		else
			this.position = position;


		this.type = type;

		// not powered at start if it isn't a power block
		this.powered = this.type === ct.power;

		this.rotation = new Direction(direction);
	}

	public abstract jsonify: () => any;

	// returns whether or not an update is required, because new components have been powered
	public abstract tick: (at: atFunction) => boolean

	public abstract beforeTick: (at: atFunction) => any
	public abstract afterTick: (at: atFunction) => any

	public abstract onclick: () => void;

	public static createFromJSON (json: { type: componentTypes }): Component {
		return new componentTypeToClass[json.type](json);
	}

	public abstract draw: (at: v2, props: any) => void;
}

export class Wire extends Component {
	to: v2;

	constructor({
		to = v2.zero,
		position = v2.zero,
	}) {
		super(position, ct.wire, 0, 0);

		this.to = v2.fromArray(to);
	}

	jsonify = () => {
		return {
			position: this.position.array,
			type: this.type,
			to: this.to.array
		};
	}

	tick = (at: atFunction) => {
		if (this.powered) {
			let newPower = false;
			for (let comp of at(this.to)) {
				if (!comp.powered) {
					comp.powered = true;
					newPower = true;
				}
			}
			return newPower;
		} else return false;
	}

	onclick = () => void 0;

	draw = (at: v2, props: any) => {
		let endPos = this.to.clone.mul(squareSize).add(squareSize / 2);
		const endRenderPos = worldSpaceToScreenSpace(
			endPos, props.camPos,
			props.width, props.height, props.zoom
		);

		arrow (
			props.context, at.clone.add(squareSize * props.zoom/2),
			endRenderPos, props.zoom * 10,
			this.powered ? 'rgb(255,0,0)' : 'rgb(127,53,53)',
			0.5
		);
	}

	beforeTick = () => void 0;
	afterTick = () => void 0;
}

export class Light extends Component {
	colour: string;

	constructor({
		position = v2.zero,
		colour = red
	}) {
		super(position, ct.light, 1, 0);

		this.colour = colour;
	}

	jsonify = () => {
		return {
			position: this.position.array,
			type: this.type,
			colour: this.colour
		};
	}

	tick = () => false;

	onclick = () => {
		if (this.colour === red)
			this.colour = green;

		else if (this.colour === green)
			this.colour = blue;

		else
			this.colour = red;

		selection.set([]);
	};

	draw = (at: v2, props: any) => {
		if (this.powered) {
			rect (props.context, at, squareSize * props.zoom, squareSize * props.zoom, this.colour);
			return;
		}
		circle (props.context, at.clone.add(squareSize * props.zoom/2),
			squareSize * props.zoom / 4,
			'rgb(186,186,186)'
		);
	}

	beforeTick = () => void 0;
	afterTick = () => void 0;
}


export class Power extends Component {
	constructor({
		position = v2.zero
	}) {
		super(position, ct.power, 2, 0);
	}

	jsonify = () => {
		return {
			position: this.position.array,
			type: this.type
		};
	};

	tick = (at: atFunction) => {
		this.powered = true;
		let newPower = false;
		for (let comp of at(this.position)) {
			if (!comp.powered) {
				comp.powered = true;
				newPower = true;
			}
		}
		return newPower;
	};

	onclick = () => void 0;

	draw = (at: v2, props: any) => {
		rect (props.context, at,
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(153,153,153)' : 'rgb(0,0,0)'
		);
	}

	beforeTick = () => void 0;
	afterTick = () => void 0;
}

export class Switch extends Component {
	state: boolean;

	constructor({
		position = v2.zero,
		rotation = 0
	}) {
		super(position, ct.switch, 2, rotation);
		this.state = false;
	}

	jsonify = () => {
		return {
			position: this.position.array,
			type: this.type,
			state: this.state,
			rotation: this.rotation.d
		};
	};

	tick = (at: atFunction) => {
		if (this.powered && this.state) {
			let newPower = false;
			for (let comp of at(this.position.clone.add(this.rotation.forwards))) {
				if (!comp.powered) {
					comp.powered = true;
					newPower = true;
				}
			}
			return newPower;
		} else return false;
	};

	onclick = () => {
		this.state = !this.state;
	}

	draw = (at: v2, props: any) => {
		rect (props.context, at,
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(250,123,123)' : 'rgb(210,210,210)'
		);

		rect (props.context, at.clone.add(this.rotation.forwards.mul(squareSize * props.zoom)),
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(250,123,123)' : 'rgb(210,210,210)'
		);

		circle (props.context, at.clone.add(squareSize * props.zoom/2),
			squareSize * props.zoom / 4,
			this.state ? 'rgb(0,255,0)' : 'rgb(255,0,0)'
		);
	}

	beforeTick = () => void 0;
	afterTick = () => void 0;
}

export class Not extends Component {
	constructor({
		position = v2.zero,
		rotation = 0
	}) {
		super(position, ct.not, 2, rotation);
	}

	jsonify = () => {
		return {
			position: this.position.array,
			type: this.type,
			rotation: this.rotation.d
		};
	};

	tick = () => false;

	onclick = () => void 0;

	draw = (at: v2, props: any) => {

		rect (props.context, at,
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(250,123,123)' : 'rgb(210,210,210)'
		);
		rect (props.context, at.clone.add(this.rotation.forwards.mul(squareSize * props.zoom)),
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(250,123,123)' : 'rgb(210,210,210)'
		);

		circle (props.context, at.clone.add(squareSize * props.zoom/2),
			squareSize * props.zoom / 4,
			'rgb(66,117,226)'
		);
	}

	beforeTick = () => void 0;
	afterTick = (at: atFunction) => {

		if ( ! this.powered) {
			let newPower = false;
			for (let comp of at(this.position.clone.add(this.rotation.forwards))) {
				if (!comp.powered) {
					comp.powered = true;
					newPower = true;
				}
			}
			return newPower;
		} else return false;
	};
}

export class Delay extends Component {
	state = false;

	constructor ({
		position = v2.zero,
		 rotation = 0
	}) {
		super(position, ct.delay, 2, rotation);
	}

	jsonify = () => {
		return {
			position: this.position.array,
			type: this.type,
			rotation: this.rotation.d
		};
	};

	tick = (at: atFunction) => {
		if (!this.powered) return false;
		if (this.state) {

			let newPower = false;
			for (let comp of at(this.position.clone.add(this.rotation.forwards))) {
				if (!comp.powered) {
					comp.powered = true;
					newPower = true;
				}
			}
			return newPower;

		}
		setTimeout(() => {
			this.state = true;
		}, 100);
		return false;
	};

	onclick = () => void 0;

	draw = (at: v2, props: any) => {
		rect (props.context, at,
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(248,179,179)' : 'rgb(210,210,210)'
		);
		rect (props.context, at.clone.add(this.rotation.forwards.mul(squareSize * props.zoom)),
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(248,179,179)' : 'rgb(210,210,210)'
		);

		circle (props.context, at.clone.add(squareSize * props.zoom/2),
			squareSize * props.zoom / 4,
			'rgba(217,104,25,0.86)'
		);
	}

	beforeTick = () => void 0;
	afterTick = () => {
		if (!this.powered) this.state = false;
		return false;
	};
}

export class Clock extends Component {
	lastPulse = performance.now();

	interval: number;

	constructor({
		position = v2.zero,
		interval = 100
	}) {
		super(position, ct.clock, 2, 0);
		this.interval = interval;
	}

	jsonify = () => {
		return {
			position: this.position.array,
			type: this.type,
			interval: this.interval
		};
	};

	tick = (at: atFunction) => {

		if (performance.now() - this.lastPulse < this.interval) return false;

		this.powered = true;
		let newPower = false;
		for (let comp of at(this.position)) {
			if (!comp.powered) {
				comp.powered = true;
				newPower = true;
			}
		}

		if (performance.now() - this.lastPulse > this.interval * 2) {
			this.lastPulse = performance.now();
		}

		return newPower;
	};

	onclick = () => {
		this.interval *= 2;
	}

	draw = (at: v2, props: any) => {
		rect (props.context, at,
			squareSize * props.zoom,
			squareSize * props.zoom,
			this.powered ? 'rgb(153,153,153)' : 'rgb(0,0,0)'
		);
	}

	beforeTick = () => void 0;
	afterTick = () => void 0;
}

export const componentTypeToClass: enumDict<componentTypes, any> = {
	[ct.wire]: Wire,
	[ct.power]: Power,
	[ct.light]: Light,
	[ct.switch]: Switch,
	[ct.not]: Not,
	[ct.delay]: Delay,
	[ct.clock]: Clock
}
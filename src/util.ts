import {squareSize} from "./game";
import v2 from './v2';

export function getZoomScaledPosition (pos: v2, zoom: number, center: v2) {
	// scales the position from the center
	return pos.clone
		.sub(center)
		.scale(zoom)
		.add(center);
}

export function screenSpaceToWorldSpace (point: v2, cameraPos: v2, width: number, height: number, zoom: number) {
	const center = new v2(width, height).scale(0.5);

	let p = getZoomScaledPosition(point, 1/zoom, center);
	p.add(cameraPos);
	p.sub(center);

	return p;
}

export function worldSpaceToScreenSpace (point: v2, cameraPos: v2, width: number, height: number, zoom: number) {
	const center = new v2(width, height).scale(0.5);

	cameraPos = cameraPos.clone
		.sub(center);

	const renderPos = point.clone.sub(cameraPos);

	return getZoomScaledPosition(renderPos, zoom, center);
}

export function getMousePos(canvas: HTMLCanvasElement, event: MouseEvent) {
	let rect = canvas.getBoundingClientRect();
	return new v2(
		event.pageX - rect.left,
		event.pageY - rect.top
	);
}

export function snapToGrid (n: number) {
	if (n > 0) return n - n % squareSize;
	else       return (n - n % squareSize) - squareSize;
}

export function mousePosInGrid (event: any, canvas: HTMLCanvasElement, camPos: v2, width: number, height: number, zoom: number) {
	const worldPos = screenSpaceToWorldSpace(
		getMousePos(canvas, event),
		camPos, width, height, zoom
	);
	return worldPos.apply(snapToGrid);
}

export function jsonifyObject (component: any) {
	let json: any = {};

	if (component instanceof v2) return component.array;

	for (const property in component) {

		let value = component[property];

		if (value instanceof v2)
			value = value.array;
		else if (typeof value === 'object') {
			if (Array.isArray(value)) {
				let arr = [];
				for (let item in value) {
					arr.push(jsonifyObject(value));
				}
				value = arr;
			} else {
				value = jsonifyObject(value);
			}
		}

		json[property] = value;
	}

	return json;
}

export type enumDict<T extends number, U> = { [K in T]: U };

export const red = 'rgb(255, 0, 0)';
export const green = 'rgb(0, 255, 0)';
export const blue = 'rgb(0, 0, 255)';

export class Direction {
	d: number;
	constructor (direction: number) {
		// bound it between 0 and 3
		while (direction < 0) direction += 4;
		while (direction > 3) direction -= 3;
		this.d = direction;
	}

	get forwards (): v2 {
		switch (this.d) {
			case 0:
				return new v2(0, -1);
			case 1:
				return new v2(1, 0);
			case 2:
				return new v2(0, 1);
			case 3:
				return new v2(-1, 0);
			default:
				return v2.zero;
		}
	}
}
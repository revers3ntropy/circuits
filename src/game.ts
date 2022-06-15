import v2 from './v2';

import { getContext, onMount } from 'svelte';
import { writable, derived } from 'svelte/store';
import type {Component} from "./components";

// Some props for the app
export const width = writable(window.innerWidth);
export const height = writable(window.innerHeight);
export const camPos = writable(v2.zero);
export const zoom = writable(1);
export const pixelRatio = writable(window.devicePixelRatio);
export const context = writable();
export const canvas = writable();
export const time = writable(0);
export const mousePos = writable(v2.zero);
export const mouseDown = writable(false);
export const dragging = writable(false);
export const selection = writable([]);
export const components = writable([]);
export const clickMode = writable('select');
export const placeType = writable(-1);
export const placeRotation = writable(-1);
export const clipboard = writable<any[]>([]);

let components_v: Component[] = [];
components.subscribe(v => components_v = v);

export type atFunction = (x: number | v2, y?: number) => Component[];
export const componentAt: atFunction =  (x, y) => {
	let components = [];
	if (x instanceof v2) {
		y = x.y;
		x = x.x;
	}

	for (let component of components_v) {
		if (component.position.x === x && component.position.y === y) {
			components.push(component);
		}
	}

	return components;
}

export const squareSize = 30;

// A more convenient store for grabbing all game props
export const props = deriveObject({
	context,
	canvas,
	width,
	height,
	pixelRatio,
	time,
	clickMode,
	mousePos,
	mouseDown,
	placeType,
	components,
	dragging,
	selection,
	camPos,
	zoom
});

export const key = Symbol();

export const getState = () => {
	const api = getContext<any>(key);
	return api.getState();
};

export const renderable = (render: (...args: any[]) => void) => {
	const api = getContext<any>(key);
	const element: any = {
		ready: false,
		mounted: false
	};
	if (typeof render === 'function') element.render = render;
	/*
	else if (render) {
		if (render.render) element.render = render.render;
		if (render.setup) element.setup = render.setup;
	}
	 */
	api.add(element);
	onMount(() => {
		element.mounted = true;
		element.ready = true;

		return () => {
			api.remove(element);
			element.mounted = false;
		};
	});
}

function deriveObject (obj: any) {
	const keys = Object.keys(obj);
	const list = keys.map(key => {
		return obj[key];
	});
	return derived(list, (array) => {
		return array.reduce((dict: any, value, i) => {
			dict[keys[i]] = value;
			return dict;
		}, {});
	});
}

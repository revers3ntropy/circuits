import { componentAt, components as components_ } from "./game";
import type { Component } from "./components";

let components: Component[] = [];
components_.subscribe(v => components = v);

export function updateComponents (components: Component[]) {
	// reset
	for (let component of components) {
		component.powered = false;
		component.beforeTick(componentAt);
	}

	function run () {
		let stack: Component[] = [...components];
		let popped: Component[] = [];
		let iterations = 0;

		while (stack.length > 0) {
			iterations++;
			if (iterations > 1000) break;

			if (stack[0].tick(componentAt)) {
				stack.push(...popped);
			}

			popped.push( <Component> stack.shift());
		}

		for (let component of components) {
			if (component.afterTick(componentAt)) {
				run();
			}
		}
	}

	run();
}

function loop () {

	updateComponents(components);

	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
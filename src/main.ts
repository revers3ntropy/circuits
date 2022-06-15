import './powerLoop';

import App from './App.svelte';
import { Component } from "./components";

function save (data: {components: Component[]}) {
	localStorage.setItem('circuitData', JSON.stringify(data));
}

function load () {
	let dataJSON: any = localStorage.getItem('circuitData');

	if (dataJSON == undefined) {
		dataJSON = {components: []};
		save(dataJSON);
	} else {
		dataJSON = JSON.parse(dataJSON);
	}

	if (!Array.isArray(dataJSON['components'])) {
		dataJSON['components'] = [];
	}
	const data: {
		components: Component[]
	} = {
		components: []
	};

	for (let squareJSON of dataJSON['components']) {
		data.components.push(Component.createFromJSON(squareJSON));
	}

	return data;
}

const app = new App({
	target: document.body,
	props: {
		save,
		load
	}
});

export default app;
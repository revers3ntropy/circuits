<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200&display=swap" rel="stylesheet">
	<meta name="description" content="Circuits game">
</svelte:head>

<script lang="ts">
	import v2 from './v2';

	import Canvas from "./Canvas.svelte";

	export let save;
	export let load;

	import {
		zoom,
		camPos,
		mousePos,
		canvas,
		mouseDown,
		dragging,
		selection,
		width,
		height,
		squareSize,
		components,
		clickMode,
		placeType,
		componentAt,
		clipboard, placeRotation
	} from './game';

	import Background from "./Background.svelte";
	import Grid from "./Grid.svelte";
	import FPS from "./FPS.svelte";
	import {getMousePos, mousePosInGrid, screenSpaceToWorldSpace, snapToGrid} from "./util";
	import Selection from "./Selection.svelte";
	import Component from "./Component.svelte";
	import InventoryMenu from "./InventoryMenu.svelte";
	import {Component as component, Wire} from './components';
	import CanvasCursor from "./CanvasCursor.svelte";
	import TopMenu from "./TopMenu.svelte";

	let zoom_v = 1;
	let mouseDown_v = false;
	let camPos_v = v2.zero;
	let dragging_v = false;
	let selection_v;
	let width_v = 10;
	let height_v = 10;
	let canvas_v;
	let clickMode_v = 'select';
	let placeType_v = -1;

	zoom.subscribe(val => zoom_v = val);
	camPos.subscribe(val => camPos_v.set(val));
	mouseDown.subscribe(val => mouseDown_v = val);
	dragging.subscribe(val => dragging_v = val);
	selection.subscribe(val => selection_v = val);
	width.subscribe(val => width_v = val);
	height.subscribe(val => height_v = val);
	placeType.subscribe(v => placeType_v = v);

	if (load)
		components.set(load()['components']);

	components.subscribe(v => {
		save({
			components: [...v.map(c => c.jsonify())]
		});
	});

	let dragStart = v2.zero;
	let selectStart = v2.zero;
	let currentWire;

	canvas.subscribe(c => canvas_v = c);
	clickMode.subscribe(c => clickMode_v = c);

	function deleteSelection () {
		components.update(components => {
			let newComponents = [];
			for (let component of components) {
				let shouldDelete = false
				for (let coords of selection_v) {
					if (coords.clone.div(squareSize).equals(component.position))
						shouldDelete = true;
				}
				if (!shouldDelete)
					newComponents.push(component);
			}
			selection.set([]);
			return newComponents;
		});
	}


	function copySelection () {
		if (selection_v.length === 0) {
			clipboard.set([]);
			return;
		}

		let upperRight = selection_v[0];

		for (const coords of selection_v) {
			if (coords.x < upperRight.x && coords.y < upperRight.y)
				upperRight = coords;
		}

		components.update(components => {

			for (let component of components) {
				let shouldCopy = false
				for (let coords of selection_v) {
					if (coords.clone.div(squareSize).equals(component.position))
						shouldCopy = true;
				}
				if (shouldCopy) {
					clipboard.update(v => {
						let json = component.jsonify();
						json.position[0] -= upperRight.x / squareSize;
						json.position[1] -= upperRight.y / squareSize;

						if (component instanceof Wire) {
							json.to[0] -= upperRight.x / squareSize;
							json.to[1] -= upperRight.y / squareSize;
						}

						v.push(json);
						return v;
					});
				}
			}

			return components;
		});
	}

	function pasteSelection () {
		let upperRight = selection_v[0];

		for (const coords of selection_v)
			if (coords.x < upperRight.x && coords.y < upperRight.y)
				upperRight = coords;

		upperRight.div(squareSize);

		for (let newComp of $clipboard) {
			components.update(v => {
				let newComponent = component.createFromJSON(newComp);
				newComponent.position.add(upperRight);

				if (newComponent instanceof Wire) {
					newComponent.to.add(upperRight);
				}

				v.push(newComponent);
				return v;
			});
		}

		selection.set([]);

	}

	function drag(event) {
		let dragEnd = getMousePos(canvas_v, event);
		const diff = dragEnd.clone.sub(dragStart);
		diff.scale(1 / zoom_v);
		camPos.update(p => p.clone.sub(diff))
		dragStart = dragEnd;
	}

	function select(event) {
		const startPosWorld = screenSpaceToWorldSpace(selectStart, camPos_v, width_v, height_v, zoom_v);
		const currentPosWorld = screenSpaceToWorldSpace(
				getMousePos(canvas_v, event),
				camPos_v, width_v, height_v, zoom_v
		);

		startPosWorld.apply(snapToGrid);
		currentPosWorld.apply(snapToGrid);

		selection_v = [startPosWorld.clone];

		let xLoop = cb => {
			for (let x = startPosWorld.x; x <= currentPosWorld.x; x += squareSize)
				cb(x);
		}

		if (startPosWorld.x > currentPosWorld.x) {
			xLoop = cb => {
				for (let x = startPosWorld.x; x >= currentPosWorld.x; x -= squareSize)
					cb(x);
			}
		}

		let yLoop = cb => {
			for (let y = startPosWorld.y; y <= currentPosWorld.y; y += squareSize)
				cb(y);
		}

		if (startPosWorld.y > currentPosWorld.y) {
			yLoop = cb => {
				for (let y = startPosWorld.y; y >= currentPosWorld.y; y -= squareSize)
					cb(y);
			}
		}

		xLoop(x => {
			yLoop(y => {
				selection_v.push(new v2(x, y));
			});
		});

		selection.set(selection_v);
	}

	const onmousemove = (event) => {
		mousePos.set(getMousePos(canvas_v, event));

		if (dragging_v) drag(event);
		switch (clickMode_v) {
			case 'select':
				if (mouseDown_v) select(event);
				break;

			case 'place-wire-2':
				if (!currentWire) break;

				const pos = mousePosInGrid(
						event, canvas_v,
						camPos_v, width_v, height_v, zoom_v
				);
				currentWire.to = pos.scale(1 / squareSize);
				break;

		}
	};

	const onmousedown = (event) => {
		const pos = getMousePos(canvas_v, event);
		mousePos.set(pos);
		if (event.button === 2) {
			dragging.set(true);
			dragStart = pos.clone;
		} else {
			mouseDown.set(true);
			selectStart = pos.clone;
			selection.set([]);
		}
	};

	const onmouseup = (event) => {
		mousePos.set(getMousePos(canvas_v, event));
		// reset both if mouse up

		switch (clickMode_v) {
			case 'select':
				if (mouseDown_v) select(event);
				break;

			case 'place-wire':
				components.update(val => {
					let pos = mousePosInGrid(
							event, canvas_v,
							camPos_v, width_v, height_v, zoom_v
					);

					pos.scale(1 / squareSize);

					currentWire = new Wire({
						position: pos.clone,
						to: pos.clone
					});

					val.push(currentWire);

					return val;
				});
				clickMode.set('place-wire-2');
				break;

			case 'place-wire-2':
				clickMode.set('select');
				components.update(v => v);
				break;

			case 'place':
				if (placeType_v < 0) {
					clickMode.set('select');
					break;
				}

				components.update(val => {
					let pos = mousePosInGrid(
							event, canvas_v,
							camPos_v, width_v, height_v, zoom_v
					);

					pos.scale(1 / squareSize);

					// @ts-ignore
					val.push(component.createFromJSON({
						type: placeType_v,
						position: pos.clone,
						rotation: $placeRotation
					}));

					return val;
				});
				clickMode.set('select');
				break;
		}

		dragging.set(false);
		mouseDown.set(false);
	};

	const onscroll = (event) => {
		mousePos.set(getMousePos(canvas_v, event));
		zoom_v *= 1 + (event.deltaY * -0.0001);
		zoom_v = Math.min(Math.max(5 * 10 ** -3, zoom_v), 5 * 10 ** 2);
		zoom.set(zoom_v)
	};

	const onkeydown = (event) => {

		if (event.ctrlKey || event.metaKey) {
			if (event.code === 'KeyC') {
				copySelection();
				event.preventDefault();
				return false;

			} else if (event.code === 'KeyV') {
				pasteSelection();
				event.preventDefault();
				return false;

			} else if (event.code === 'KeyX') {
				copySelection();
				deleteSelection();

				event.preventDefault();
				return false;
			}
		}

		switch (event.code) {
			case 'Backspace':
			case 'Delete':
				deleteSelection();
				break;

			case 'KeyR':
				placeRotation.update(r => {
					if (r === 3) return 0;
					else       return r + 1;
				});
		}
	}

	const onclick = (event) => {
		let pos = screenSpaceToWorldSpace(
				getMousePos(canvas_v, event),
				camPos_v, width_v, height_v, zoom_v
		);

		pos.apply(snapToGrid).scale(1 / squareSize);

		for (let comp of componentAt(pos)) {
			comp.onclick();
		}

		// save
		components.update(v => v);
	}


</script>

<svelte:window on:keydown={onkeydown} />

<main>
	<Canvas
		onmousemove={onmousemove}
		onscroll={onscroll}
		onclick={onclick}
		onmouseup={onmouseup}
		onmousedown={onmousedown}
	>
		<Background color='rgb(255, 255, 255)'/>
		<Grid colour='rgba(0, 0, 0, 0.1)' step={squareSize}/>
		{#each $components.sort((a, b) => b.order - a.order) as component}
			<Component instance={component}/>
		{/each}

		<Selection/>

		<!-- UI on canvas-->
		<FPS />
		<CanvasCursor/>
	</Canvas>
	<!-- UI -->
	<InventoryMenu/>
	<TopMenu/>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	* {
		font-family: 'Nunito', sans-serif;
	}
</style>
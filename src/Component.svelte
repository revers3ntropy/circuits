<script lang="ts">
    import v2 from './v2';
	import {camPos, renderable, squareSize, zoom} from './game';
	import {worldSpaceToScreenSpace} from "./util";
    import {Component} from "./components";

	export let instance: Component;

	let camPos_v = v2.zero;
	let zoom_v = 1;

	camPos.subscribe(val => camPos_v.set(val));
	zoom.subscribe(val => zoom_v = val);

	renderable(props => {
		const { width, height } = props;

		let pos = instance.position.clone.scale(squareSize);

		let renderPos = worldSpaceToScreenSpace(pos, camPos_v, width, height, zoom_v);

		instance.draw(renderPos, props);
	})

</script>
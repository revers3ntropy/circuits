<script lang="ts">
	import v2 from './v2';

	import { renderable, height, width, camPos, zoom } from './game';
	import {screenSpaceToWorldSpace, worldSpaceToScreenSpace} from "./util";
	import {circle, rect} from "./drawing";

	export let colour = 'black';
	export let pointSize = 1;
    export let step = 50;

    let camPos_value = v2.zero;
	let zoom_value = 1;
	let width_value = 10;
	let height_value = 10;
	let lineSize = 1;
	let centerR = 2;

	camPos.subscribe(val => camPos_value = val);
	zoom.subscribe(val => {
		zoom_value = val;
		lineSize = val;
		centerR = val * 2;
	});
	width.subscribe(val => width_value = val);
	height.subscribe(val => height_value = val);


	renderable(props => {
		const { context, width, height } = props;

		const camPos = camPos_value.clone;
		let min = screenSpaceToWorldSpace(
			v2.zero, camPos,
            width_value, height_value, zoom_value
        );
		let max = screenSpaceToWorldSpace(
			new v2(width_value, height_value),
            camPos, width_value, height_value, zoom_value
        );

		const roundTo = (x) => Math.ceil(x / step) * step;

		min.apply(roundTo);
		max.apply(roundTo);

		context.save();
		// horizontal
		for (let y = min.y; y < max.y; y += step) {
			const pos = worldSpaceToScreenSpace(new v2(0, y), camPos, width, height, zoom_value);
			pos.x = -1;
			pos.y -= lineSize / 2;
			rect(context, pos, width+2, lineSize, colour);
		}

		// vertical
		for (let x = min.x; x < max.x; x += step) {
			const pos = worldSpaceToScreenSpace(new v2(x, 0), camPos, width, height, zoom_value);
			pos.y = -1;
			pos.x -= lineSize / 2;
			rect(context, pos, lineSize, height+2, colour);
		}
        // center dot
		const pos = worldSpaceToScreenSpace(v2.zero, camPos, width, height, zoom_value);
		circle(context, pos, centerR, colour);

		context.restore();
	});
</script>

<!-- The following allows this component to nest children -->
<slot></slot>
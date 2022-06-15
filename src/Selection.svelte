<script lang="ts">
	import v2 from './v2';
	import {renderable, selection, squareSize, camPos, zoom} from './game';
	import {worldSpaceToScreenSpace} from "./util";
	import {rect} from "./drawing";

    let camPos_v = v2.zero;
	let zoom_v = 1;
	let lineSize = 1;
	let centerR = 2;
	let selection_v = [];

	camPos.subscribe(val => camPos_v = val);
	zoom.subscribe(val => {
		zoom_v = val;
		lineSize = val;
		centerR = val * 2;
	});
	selection.subscribe(val => selection_v = val);

	renderable(props => {
		const { context, width, height } = props;
        for (let selected of selection_v) {
        	const renderPos = worldSpaceToScreenSpace(selected, camPos_v, width, height, zoom_v);
            rect(context, renderPos, squareSize * zoom_v, squareSize * zoom_v, 'rgba(200,200,200, 0.3)');
        }

		context.restore();
	});
</script>

<!-- The following allows this component to nest children -->
<slot></slot>
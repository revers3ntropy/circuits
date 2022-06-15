<script lang="ts">
    import {placeRotation, renderable, squareSize} from "./game";
	import {screenSpaceToWorldSpace, snapToGrid, worldSpaceToScreenSpace} from "./util";
	import {circle} from "./drawing";
    import {componentTypeToClass} from "./components";

    renderable((props) => {
        let {context, clickMode, mousePos, placeType, zoom, height, width, camPos} = props;

    	let worldSpaceMousePos = screenSpaceToWorldSpace(mousePos, camPos, width, height, zoom);
    	let snappedWorldPos = worldSpaceMousePos.apply(snapToGrid);
    	let snappedScreenPos = worldSpaceToScreenSpace(snappedWorldPos, camPos, width, height, zoom);

    	if (clickMode === 'selection') return;
    	else if (clickMode === 'place-wire' || clickMode === 'place-wire-2') {
    		circle(context,
                snappedScreenPos.clone.add(squareSize * zoom/2),
                2, 'rgb(250,164,164)');

		} else if (clickMode === 'place') {
            if (placeType < 0) return;

            new componentTypeToClass[placeType]({
                rotation: $placeRotation
            }).draw(
                snappedScreenPos, props
            );
        }
    });
</script>
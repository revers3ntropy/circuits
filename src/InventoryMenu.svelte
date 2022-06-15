<script lang="ts">
    import {clickMode, placeType, selection} from "./game";
    import {ct} from "./components";
    import ComponentButton from "./ComponentButton.svelte";

    let clickMode_v = 'select';
    clickMode.subscribe(v => clickMode_v = v);

    function wireMouseDown() {
        selection.set([]);
        if (clickMode_v === 'select')
            clickMode.set('place-wire');
        else {
            clickMode.set('select');
        }
    }

    function place(type) {
        selection.set([]);
        clickMode.set('place');
        placeType.set(type);
    }

</script>

<main>
    <div id="bottom-menu">
        <ComponentButton onmousedown={wireMouseDown}
                         opacityLow={$clickMode==='place-wire'}>
            Wire
        </ComponentButton>

        <ComponentButton onmousedown={() => place(ct.light)}
                         opacityLow={$clickMode === 'place' && $placeType === ct.light}>
            LED
        </ComponentButton>

        <ComponentButton onmousedown={() => place(ct.power)}
                         opacityLow={$clickMode === 'place' && $placeType === ct.power}>
            Power
        </ComponentButton>

        <ComponentButton onmousedown={() => place(ct.switch)}
                         opacityLow={$clickMode === 'place' && $placeType === ct.switch}>
            Switch
        </ComponentButton>

        <ComponentButton onmousedown={() => place(ct.not)}
                         opacityLow={$clickMode === 'place' && $placeType === ct.not}>
            Not
        </ComponentButton>
        <ComponentButton onmousedown={() => place(ct.delay)}
                         opacityLow={$clickMode === 'place' && $placeType === ct.delay}>
            Delay
        </ComponentButton>
        <ComponentButton onmousedown={() => place(ct.clock)}
                         opacityLow={$clickMode === 'place' && $placeType === ct.clock}>
            Clock
        </ComponentButton>
    </div>
</main>

<style>
    main {
        position: fixed;
        bottom: 10px;
        z-index: 130;
        display: flex;
        justify-content: center;
        width: 100%;
    }

    #bottom-menu {
        display: flex;
        justify-content: center;
        width: 50vw;
        height: 80px;
    }

</style>
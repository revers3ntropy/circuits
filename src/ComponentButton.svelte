<script lang="ts">
    export let onmousedown;
	export let opacityLow = false;

</script>

<main class="menu-item" on:mousedown={onmousedown}
     style="opacity: {opacityLow? 0.5 : 1}">
    <slot></slot>
</main>

<style>
    main {
        aspect-ratio: 1/1;
        height: calc(100% - 10px);
        border-radius: 10px;
        backdrop-filter: blur(3px);
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 2px;
        user-select: none;
        border: 2px solid whitesmoke;
    }

    main:hover {
        background: whitesmoke;
        cursor: grab;
    }
</style>
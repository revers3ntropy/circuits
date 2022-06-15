<script lang="ts">
    import {Component, ct} from "./components";
    import {components as components_} from "./game";

    let components: Component[] = [];
    components_.subscribe(v => components = v);

    let wiresHidden = false;

    function setWiresOrder () {
    	for (let component of components) {
    	    if (component.type === ct.wire) {
    	        component.order = wiresHidden ? 0 : 3;
            }
        }

    	wiresHidden = !wiresHidden;

    	components_.update(v => v);
    }
</script>

<main>
    <button on:click={() => setWiresOrder()} id="show-hide-wires"> {wiresHidden ? 'Show' : 'Hide'} Wires </button>
</main>

<style>
    main {
        position: fixed;
        top: 10px;
        z-index: 130;
        display: flex;
        justify-content: center;
        width: 100%;
    }

    button {
        background: none;
        border-radius: 0;
        border: none;
        cursor: grabbing;
    }

    #show-hide-wires:hover {
        text-shadow: 1px 1px 2px #dcdcdc;
    }
</style>
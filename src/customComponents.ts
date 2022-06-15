import v2 from "./v2";
import {rect} from "./drawing";
import {atFunction, squareSize} from "./game";
import {Component, componentTypeToClass, ct} from "./components";

ct.custom = 4;

export class CustomComponentType {
    id: number;
    components: Component[];
    name: string;
    outputPos: v2;
    inputPos: v2;

    constructor (props: {
        id: number,
        components: Component[],
        name?: string,
        outputPos?: v2,
        inputPos?: v2,
    }) {
        this.id = props.id;
        this.components = props.components;
        this.name = props.name ?? 'CustomComponent';
        this.outputPos = props.outputPos ?? new v2(0, 10);
        this.inputPos = props.inputPos ?? new v2(0, 0);
    }

    static all: CustomComponentType[] = [];

    add (json: any) {
        CustomComponentType.all.push(new CustomComponentType(json));
    }
}

export class CustomComponent extends Component {
    typeID: number;

    constructor ({
        position = v2.zero,
        typeID = 0,
        rotation = 0
    }) {
        super(position, ct.not, 2, rotation);
        this.typeID = typeID;
    }

    public get source (): CustomComponentType {
        let comp = CustomComponentType.all.find(c => c.id === this.typeID);
        if (!comp) throw 'Cannot find source of CustomComponent with id ' + this.typeID;
        return comp;
    }

    jsonify = () => {
        return {
            position: this.position.array,
            typeID: this.typeID,
            rotation: this.rotation
        };
    };

    tick = () => false;

    onclick = () => void 0;

    draw = (at: v2, props: any) => {
        rect (props.context, at,
            squareSize * props.zoom * 2,
            squareSize * props.zoom,
            'rgb(205,185,59)'
        );
    }

    beforeTick = () => void 0;

    afterTick = (at: atFunction) => {

    };
}

componentTypeToClass[ct.custom] = CustomComponent;
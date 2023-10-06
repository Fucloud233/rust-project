import { Exclude, Expose } from "class-transformer";

export default class Dep {
    private crate: number;
    @Exclude()
    private _name: string;

    constructor(index: number, name: string) {
        this.crate = index;
        this._name = name;
    }

    get index(): number {
        return this.crate;
    }
    set index(index: number) {
        this.crate = index;
    }

    @Expose({name: "name"})
    get name(): string {
        return this._name;
    }
    set name(name: string) {
        this._name = name;
    }
}
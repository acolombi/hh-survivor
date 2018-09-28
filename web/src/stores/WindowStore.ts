import { observable } from "mobx";

export class WindowStore {
    @observable public isNarrow: boolean = windowIsNarrow();

    constructor() {
        window.addEventListener('resize', () => {
            this.isNarrow = windowIsNarrow();
        });
    }
}

function windowIsNarrow() {
    return window.innerWidth < 600;
}

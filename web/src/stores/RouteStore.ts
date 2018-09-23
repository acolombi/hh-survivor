import { observable } from "mobx";

export class RouteStore {
    @observable public path: string;

    public constructor() {
        this.path = window.location.pathname;

        window.onpopstate = () => {
            this.path = window.location.pathname;
        };
    }

    public push(to: string) {
        history.pushState({}, to, to);
        this.path = to;
    }
}

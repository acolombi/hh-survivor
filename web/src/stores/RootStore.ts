import { GamesStore } from "./GamesStore";

export class RootStore {
    public gamesStore: GamesStore;

    public constructor() {
        this.gamesStore = new GamesStore();
    }
}

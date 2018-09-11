import { GamesStore } from "./GamesStore";
import { PlayerStore } from "./PlayerStore";
import { RecordsStore } from "./RecordsStore";

export class RootStore {
    public gamesStore: GamesStore;
    public playerStore: PlayerStore;
    public recordsStore: RecordsStore;

    public constructor() {
        this.gamesStore = new GamesStore();
        this.playerStore = new PlayerStore();
        this.recordsStore = new RecordsStore();
    }
}

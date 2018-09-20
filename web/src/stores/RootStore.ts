import { GamesStore } from "./GamesStore";
import { PlayerStore } from "./PlayerStore";
import { RecordsStore } from "./RecordsStore";
import { CurrentWeekStore } from "./CurrentWeekStore";
import { ScoreboardStore } from "./ScoreboardStore";

export class RootStore {
    public gamesStore: GamesStore;
    public playerStore: PlayerStore;
    public recordsStore: RecordsStore;
    public currentWeekStore: CurrentWeekStore;
    public scoreboardStore: ScoreboardStore;

    public constructor() {
        this.gamesStore = new GamesStore();
        this.playerStore = new PlayerStore();
        this.recordsStore = new RecordsStore();
        this.currentWeekStore = new CurrentWeekStore();
        this.scoreboardStore = new ScoreboardStore();
    }
}

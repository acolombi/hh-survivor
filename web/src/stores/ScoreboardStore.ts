import axios from 'axios';
import { observable, flow } from "mobx";

export interface IPlayerScore {
    playerName: string;
    score: number;
}

export class ScoreboardStore {

    @observable public scoreboard: IPlayerScore[] = [];
    @observable public loading = true;

    constructor() {
        this.fetchScoreboard = this.fetchScoreboard.bind(this);
        this.fetchScoreboard();
        setInterval(this.fetchScoreboard, 60*60*1000);
    }

    public fetchScoreboard = flow(function* fetchScoreboard(this: ScoreboardStore) {
        const res = yield axios.get<IPlayerScore[]>("/api/scoreboard");
        this.scoreboard = res.data;
        this.loading = false;
    });
}

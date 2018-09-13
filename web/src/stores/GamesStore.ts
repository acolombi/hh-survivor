import axios from 'axios';
import { observable, flow } from 'mobx';


export interface IWeek {
    number: number;
    games: IGame[];
}

export interface IGame {
    id: string;
    week: number;
    home: string;
    homeScore: number;
    visitor: string;
    visitorScore: number;
    datetime: string;
    finished: boolean;
}

export class GamesStore {
    @observable public weeks: IWeek[];
    @observable public loading = true;

    constructor() {
        this.fetchGames = this.fetchGames.bind(this);
        this.fetchGames();
        setInterval(this.fetchGames, 60*60*1000);
    }

    public fetchGames = flow(function* fetchGames(this: GamesStore) {
        this.loading = true;
        const result = yield axios.get("/api/weeks");
        this.weeks = result.data;
        this.loading = false;
    });
}

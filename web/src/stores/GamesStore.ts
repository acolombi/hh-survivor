import axios from 'axios';
import { observable, flow } from 'mobx';


export interface IWeek {
    number: number;
    games: IGame[];
}

export interface IGame {
    home: string;
    homeScore: number;
    visitor: string;
    visitorScore: number;
    datetime: string;
}

export class GamesStore {
    @observable public weeks: IWeek[];

    public fetchGames = flow(function* fetchGames(this: GamesStore) {
        const result = yield axios.get("api/weeks");
        this.weeks = result.data;
    });
}

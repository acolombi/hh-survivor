import axios from 'axios';
import { observable, flow, action } from 'mobx';

export const UNKNOWN_PLAYER = "🐌";

export interface IPick {
    gameId: string;
    week: number;
    pick: string;
}

export class PlayerStore {
    @observable public id: string;
    @observable public name: string;
    @observable public picks: IPick[];
    @observable public loading = true;
    @observable public selectedWeek = 1;

    public fetchPlayer = flow(function* fetchPlayer(this: PlayerStore, playerid: string | undefined) {
        this.loading = true;
        const result = yield axios.get(`/api/player?id=${playerid}`);
        this.id = result.data.id;
        this.name = result.data.name;
        this.picks = result.data.picks;
        this.loading = false;
    });

    @action.bound
    public setWeek(week: number) {
        this.selectedWeek = week;
    }

    @action.bound
    public pickGame(week: number, gameId: string, pick: string) {
        const foundIdx = this.picks.findIndex(p => p.gameId === gameId);
        if (foundIdx > -1) {
            if (this.picks[foundIdx].pick === pick) {
                this.picks.splice(foundIdx, 1);
            } else {
                this.picks[foundIdx].pick = pick;
            }
        } else {
            this.picks.push({gameId, week, pick});
        }
    }
}

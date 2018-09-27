import axios from 'axios';
import { observable, flow, action, computed } from 'mobx';

export const UNKNOWN_PLAYER = "🐌";

export interface IPick {
    gameId: string;
    week: number;
    pick: string;
}

export class PlayerStore {
    @observable public id?: string;
    @observable public name?: string;
    @observable public picks: IPick[] = [];
    @observable public loadingPlayer = true;
    @observable public loadingSelectedWeek = true;
    @observable public selectedWeek = 1;
    @observable public isHistory = false;
    private pickNumber = 0;

    constructor() {
        return;
    }

    @computed public get loading() {
        return this.loadingPlayer || this.loadingSelectedWeek;
    }

    public fetchPlayer = flow(function* fetchPlayer(this: PlayerStore, playerid: string | undefined) {
        this.fetchSelectedWeek();

        this.isHistory = false;
        this.loadingPlayer = true;
        const result = yield axios.get(`/api/player?id=${playerid}`);
        this.id = result.data.id;
        this.name = result.data.name;
        this.picks = result.data.picks;
        this.loadingPlayer = false;
    });

    public fetchHistory = flow(function* fetchHistory(this: PlayerStore, historyId: string | undefined) {
        this.fetchSelectedWeek();

        this.isHistory = true;
        this.loadingPlayer = true;
        const result = yield axios.get(`/api/history?id=${historyId}`);
        this.id = result.data.id;
        this.name = result.data.name;
        this.picks = result.data.picks;
        this.loadingPlayer = false;
    });

    private fetchSelectedWeek = flow(function* fetchSelectedWeek(this: PlayerStore) {
        this.loadingSelectedWeek = true;
        const result = yield axios.get("/api/currentWeek");
        this.selectedWeek = result.data;
        this.loadingSelectedWeek = false;
    });


    @action.bound
    public setWeek(week: number) {
        this.selectedWeek = week;
    }

    @action.bound
    public pickGame(week: number, gameId: string, pick: string) {
        const id = this.id;
        if (id == null) {
            return;
        }
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

        axios.post(`/api/pick`, {pickNumber: this.pickNumber, playerId: id, week, gameId, pick});
        this.pickNumber += 1;
    }
}

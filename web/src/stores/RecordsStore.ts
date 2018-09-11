import axios from 'axios';
import { observable, flow } from "mobx";

export interface ITeamRecord {
    team: string;
    wins: number;
    losses: number;
    ties: number;
}

export class RecordsStore {

    @observable.shallow public records = new Map<string, ITeamRecord>();
    @observable public loading = true;

    constructor() {
        this.fetchRecords = this.fetchRecords.bind(this);
        this.fetchRecords();
        setInterval(this.fetchRecords, 60*60*1000);
    }

    public fetchRecords = flow(function* fetchRecords(this: RecordsStore) {
        this.loading = true;
        const records = yield axios.get("/api/records");
        for(const record of records.data) {
            this.records.set(record.team, record);
        }
        this.loading = false;
    });
}

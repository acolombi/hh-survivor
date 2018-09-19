import axios from 'axios';
import { observable, flow } from "mobx";

export class CurrentWeekStore {
    @observable public currentWeek: number;
    @observable public loading = true;

    constructor() {
        this.fetchCurrentWeek = this.fetchCurrentWeek.bind(this);
        this.fetchCurrentWeek();
        setInterval(this.fetchCurrentWeek, 60*60*1000);
    }

    public fetchCurrentWeek = flow(function* fetchCurrentWeek(this: CurrentWeekStore) {
        this.loading = true;
        const result = yield axios.get("/api/currentWeek");
        this.currentWeek = result.data;
        this.loading = false;
    });
}

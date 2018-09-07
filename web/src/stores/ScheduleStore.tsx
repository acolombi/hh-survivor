import { observable, flow } from 'mobx';

interface IWeek {
    number: number;
    games: IGame[];
}

interface IGame {
    home: string;
    away: string;
    datetime: string;
}

export class ScheduleStore {
    @observable public weeklySchedule: IWeek[];

    public fetchSchedule = flow(function* fetchSchedule() {

    });
}

import { ScheduleStore } from "./ScheduleStore";

export class RootStore {
    public scheduleStore: ScheduleStore;

    public constructor() {
        this.scheduleStore = new ScheduleStore();
    }
}

import * as React from 'react';
import { RootStore } from '../stores/RootStore';
import { observer } from 'mobx-react';
import { IWeek, IGame } from '../stores/GamesStore';
import { Card } from '@blueprintjs/core';
import { locations, names, img70s } from '../Utils';


interface IProps {
    playerid?: string;
    rootStore: RootStore;
}

@observer export class Picks extends React.Component<IProps, {}> {

    public constructor(props: IProps) {
        super(props);
        this.renderWeekBadge = this.renderWeekBadge.bind(this);
        this.handleSelectWeek = this.handleSelectWeek.bind(this);
    }

    public componentDidMount() {
        this.props.rootStore.playerStore.fetchPlayer(this.props.playerid);
    }

    public render() {
        if (this.props.rootStore.playerStore.loading || !this.props.rootStore.gamesStore.weeks) {
            return <div>Loading</div>;
        }

        return (
            <div>
                <h2>
                    {this.props.rootStore.playerStore.name}'s Picks
                </h2>
                {this.renderWeeks()}
                {this.renderGamesPicker()}
            </div>
        );
    }

    private renderWeeks() {
        return (
            <div className="picks-week-badges">
                {this.props.rootStore.gamesStore.weeks.map(this.renderWeekBadge)}
            </div>
        );
    }

    private renderGamesPicker() {
        const games = this.props.rootStore.gamesStore.weeks[this.props.rootStore.playerStore.selectedWeek-1].games;
        return (
            <div className="games-pickers">
                {games.map((game) => this.renderGame(game))}
            </div>
        );
    }

    private renderGame(game: IGame) {
        return (
            <div key={game.id} className="game-picker">
                {this.renderTeamCard(game.visitor, true)}
                {this.renderGameDivider(game)}
                {this.renderTeamCard(game.home, false)}
            </div>
        );
    }

    private renderGameDivider(game: IGame) {
        if (game.finished) {
            const scoreLine = (
                <div>
                    <span className={game.visitorScore >= game.homeScore ? "winner" : ""}>{game.visitorScore} </span>
                    -
                    <span className={game.visitorScore <= game.homeScore ? "winner" : ""}> {game.homeScore}</span>
                </div>
            );
            return (
                <div className="picker-divider">
                    {scoreLine}
                    <div className="final-text">Final</div>
                </div>
            );
        } else {
            return (
                <div className="picker-divider">
                    <div>@</div>
                    <div>{game.datetime}</div>
                </div>
            );
        }
    }

    private renderTeamCard(team: string, visitor: boolean) {
        const classes = "card" + (visitor ? " visitor-card" : "");
        const img = <div><img src={img70s[team]} width="48" height="48" /></div>;
        const textClasses = "card-text" + (visitor ? " push-right" : "");
        const record = this.props.rootStore.recordsStore.records.get(team);
        const recordText = record && !this.props.rootStore.recordsStore.loading
            ? `${record.wins}-${record.losses}` + (record.ties ? `-${record.ties}` : "")
            : "loading";
        return (
            <Card interactive={true} className={classes}>
                {!visitor && img}
                <div className={textClasses}>
                    <div>{locations[team]}</div>
                    <div>{names[team]} | {recordText}</div>
                </div>
                {visitor && img}
            </Card>
        );

    }

    private renderWeekBadge(week: IWeek) {
        const weekPicks = this.props.rootStore.playerStore.picks.filter(p => p.week === week.number).length;
        const badgeClasses = "badge"
            + (this.props.rootStore.playerStore.selectedWeek === week.number ? " current-week" : "");
        const picksLabel = weekPicks > 0
            ? <div className="picks-label">{weekPicks} picks</div>
            : <div className="picks-label no-picks">no picks</div>;
        return (
            <div key={week.number} className={badgeClasses} onClick={() => this.handleSelectWeek(week.number)}>
                <div className="week-label">{week.number}</div>
                {picksLabel}
            </div>
        );
    }

    private handleSelectWeek(weekNumber: number) {
        this.props.rootStore.playerStore.setWeek(weekNumber);
    }
}

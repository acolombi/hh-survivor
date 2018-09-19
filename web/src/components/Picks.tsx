import * as React from 'react';
import { RootStore } from '../stores/RootStore';
import { observer } from 'mobx-react';
import { IWeek, IGame } from '../stores/GamesStore';
import { Card, Icon } from '@blueprintjs/core';
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
        const relevantPick = this.props.rootStore.playerStore.picks.find(p => p.gameId === game.id) || {gameId: game.id, pick: ""};
        const visitorPickHandler = () => this.props.rootStore.playerStore.pickGame(game.week, game.id, game.visitor);
        const homePickHandler = () => this.props.rootStore.playerStore.pickGame(game.week, game.id, game.home);
        return (
            <div key={game.id} className="game-picker">
                {this.renderTeamCard(game.visitor, game.week, game.visitorScore > game.homeScore, true, relevantPick.pick === game.visitor, visitorPickHandler)}
                {this.renderGameDivider(game)}
                {this.renderTeamCard(game.home, game.week, game.visitorScore < game.homeScore, false, relevantPick.pick === game.home, homePickHandler)}
            </div>
        );
    }

    private renderGameDivider(game: IGame) {
        if (game.finished) {
            const scoreLine = (
                <div>
                    <span className={game.visitorScore > game.homeScore ? "winner" : ""}>{game.visitorScore} </span>
                    -
                    <span className={game.visitorScore < game.homeScore ? "winner" : ""}> {game.homeScore}</span>
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

    private renderTeamCard(team: string, week: number, winner: boolean, visitor: boolean, playerPick: boolean, clickHandler: () => void) {
        const classes = "card" + (visitor ? " visitor-card" : "");
        const img = <div><img src={img70s[team]} width="48" height="48" /></div>;
        const textClasses = "card-text" + (visitor ? " push-right" : "");
        const record = this.props.rootStore.recordsStore.records.get(team);
        const recordText = record && !this.props.rootStore.recordsStore.loading
            ? `${record.wins}-${record.losses}` + (record.ties ? `-${record.ties}` : "")
            : "loading";
        const pickedClass = playerPick ? "picked" : "";
        const lockedIn = week < this.props.rootStore.currentWeekStore.currentWeek;
        const winLoseClass = lockedIn
            ? (winner ? "winner" : "loser")
            : "";

        const pickText = playerPick
            ? (winLoseClass ? (winner ? "Winner" : "Loser") : "Picked")
            : "Pick";
        const interactive = !lockedIn;
        const maybeClickHandler = !lockedIn ? clickHandler : undefined;
        return (
            <Card interactive={interactive} className={`${classes} ${pickedClass} ${winLoseClass}`} onClick={maybeClickHandler}>
                {img}
                <div className={textClasses}>
                    <div>{locations[team]}</div>
                    <div>{names[team]} | {recordText}</div>
                </div>
                <div className="pick-container">
                    <div className={`pick-circle ${pickedClass}`}>
                        {playerPick && <Icon icon={lockedIn && !winner ? "cross" : "tick"}/>}
                    </div>
                    <div className={`pick-text ${pickedClass}`}>{pickText}</div>
                </div>
            </Card>
        );

    }

    private renderWeekBadge(week: IWeek) {
        const weekPicks = this.props.rootStore.playerStore.picks.filter(p => p.week === week.number).length;
        const badgeClasses = "badge"
            + (this.props.rootStore.playerStore.selectedWeek === week.number ? " current-week" : "");
        const label = week.number >= this.props.rootStore.currentWeekStore.currentWeek
            ? (weekPicks > 0 ? <div className="picks-label">{weekPicks} picks</div> : <div className="picks-label no-picks">no picks</div>)
            : <div className="picks-label">{this.computeWeeksPoints(week.number)} points</div>;
        return (
            <div key={week.number} className={badgeClasses} onClick={() => this.handleSelectWeek(week.number)}>
                <div className="week-label">{week.number}</div>
                {label}
            </div>
        );
    }

    private computeWeeksPoints(weekNumber: number) {
        const games = this.props.rootStore.gamesStore.weeks[weekNumber - 1].games;
        const playerPicks = this.props.rootStore.playerStore.picks.filter(p => p.week === weekNumber);

        for (const pick of playerPicks) {
            const game = games.find(g => g.id === pick.gameId);
            if (game) {
                const badPick = (game.visitorScore <= game.homeScore && pick.pick === game.visitor)
                    || (game.homeScore <= game.visitorScore && pick.pick === game.home);
                if (badPick) {
                    return 0;
                }
            }
        }

        return playerPicks.length;
    }

    private handleSelectWeek(weekNumber: number) {
        this.props.rootStore.playerStore.setWeek(weekNumber);
    }
}

import * as React from 'react';
import { RootStore } from '../stores/RootStore';
import { observer } from 'mobx-react';
import { IWeek, IGame } from '../stores/GamesStore';
import { Card, Icon } from '@blueprintjs/core';
import { locations, names, img70s } from '../Utils';
import { UNKNOWN_PLAYER } from '../stores/PlayerStore';
import * as moment from 'moment';


interface IProps {
    playerid?: string;
    historyId?: string;
    rootStore: RootStore;
}

@observer export class Picks extends React.Component<IProps, {}> {

    public constructor(props: IProps) {
        super(props);
        this.renderWeekBadge = this.renderWeekBadge.bind(this);
        this.handleSelectWeek = this.handleSelectWeek.bind(this);
    }

    public componentDidMount() {
        if (this.props.historyId == null) {
            this.props.rootStore.playerStore.fetchPlayer(this.props.playerid);
        } else {
            this.props.rootStore.playerStore.fetchHistory(this.props.historyId);
        }
    }

    public render() {
        if (this.props.rootStore.playerStore.loading || !this.props.rootStore.gamesStore.weeks) {
            return <div>Loading</div>;
        }
        if ((this.props.rootStore.playerStore.id == null || this.props.rootStore.playerStore.id === UNKNOWN_PLAYER)
            && this.props.historyId == null) {
            return <div>Doesn't look like you're logged in. Maybe try clicking the invite link again to save a new login cookie.</div>;
        }

        return (
            <div>
                <h2>
                    {this.props.rootStore.playerStore.name}'s {this.props.rootStore.playerStore.isHistory && "Historical"} Picks
                </h2>
                {this.renderWeeks()}
                {this.renderGamesPicker()}
            </div>
        );
    }

    private renderWeeks() {
        return (
            <div className="picks-week-badges">
                {this.props.rootStore.gamesStore.weeks
                    .filter(w => w.number <= this.props.rootStore.currentWeekStore.currentWeek || !this.props.rootStore.playerStore.isHistory)
                    .map(this.renderWeekBadge)}
            </div>
        );
    }

    private renderGamesPicker() {
        const games = this.props.rootStore.gamesStore.weeks[this.props.rootStore.playerStore.selectedWeek-1].games;
        const gamePanels = games.map((game) => this.renderGame(game)).filter(gp => gp != null);
        const content = gamePanels.length > 0
            ? gamePanels
            : <div>No picks visible for this week. Check back later!</div>;
        return (
            <div className="games-pickers">
                {content}
            </div>
        );
    }

    private renderGame(game: IGame) {
        const relevantPick = this.props.rootStore.playerStore.picks.find(p => p.gameId === game.id) || {gameId: game.id, pick: ""};
        const visitorPickHandler = !this.props.rootStore.playerStore.isHistory
            ? () => this.props.rootStore.playerStore.pickGame(game.week, game.id, game.visitor)
            : undefined;
        const homePickHandler = !this.props.rootStore.playerStore.isHistory
            ? () => this.props.rootStore.playerStore.pickGame(game.week, game.id, game.home)
            : undefined;
        const narrowHeader = this.props.rootStore.windowStore.isNarrow
            ? <div className="narrow-header">
                <div className="bold-text">{locations[game.visitor]} @ {locations[game.home]}</div>
                <div>{game.finished ? scoreLine(game) : game.dayTimeString}</div>
              </div>
            : null;
        const gameDatetime = moment(game.datetime * 1000);
        if (this.props.rootStore.playerStore.isHistory && relevantPick.pick !== game.visitor && relevantPick.pick !== game.home) {
            return null;
        } else {
            return (
                <div key={game.id} className="game-picker">
                    {narrowHeader}
                    <div key={game.id} className="game-picker-row">
                        {this.renderTeamCard(game.visitor, gameDatetime, game.visitorScore > game.homeScore, game.finished, true, relevantPick.pick === game.visitor, visitorPickHandler)}
                        {this.renderGameDivider(game)}
                        {this.renderTeamCard(game.home, gameDatetime, game.visitorScore < game.homeScore, game.finished, false, relevantPick.pick === game.home, homePickHandler)}
                    </div>
                </div>
            );
        }
    }

    private renderGameDivider(game: IGame) {
        if (this.props.rootStore.windowStore.isNarrow) {
            return <div className="picker-divider">@</div>;
        }

        if (game.finished) {
            return (
                <div className="picker-divider">
                    {scoreLine(game)}
                    <div className="final-text">Final</div>
                </div>
            );
        } else {
            return (
                <div className="picker-divider">
                    <div>@</div>
                    <div>{game.dayTimeString}</div>
                </div>
            );
        }
    }

    private renderTeamCard(team: string, gameDatetime: moment.Moment, winner: boolean, finished: boolean, visitor: boolean, playerPick: boolean, clickHandler?: () => void) {
        const isNarrow = this.props.rootStore.windowStore.isNarrow;
        const classes = "card" + (visitor ? " visitor-card" : "");
        const img = <div><img src={img70s[team]} width="48" height="48" /></div>;
        const textClasses = "card-text" + (visitor ? " push-right" : "");
        const record = this.props.rootStore.recordsStore.records.get(team);
        const recordText = record && !this.props.rootStore.recordsStore.loading
            ? `${record.wins}-${record.losses}` + (record.ties ? `-${record.ties}` : "")
            : "loading";
        const pickedClass = playerPick ? "picked" : "";
        const lockedIn = moment() >= gameDatetime;
        const winLoseClass = lockedIn && finished
            ? (winner ? "winner" : "loser")
            : "";

        const pickText = playerPick
            ? (winLoseClass ? (winner ? "Winner" : "Loser") : "Picked")
            : "Pick";
        const interactive = !lockedIn && clickHandler != null;
        const maybeClickHandler = !lockedIn ? clickHandler : undefined;
        const pickContainer = playerPick || (!lockedIn && clickHandler)
            ? <div className="pick-container">
                <div className={`pick-circle ${pickedClass}`}>
                    {playerPick && <Icon iconSize={isNarrow ? 12 : 16} icon={finished && lockedIn && !winner ? "cross" : "tick"}/>}
                </div>
                <div className={`pick-text ${pickedClass}`}>{pickText}</div>
              </div>
            : null;
        return (
            <Card interactive={interactive} className={`${classes} ${pickedClass} ${winLoseClass}`} onClick={maybeClickHandler}>
                {img}
                <div className={textClasses}>
                    {!isNarrow && <div className="bold-text">{locations[team]}</div>}
                    {!isNarrow && <div>{names[team]} | {recordText}</div>}
                    {isNarrow && <div className="bold-text">{names[team]}</div>}
                    {isNarrow && <div>{recordText}</div>}
                </div>
                {pickContainer}
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

function scoreLine(game: IGame) {
    return (
        <div>
            <span className={game.visitorScore > game.homeScore ? "winner" : ""}>{game.visitorScore} </span>
            -
            <span className={game.visitorScore < game.homeScore ? "winner" : ""}> {game.homeScore}</span>
        </div>
    );
}

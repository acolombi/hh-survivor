import * as React from 'react';
import { RootStore } from '../stores/RootStore';
import { observer } from 'mobx-react';
import { IPlayerScore } from '../stores/ScoreboardStore';

interface IProps {
    rootStore: RootStore;
}

@observer export class Scoreboard extends React.Component<IProps, {}> {

    public render() {
        const scoreboardStore = this.props.rootStore.scoreboardStore;
        if (scoreboardStore.loading) {
            return <div>Loading</div>;
        }
        return (
            <table className="scoreboard">
                <thead>
                    <tr><th>Player</th><th>Score</th></tr>
                </thead>
                <tbody>
                    {scoreboardStore.scoreboard.slice().sort((a, b) => b.score < a.score ? -1 : 1).map(renderPlayerScore)}
                </tbody>
            </table>
        );
    }
}

function renderPlayerScore(ps: IPlayerScore, idx: number) {
    return (
        <tr key={idx}>
            <td>{ps.playerName}</td><td>{ps.score}</td>
        </tr>
    );
}

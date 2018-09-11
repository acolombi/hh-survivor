import * as React from 'react';
import './App.css';
import { RootStore } from './stores/RootStore';
import { observer } from 'mobx-react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import { Picks } from './components/Picks';
import * as Cookies from 'js-cookie';

const rootStore = new RootStore();

@observer class App extends React.Component {
    public render() {
        return (
            <div className="App">
                <Router>
                    <div>
                        <div className="title-bar"><h1>HH Football</h1></div>
                        <div className="nav-bar">
                            <div>
                                <Link to="/picks">Picks</Link>
                            </div>
                            <div>
                                <Link to="/scores">Scoreboard</Link>
                            </div>
                        </div>

                        <Route path="/picks/:playerid?" component={renderPicks} />
                        <Route path="/scores" component={renderScores} />
                    </div>
                </Router>
            </div>
        );
    }
}

function renderPicks({match}: {match: any}) {
    const urlPlayerid = match.params.playerid;
    let playerid: string | undefined;
    if (urlPlayerid) {
        Cookies.set("playerid", urlPlayerid);
        playerid = urlPlayerid;
    } else {
        playerid = Cookies.get("playerid");
    }
    return <Picks playerid={playerid} rootStore={rootStore} />;
}

function renderScores({match}: {match: any}) {
    return <div>Scores</div>;
}

export default App;

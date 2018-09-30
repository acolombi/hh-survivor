import * as React from 'react';
import './App.css';
import { RootStore } from './stores/RootStore';
import { observer } from 'mobx-react';
import { Picks } from './components/Picks';
import * as Cookies from 'js-cookie';
import { Scoreboard } from './components/Scoreboard';
import { MyLink } from './components/MyLink';
import { MyRoute } from './MyRoute';


const rootStore = new RootStore();
if (window.location.pathname === "/") {
    rootStore.routeStore.push("/picks");
}

@observer class App extends React.Component {
    public render() {
        const picksClasses = rootStore.routeStore.path.startsWith("/picks") ? "selected-link" : "";
        const scoresClasses = rootStore.routeStore.path.startsWith("/scores") || rootStore.routeStore.path.startsWith("/history")
            ? "selected-link" : "";
        return (
            <div className="App">
                <div className="title-bar"><h1>HH Football</h1></div>
                <div className="nav-bar">
                    <div>
                        <MyLink to="/picks" className={picksClasses} routeStore={rootStore.routeStore}>Picks</MyLink>
                    </div>
                    <div>
                        <MyLink to="/scores" className={scoresClasses} routeStore={rootStore.routeStore}>Scoreboard</MyLink>
                    </div>
                </div>

                <MyRoute path="/picks/:playerid?" component={renderPicks} />
                <MyRoute path="/scores" component={renderScores} />
                <MyRoute path="/history/:historyId?" component={renderHistory} />
            </div>
        );
    }
}

function renderPicks(params: any) {
    const urlPlayerid = params.playerid;
    let playerid: string | undefined;
    if (urlPlayerid) {
        Cookies.set("playerid", urlPlayerid);
        playerid = urlPlayerid;
    } else {
        playerid = Cookies.get("playerid");
    }
    return <Picks playerid={playerid} rootStore={rootStore} />;
}

function renderHistory(params: any) {
    return <Picks historyId={params.historyId} rootStore={rootStore} />;
}

function renderScores() {
    return <Scoreboard rootStore={rootStore} />;
}

export default App;

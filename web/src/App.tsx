import * as React from 'react';
import './App.css';

import logo from './logo.svg';
import { RootStore } from './stores/RootStore';
import { observer } from 'mobx-react';

const rootStore = new RootStore();
rootStore.gamesStore.fetchGames();
setInterval(() => rootStore.gamesStore.fetchGames(), 60000);

@observer class App extends React.Component {
    public render() {


        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.tsx</code> and save to reload.
                </p>
            </div>
        );
    }
}

export default App;

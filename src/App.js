import * as React from 'react';
import TodoBoard from './components/TodoBoard';
import './App.css';


class App extends React.PureComponent {
    render() {
        return (
            <div className="App">
                <TodoBoard />
            </div>
        );
    }
}

export default App

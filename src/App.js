import React, {Component} from 'react';
import TodoBoard from './components/TodoBoard';
import './App.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <TodoBoard />
            </div>
        );
    }
}

export default App

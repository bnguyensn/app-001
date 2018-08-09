import * as React from 'react';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';

import getTodos from '../utils/getTodos';

function EmptyBoard() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

export default class TodoBoard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            todos: [],
        };
    }

    async componentDidMount() {
        const userData = await getTodos();
        console.log(userData);
        this.setState({
            username: userData.username,
            todos: userData.todos,  // todos is an array of objects
        });
    }

    render() {
        const {username, todos} = this.state;
        const todoCards = todos.length > 0
            ? todos.map(todo => <TodoCard key={todo.id} todo={todo} />)
            : [];

        return (
            <div className="todo-board-container">
                <div className="todo-board-title">{username}</div>
                <TodoCreateNew />
                <div className="todo-cards-container">
                    {todoCards.length > 0
                        ? todoCards
                        : <EmptyBoard />
                    }
                </div>
            </div>
        )
    }
}

import * as React from 'react';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';
import './css/todo-components.css';

import getTodos from '../utils/getTodos';

function EmptyBoard() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

export default class TodoBoard extends React.PureComponent {
    async componentDidMount() {
        const userData = await getTodos();
        this.username = userData.username;
        this.todos = userData.todos;
        this.forceUpdate();
    }

    render() {
        const todoEntries = this.todos !== undefined ? Object.entries(this.todos) : [];

        const todoCards = todoEntries.length > 0
            ? todoEntries.map((todoEntry) => {
                const entryId = todoEntry[0];
                const entryData = todoEntry[1];

                return <TodoCard key={entryId} todoId={entryId} todo={entryData} />
            })
            : [];

        return (
            <div className="todo-board-container">
                <div className="todo-board-title">{`${this.username}'s to-do tracker`}</div>
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

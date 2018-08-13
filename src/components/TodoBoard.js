import * as React from 'react';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';
import './css/todo-components.css';
import initData from '../api/localStorage/init';
import {readUsername, readTodos} from '../api/localStorage/read';

function EmptyBoard() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

export default class TodoBoard extends React.PureComponent {
    async componentDidMount() {
        await initData();
        this.username = readUsername();
        this.todos = readTodos();
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

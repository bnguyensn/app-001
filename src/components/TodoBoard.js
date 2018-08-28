// @flow

import * as React from 'react';
import {getAllTodoKeys} from '../api/indexedDB/readIDB';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';
import './css/todo-components.css';

function EmptyBoard() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

function LogMessage(props: {msg: string}) {
    const {msg} = props;
    return (
        <div className="todo-board-log">{msg}</div>
    )
}

type TodoBoardStates = {
    logMsgs: string[],
    tdKeys: string[],
};

export default class TodoBoard extends React.PureComponent<{}, TodoBoardStates> {
    constructor(props: {}) {
        super(props);
        this.state = {
            logMsgs: [],
            tdKeys: [],
        };
    }

    async componentDidMount() {
        try {
            const tdKeys = await getAllTodoKeys();

            // Render INITIAL tdKeys data. Each tdCard will then request data
            // on their own.
            this.setState({
                tdKeys,
            });
        } catch (e) {
            this.logNewMsg(e);
        }
    }

    logNewMsg = (msg: string) => {
        this.setState(prevState => ({
            logMsgs: [...prevState.logMsgs, msg],
        }));
    };

    render() {
        const {logMsgs, tdKeys} = this.state;

        const logMsgEls = logMsgs.map(logMsg => <LogMessage msg={logMsg} />);
        const tdCards = tdKeys.map(tdKey => <TodoCard key={tdKey} tdKey={tdKey} logNewMsg={this.logNewMsg} />);

        return (
            <div className="todo-board">
                <section className="todo-board-top-control">
                    <div id="todo-board-logs">
                        {logMsgEls}
                    </div>
                    <div className="todo-board-title">To-do tracker</div>
                    <TodoCreateNew logNewMsg={this.logNewMsg} />
                </section>
                <section className="todo-cards">
                    {tdCards.length > 0 ? tdCards : <EmptyBoard />}
                </section>
            </div>
        )
    }
}

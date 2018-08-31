// @flow

import * as React from 'react';
import {getAllTodoKeys} from '../api/indexedDB/readIDB';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';
import './css/todo-components.css';
import {elHasClass, elChildOfClass} from '../utils/classes';

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
    logMsgData: {},  // Structure: {logMsgKey: msg: x, ...}
    logMsgKeys: number[],  // Need this to display logMsgData in chronological order
    tdKeys: string[],
    todoCreateNewKey: boolean,
};

export default class TodoBoard extends React.PureComponent<{}, TodoBoardStates> {
    logMsgKeysCount: number;

    constructor(props: {}) {
        super(props);
        this.logMsgKeysCount = 0;
        this.state = {
            logMsgData: {},
            logMsgKeys: [],
            tdKeys: [],
            todoCreateNewKey: false,  // Used to reset <TodoCreateNew />
        };
    }

    async componentDidMount() {
        const res = await this.syncWithDb();
        this.logNewMsg(res);
    }

    componentDidUpdate() {
        // Scroll to the bottom of the logs
        const logsEl = document.getElementById('todo-board-logs');
        if (logsEl) {
            logsEl.scrollTop = logsEl.scrollHeight;
        }
    }

    syncWithDb = async () => {
        try {
            const tdKeys = await getAllTodoKeys();
            this.setState({
                tdKeys,
            });
            return 'TodoBoard synchronised with database.'
        } catch (e) {
            return e
        }
    };

    logNewMsg = (msg: string | Error) => {
        if (msg) {
            const {logMsgData} = this.state;
            const newLogMsgKey = this.logMsgKeysCount;
            this.logMsgKeysCount += 1;

            const newLogMsg = msg instanceof Error
                ? `> ${msg.name}: ${msg.message}`
                : `> ${msg}`;

            const newLogMsgData = Object.assign({}, logMsgData);
            newLogMsgData[newLogMsgKey] = newLogMsg;

            this.setState(prevState => ({
                logMsgData: newLogMsgData,
                logMsgKeys: [...prevState.logMsgKeys, newLogMsgKey],
            }));
        }
    };

    handleBoardClick = (e: SyntheticMouseEvent<HTMLDivElement>) => {
        const clickedEl = e.target;  // Flow type casting
        if (!elHasClass(clickedEl, 'todo-create-new') && !elChildOfClass(clickedEl, 'todo-create-new')) {
            // If user clicks outside of <TodoCreateNew />, reset the component and save new data
            this.setState(prevState => ({
                todoCreateNewKey: !prevState.todoCreateNewKey,
            }));
        }
    };

    render() {
        const {logMsgData, logMsgKeys, tdKeys, todoCreateNewKey} = this.state;

        const logMsgEls = logMsgKeys.map(logMsgKey => (
            <LogMessage key={logMsgKey} msg={logMsgData[logMsgKey]} />
        ));
        const tdCards = tdKeys.map(tdKey => (
            <TodoCard key={tdKey} tdKey={tdKey} logNewMsg={this.logNewMsg} />
        ));

        return (
            <div className="todo-board"
                 onClick={this.handleBoardClick}
                 role="presentation">
                <section className="todo-board-top-control">
                    <div id="todo-board-logs">
                        {logMsgEls}
                    </div>
                    <div className="todo-board-title">To-do tracker</div>
                    <TodoCreateNew key={todoCreateNewKey.toString()} logger={this.logNewMsg} dbSync={this.syncWithDb} />
                </section>
                <section className="todo-cards">
                    {tdCards.length > 0 ? tdCards : <EmptyBoard />}
                </section>
            </div>
        )
    }
}

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
    logMsgData: {},
    tdKeys: string[],
    todoCreateNewKey: boolean,
};

export default class TodoBoard extends React.PureComponent<{}, TodoBoardStates> {
    logMsgKeysCount: number;

    constructor(props: {}) {
        super(props);
        this.logMsgKeysCount = 0;
        this.state = {
            logMsgData: {},  // Structure: {logMsgKey: msg: x, ...}
            tdKeys: [],
            todoCreateNewKey: false,  // Used to reset <TodoCreateNew />
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

    logNewMsg = (msg: string | Error) => {
        const {logMsgData} = this.state;
        const newLogKey = this.logMsgKeysCount;
        this.logMsgKeysCount += 1;

        const newLogMsg = msg instanceof Error ? `${msg.name}: ${msg.message}` : msg;

        const newLogMsgData = Object.assign({}, logMsgData);
        newLogMsgData[newLogKey] = newLogMsg;

        console.log(`newLogMsgData: ${JSON.stringify(newLogMsgData)}`);

        this.setState({
            logMsgData: newLogMsgData,
        });
    };

    handleBoardClick = (e: SyntheticMouseEvent<HTMLDivElement>) => {
        const clickedEl = (e.target: HTMLDivElement);  // Flow type casting
        if (!elHasClass(clickedEl, 'todo-create-new') && !elChildOfClass(clickedEl, 'todo-create-new')) {
            this.setState(prevState => ({
                todoCreateNewKey: !prevState.todoCreateNewKey,
            }));
        }
    };

    render() {
        const {logMsgData, tdKeys, todoCreateNewKey} = this.state;
        const logMsgKeys = Object.keys(logMsgData);

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
                    <TodoCreateNew key={todoCreateNewKey.toString()} logger={this.logNewMsg} />
                </section>
                <section className="todo-cards">
                    {tdCards.length > 0 ? tdCards : <EmptyBoard />}
                </section>
            </div>
        )
    }
}

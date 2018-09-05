// @flow

import * as React from 'react';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';
import TodoEdit from './TodoEdit';

import {elHasClass, elChildOfClass} from '../utils/classes';

import {getAllTodoKeys} from '../api/indexedDB/readIDB';
import {removeTodo} from '../api/indexedDB/removeItemsIDB';

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
    logMsgData: {},  // Structure: {logMsgKey: msg: x, ...}
    logMsgKeys: number[],  // Need this to display logMsgData in chronological order
    tdKeys: string[],
    todoCreateNewKey: boolean,  // Used to reset <TodoCreateNew />
    todoEditData: {  // Used to populate data for <TodoEdit />
        todoEditKey: string,
        todoEditTitle: string,
        todoEditColor: string,
        todoEditTdliValues: {},
        todoEditHidden: boolean,
    },
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
            todoCreateNewKey: false,
            todoEditData: {
                todoEditKey: '',
                todoEditTitle: '',
                todoEditColor: '#EEEEEE',
                todoEditTdliValues: {},
                todoEditHidden: true,
            },
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

    removeTodo = async (todoId: string): Promise<string> => {
        try {
            const resRemove = await removeTodo(todoId);
            this.logNewMsg(resRemove.tdRemoveRes);
            this.logNewMsg(resRemove.tdliRemoveRes);

            const resSync = await this.syncWithDb();
            this.logNewMsg(resSync);

            return 'To-do removal complete'
        } catch (e) {
            this.logNewMsg(e);
            throw e
        }
    };

    handleBoardClick = (e: SyntheticMouseEvent<HTMLDivElement>) => {
        const clickedEl = e.target;
        if (!elHasClass(clickedEl, 'todo-create-new') && !elChildOfClass(clickedEl, 'todo-create-new')) {
            // If user clicks outside of <TodoCreateNew />, reset the component
            // and save new data
            // Data saving logic is handled in <TodoCreateNew />'s unmounting
            // lifecycle. The function below only triggers the unmounting
            this.resetTodoCreateNew();
        }
    };

    resetTodoCreateNew = () => {
        this.setState(prevState => ({
            todoCreateNewKey: !prevState.todoCreateNewKey,
        }));
    };

    startEdit = () => {

    };

    render() {
        const {logMsgData, logMsgKeys, tdKeys, todoCreateNewKey, todoEditData} = this.state;
        const {todoEditKey, todoEditTitle, todoEditColor, todoEditTdliValues, todoEditHidden} = todoEditData;

        // Generate log message elements
        const logMsgEls = logMsgKeys.map(logMsgKey => (
            <LogMessage key={logMsgKey} msg={logMsgData[logMsgKey]} />
        ));

        // Generate <TodoCard />
        const tdCards = tdKeys.map(tdKey => (
            <TodoCard key={tdKey}
                      tdKey={tdKey}
                      logNewMsg={this.logNewMsg}
                      removeTodo={this.removeTodo} />
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
                    <TodoCreateNew key={todoCreateNewKey.toString()}
                                   logger={this.logNewMsg}
                                   dbSync={this.syncWithDb}
                                   reset={this.resetTodoCreateNew} />
                </section>
                <section className="todo-edit-lightbox-bkg">
                    <TodoEdit tdKey={todoEditKey}
                              defaultTdTitle={todoEditTitle}
                              defaultTdColor={todoEditColor}
                              defaultTdliValues={todoEditTdliValues}
                              hidden={todoEditHidden} />
                </section>
                <section className="todo-cards">
                    {tdCards.length > 0 ? tdCards : <EmptyBoard />}
                </section>
            </div>
        )
    }
}

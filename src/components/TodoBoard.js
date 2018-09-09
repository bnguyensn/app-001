// @flow

import * as React from 'react';
import TodoCreateNew from './TodoCreateNew';
import TodoCard from './TodoCard';
import TodoEditWindow from './TodoEditWindow';
import type {TodoEditProps} from './TodoEdit';

import {elHasClass, elChildOfClass} from '../utils/classes';

import {getAllTodoKeys} from '../api/indexedDB/readIDB';
import {removeTodo} from '../api/indexedDB/removeItemsIDB';

import './css/todo-components.css';

/** ********** MISC. COMPONENTS ********** **/

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

/** ********** TO-DO BOARD ********** **/

type TodoBoardStates = {
    logMsgKeys: number[],
    logMsgData: {},  // Structure: {logMsgKey: msg: x, ...}
    tdKeys: string[],
    tdHiddenVisStates: {},  // Structure: {tdKey: x, ...}
    todoCreateNewKey: boolean,  // Used to reset <TodoCreateNew />
    todoEditWindowHidden: boolean,
    todoEditProps: TodoEditProps,  // Used to populate data for <TodoEdit />
};

export default class TodoBoard extends React.PureComponent<{}, TodoBoardStates> {
    logMsgKeysCount: number;

    constructor(props: {}) {
        super(props);
        this.logMsgKeysCount = 0;
        this.state = {
            logMsgKeys: [],
            logMsgData: {},
            tdKeys: [],
            tdHiddenVisStates: {},
            todoCreateNewKey: false,
            todoEditWindowHidden: true,
            todoEditProps: {
                tdKey: '',
                tdTitle: '',
                tdColor: '#EEEEEE',
                tdliKeys: [],
                tdliValues: {},
            },
        };
    }

    async componentDidMount() {
        const res = await this.syncWithDb();
        this.logNewMsg(res);
    }

    componentDidUpdate(prevProps: {}, prevState: TodoBoardStates, snapshot: any) {
        // Scroll to the bottom of the logs
        const logsEl = document.getElementById('todo-board-logs');
        if (logsEl) {
            logsEl.scrollTop = logsEl.scrollHeight;
        }
    }

    /** ********** LOGGING ********** **/

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

    /** ********** STUFF ********** **/

    syncWithDb = async () => {
        try {
            const tdKeys = await getAllTodoKeys();

            const tdHiddenVisStates = {};
            tdKeys.forEach((tdKey) => {
                tdHiddenVisStates[tdKey] = false;
            });

            this.setState({
                tdKeys,
                tdHiddenVisStates,
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

    /** ********** TO-DO EDIT WINDOW ********** **/

    startEdit = (todoEditProps: TodoEditProps) => {
        const {tdKey} = todoEditProps;
        const {tdHiddenVisStates} = this.state;

        const tdHiddenVisStatesNew = Object.assign({}, tdHiddenVisStates);
        tdHiddenVisStatesNew[tdKey] = true;

        this.setState({
            todoEditWindowHidden: false,
            todoEditProps,
            tdHiddenVisStates: tdHiddenVisStatesNew,
        });
    };

    stopEdit = (todoEditProps: TodoEditProps) => {
        const {tdKey} = todoEditProps;
        const {tdHiddenVisStates} = this.state;

        const tdHiddenVisStatesNew = Object.assign({}, tdHiddenVisStates);
        tdHiddenVisStatesNew[tdKey] = false;

        this.setState({
            todoEditWindowHidden: true,
            tdHiddenVisStates: tdHiddenVisStatesNew,
            todoEditProps: {
                tdKey: '',
                tdTitle: '',
                tdColor: '#EEEEEE',
                tdliKeys: [],
                tdliValues: {},
            },
        });
    };

    handleTodoEditUnmounting = async () => {
        try {
            const resSync = await this.syncWithDb();
            this.logNewMsg(resSync);
        } catch (e) {
            this.logNewMsg(e);
        }

    };

    /** ********** RENDER ********** **/

    render() {
        const {
            logMsgData, logMsgKeys, tdKeys, tdHiddenVisStates,
            todoEditWindowHidden, todoCreateNewKey, todoEditProps,
        } = this.state;

        // Generate log message elements
        const logMsgEls = logMsgKeys.map(logMsgKey => (
            <LogMessage key={logMsgKey} msg={logMsgData[logMsgKey]} />
        ));

        // Generate <TodoCard />
        const tdCards = tdKeys.map(tdKey => (
            <TodoCard key={tdKey}
                      tdKey={tdKey}
                      logNewMsg={this.logNewMsg}
                      removeTodo={this.removeTodo}
                      startEdit={this.startEdit}
                      hiddenVis={tdHiddenVisStates[tdKey]} />
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
                <section className="todo-cards">
                    {tdCards.length > 0 ? tdCards : <EmptyBoard />}
                </section>
                <TodoEditWindow key={todoEditWindowHidden.toString()}
                                todoEditProps={Object.assign({}, todoEditProps)}
                                handleTodoEditUnmounting={this.handleTodoEditUnmounting}
                                handleRemoveTodo={this.removeTodo}
                                stopEdit={this.stopEdit}
                                hidden={todoEditWindowHidden} />
            </div>
        )
    }
}

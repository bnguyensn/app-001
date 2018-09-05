// @flow

import * as React from 'react';
import OptionsPanel from './OptionsPanel';

import {getTodo, getAllTodoListItems} from '../api/indexedDB/readIDB';
import {putTodo} from '../api/indexedDB/addItemsIDB';

function EmptyCard() {
    return (
        <li>There doesn&#39;t seem to be anything here.</li>
    )
}

type TDLIProps = {
    tdliDone: boolean,
    tdliDesc: string,
};

function TDLI(props: TDLIProps) {
    const {tdliDone, tdliDesc} = props;

    return (
        <li className="todo-card-list-item">
            <div className="todo-card-list-item-checkbox">
                <input type="checkbox" defaultChecked={tdliDone} />
            </div>
            <div className="todo-card-list-item-description">
                {tdliDesc}
            </div>
        </li>
    )
}

type TodoCardProps = {
    tdKey: string,
    logNewMsg: (msg: string) => void,
    removeTodo: (todoId: string) => Promise<string>,
};

type TodoCardStates = {
    tdTitle: string,
    tdColor: string,
    tdliKeys: string[],
    tdliValues: {},  // Structure: {tdliKeyX: {done: x, desc: x}, ...}
};

export default class TodoCard extends React.PureComponent<TodoCardProps, TodoCardStates> {
    constructor(props: TodoCardProps) {
        super(props);
        this.state = {
            tdTitle: '',
            tdColor: '#EEEEEE',
            tdliKeys: [],
            tdliValues: {},
        };
    }

    componentDidMount() {
        this.syncWithDb();
    }

    syncWithDb = async () => {
        const {tdKey, logNewMsg} = this.props;

        try {
            // Fetch to-do data and todoListItem data from database
            const tdDataPromise = getTodo(tdKey);
            const tdliDataPromise = getAllTodoListItems(tdKey, 'all');
            const tdData = await tdDataPromise;
            const tdlisData = await tdliDataPromise;

            // Prepare state data that will match database data
            const tdliKeys = tdlisData.map(tdliData => tdliData[0]);
            const tdliValuesArr = tdlisData.map(tdliData => tdliData[1]);
            const tdliValues = {};
            tdliKeys.forEach((tdliKey, index) => {
                tdliValues[tdliKey] = {};
                tdliValues[tdliKey].done = tdliValuesArr[index].done;
                tdliValues[tdliKey].desc = tdliValuesArr[index].description;
            });

            // Update state
            this.setState({
                tdTitle: tdData.title,
                tdColor: tdData.color,
                tdliKeys,
                tdliValues,
            });
        } catch (e) {
            logNewMsg(e);
        }
    };

    changeColor = async (todoId: string, newValue: string): Promise<void> => {
        const {tdKey, logNewMsg} = this.props;
        const {tdTitle} = this.state;

        try {
            const dataToPut = {
                title: tdTitle,
                color: newValue,
            };

            const res = await putTodo(dataToPut, tdKey);
            logNewMsg(res.msg);

            this.setState({
                tdColor: newValue,
            });
        } catch (e) {
            logNewMsg(e);
        }
    };

    handleClick = (e: SyntheticMouseEvent<>) => {

    };

    handleKeyPress = () => {

    };

    handleFocus = () => {
        // Display selection circle
    };

    render() {
        const {tdKey, removeTodo} = this.props;
        const {tdTitle, tdColor, tdliKeys, tdliValues} = this.state;

        const tdlis = tdliKeys.map((tdliKey) => {
            const tdliDone = tdliValues[tdliKey].done;
            const tdliDesc = tdliValues[tdliKey].desc;

            return <TDLI key={tdliKey} tdliDone={tdliDone} tdliDesc={tdliDesc} />
        });

        return (
            <div className="todo-card"
                 role="button" tabIndex={0} aria-label={`To-do #${tdKey}`}
                 style={{backgroundColor: tdColor}}
                 onClick={this.handleClick}
                 onKeyPress={this.handleKeyPress}
                 onFocus={this.handleFocus}>
                <div className="todo-card-title">
                    {tdTitle}
                </div>
                <ul className="todo-card-list-items">
                    {tdlis.length > 0 ? tdlis : <EmptyCard />}
                </ul>
                <OptionsPanel todoId={tdKey}
                              removeTodo={removeTodo}
                              changeColor={this.changeColor} />
            </div>
        )
    }
}

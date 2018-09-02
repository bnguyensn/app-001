// @flow

import * as React from 'react';
import OptionsPanel from './OptionsPanel';

import {getTodo, getAllTodoListItems} from '../api/indexedDB/readIDB';

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
    tdliKeys: string[],
    tdliValues: {},  // Structure: {tdliKeyX: {done: x, desc: x}, ...}
};

export default class TodoCard extends React.PureComponent<TodoCardProps, TodoCardStates> {
    constructor(props: TodoCardProps) {
        super(props);
        this.state = {
            tdTitle: '',
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
            const tdDataPromise = getTodo(tdKey);
            const tdliDataPromise = getAllTodoListItems(tdKey, 'all');
            const tdData = await tdDataPromise;
            const tdlisData = await tdliDataPromise;

            console.log(tdlisData);

            const tdliKeys = tdlisData.map(tdliData => tdliData[0]);
            const tdliValuesArr = tdlisData.map(tdliData => tdliData[1]);
            const tdliValues = {};
            tdliKeys.forEach((tdliKey, index) => {
                tdliValues[tdliKey] = {};
                tdliValues[tdliKey].done = tdliValuesArr[index].done;
                tdliValues[tdliKey].desc = tdliValuesArr[index].description;
            });

            this.setState({
                tdTitle: tdData.title,
                tdliKeys,
                tdliValues,
            });
        } catch (e) {
            logNewMsg(e);
        }
    };

    render() {
        const {tdKey, removeTodo} = this.props;
        const {tdTitle, tdliKeys, tdliValues} = this.state;

        const tdlis = tdliKeys.map((tdliKey) => {
            const tdliDone = tdliValues[tdliKey].done;
            const tdliDesc = tdliValues[tdliKey].desc;

            return <TDLI key={tdliKey} tdliDone={tdliDone} tdliDesc={tdliDesc} />
        });

        return (
            <div className="todo-card">
                <div className="todo-card-title">
                    {tdTitle}
                </div>
                <ul className="todo-card-list-items">
                    {tdlis.length > 0 ? tdlis : <EmptyCard />}
                </ul>
                <OptionsPanel todoId={tdKey} removeTodo={removeTodo} />
            </div>
        )
    }
}

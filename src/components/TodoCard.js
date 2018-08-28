// @flow

import * as React from 'react';
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
                <input type="checkbox" checked={tdliDone} />
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
            const tdData = getTodo(tdKey);
            const tdliData = getAllTodoListItems(tdKey, 'all');
            await tdData;
            await tdliData;

            const tdliKeys = tdliData.map(tdliData => tdliData[0]);
            const tdliValuesArr = tdliData.map(tdliData => tdliData[1]);
            const tdliValues = {};
            tdliKeys.forEach((tdliKey, index) => {
                tdliValues[tdliKey].done = tdliValuesArr[index].done;
                tdliValues[tdliKey].desc = tdliValuesArr[index].desc;
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
        const {tdTitle, tdliKeys, tdliValues} = this.state;

        const tdlis = tdliKeys.map((tdliKey) => {
            const tdliDone = tdliValues[tdliKey].done;
            const tdliDesc = tdliValues[tdliKey].desc;

            return <TDLI tdliDone={tdliDone} tdliDesc={tdliDesc} />
        });

        return (
            <div className="todo-card">
                <div className="todo-card-title">
                    {tdTitle}
                </div>
                <ul className="todo-card-list-items">
                    {tdlis.length > 0 ? tdlis : <EmptyCard />}
                </ul>
            </div>
        )
    }
}

// @flow

import * as React from 'react';
import TodoEdit from './TodoEdit';
import {addTodo, addTodoListItem} from '../api/indexedDB/addItemsIDB';

type TodoCreateNewStates = {
    todoListItemIds: string[],
    tdliData: {},
};

export default class TodoCreateNewOld extends React.PureComponent<{}, TodoCreateNewStates> {
    keysCount: number;
    tdTitle: string;
    tdliDesc: {};

    constructor(props: {}) {
        super(props);
        this.keysCount = 0;
        this.tdTitle = '';
        this.tdliDesc = {};
        this.state = {
            todoListItemIds: [],
            tdliData: {},
        };
    }

    componentDidMount() {

    }

    getNewKey = () => {
        const key = `key${this.keysCount}`;
        this.keysCount += 1;
        return key
    };

    addTodoListItemDOM =() => {
        const newTdliKey = this.getNewKey();
        const newTdliData = {
            done: false,
        };
        this.tdliDesc[newTdliKey] = '';

        this.setState(prevState => ({
            todoListItemIds: [...prevState.todoListItemIds, newTdliKey],
            tdliData: {...prevState.tdliData, [newTdliKey]: newTdliData},
        }));
    };

    removeTodoListItemDOM = (idToRemove: string) => {
        const {todoListItemIds, tdliData} = this.state;

        const newTodoListItemIds = todoListItemIds.filter(id => id !== idToRemove);
        const curTdliKeys = Object.keys(tdliData);
        const newTdliKeys = curTdliKeys.filter(id => id !== idToRemove);
        const newTdliData = {};
        newTdliKeys.forEach((tdliKey) => {
            newTdliData[tdliKey] = tdliData[tdliKey];
        });
        delete this.tdliDesc[idToRemove];

        this.setState({
            todoListItemIds: newTodoListItemIds,
            tdliData: newTdliData,
        });
    };

    handleTdTitleUpdate = (todoId: ?string, newValue: string) => {
        this.tdTitle = newValue;
    };

    handleTdliDoneUpdate = (todoListItemId: ?string, newValue: boolean) => {
        if (todoListItemId) {
            const {tdliData} = this.state;
            const newTdliData = Object.assign({}, tdliData);
            newTdliData[todoListItemId].done = !(newTdliData[todoListItemId].done);

            this.setState({
                tdliData: newTdliData,
            });
        }
    };

    handleTdliDescUpdate = (todoListItemId: ?string, newValue: string) => {
        if (todoListItemId) {
            this.tdliDesc[todoListItemId] = newValue;
        }
    };

    /** ******************************************************************** **/

    isModified = () => {
        const {todoTitle, todoListItemDescArr} = this.valueData;
        return (
            todoTitle !== ''
            || (
                todoListItemDescArr.length > 0
                && !todoListItemDescArr.every(desc => desc === '')
            )
        )
    };

    closeCreateNewWindow = async () => {
        const {addNewTodoDOM, logStatus} = this.props;
        const {todoTitle, todoListItemDescArr, todoListItemDoneArr} = this.valueData;

        if (this.isModified()) {
            try {
                this.blockTodoCreateNew();

                const newTodoId = await addTodo({title: todoTitle});
                const todoListItemsToAdd = todoListItemDescArr.map((desc, index) => ({
                    todoId: newTodoId,
                    description: desc,
                    done: todoListItemDoneArr[index],
                }));
                const newTodoListItemIds = await addTodoListItem(todoListItemsToAdd);

                addNewTodoDOM(newTodoId, newTodoListItemIds);

                this.unblockTodoCreateNew();
                this.clearTodoCreateNew();
            } catch (e) {
                logStatus(e);
            }
        } else {
            this.clearTodoCreateNew();
        }
    };

    blockTodoCreateNew = () => {

    };

    unblockTodoCreateNew = () => {

    };

    clearTodoCreateNew = () => {

    };

    render() {
        const {todoListItemIds, tdliData} = this.state;

        const dbKeyData = {
            todoId: undefined,
            todoListItemIds,
        };
        const dbValueData = {
            tdTitle: this.tdTitle,
            tdliData,
        };

        return (
            <div className="todo-create-new">
                <TodoEdit dbKeyData={dbKeyData}
                          dbValueData={dbValueData}
                          handleTdTitleUpdate={this.handleTdTitleUpdate}
                          handleTdliDoneUpdate={this.handleTdliDoneUpdate}
                          handleTdliDescUpdate={this.handleTdliDescUpdate} />
            </div>
        )
    }
}

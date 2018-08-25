import * as React from 'react';
import TodoEdit from './TodoEdit';
import {addTodo, addTodoListItem} from '../api/indexedDB/addItemsIDB';

export default class TodoCreateNew extends React.PureComponent {
    constructor(props) {
        super(props);
        this.keysCount = 0;
        this.info = {
            todoTitle: '',
            todoListItems: {},

            // Consider delete
            todoListItemDescArr: [],
            todoListItemDoneArr: [],
        };
    }

    isModified = () => {
        const {todoTitle, todoListItemDescArr} = this.info;
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
        const {todoTitle, todoListItemDescArr, todoListItemDoneArr} = this.info;

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

    /** To-do event handlers **/

    handleTDTitleInput = (newTitle) => {
        this.info.todoTitle = newTitle;
    };

    handleTDTitleBlur = (curTitle) => {
        // Do nothing
    };

    /** TodoListItem event handlers **/

    getNewKey = () => {
        const key = `key${this.keysCount}`;
        this.keysCount += 1;
        return key
    };

    handleTDLIAddNew = () => {
        const newKey = this.getNewKey();
        this.info[newKey] = {
            done: false,
            description: '',
        };
        return newKey
    };

    handleTDLIDoneChange = (tdliId, newDone) => {
        this.info[tdliId].done = newDone;
    };

    handleTDLIDescInput = (tdliId, newDesc) => {
        this.info[tdliId].description = newDesc;
    };

    handleTDLIDescBlur = (tdliId, curDesc) => {
        this.info[tdliId].description = curDesc;
    };

    render() {
        const {logStatus} = this.props;

        return (
            <div className="todo-create-new">
                <TodoEdit logStatus={logStatus}
                          handleTDTitleInput={this.handleTDTitleInput}
                          handleTDLIAddNew={this.handleTDLIAddNew}
                          handleTDLIDoneChange={this.handleTDLIDoneChange}
                          handleTDLIDescInput={this.handleTDLIDescInput} />
            </div>
        )
    }
}

// @flow

import * as React from 'react';
import {getTodoListItem} from '../api/indexedDB/readIDB';
import {addTodo, addTodoListItem, putTodoListItem} from '../api/indexedDB/addItemsIDB';
import MaterialIcon from './MaterialIcon';

type DBKeyData = {
    todoId: ?string,
    todoListItemId: ?string,
};

type DBValueData = {
    tdliDone: boolean,
    tdliDesc: string,
};

type TodoListItemEditProps = {
    dbKeyData: DBKeyData,
    dbValueData: DBValueData,
    handleTdliDoneUpdate: (todoListItemId: ?string, newValue: boolean) => void,
    handleTdliDescUpdate: (todoListItemId: ?string, newValue: string) => void,
};

/**
 * The description element is uncontrolled because React does not work well
 * with contenteditable. See https://github.com/facebook/react/issues/2047.
 * Alternatively, one can use https://draftjs.org.
 * */
export default class TodoListItemEdit extends React.PureComponent<TodoListItemEditProps, {}> {
    dbKeyData: DBKeyData;
    descEl: { current: null | HTMLDivElement };

    static defaultProps = {
        dbKeyData: {todoId: undefined, todoListItemId: undefined},
        dbValueData: {tdliDone: false, tdliDesc: ''},
    };

    constructor(props: TodoListItemEditProps) {
        super(props);
        // Database key data is assigned to an own property instead of relying
        // on props because we don't want the contenteditable element to be
        // re-rendered on props change (the caret will jump)
        this.dbKeyData = Object.assign({}, props.dbKeyData);

        // Need a ref for the contenteditable element so its initial value can
        // be set if needed
        this.descEl = React.createRef();

        // TODO: delete
        /*this.todoListItemId = props.todoListItemId;
        this.state = {
            done: false,
        };*/
    }

    async componentDidMount() {
        const {dbValueData} = this.props;
        const {tdliDesc} = dbValueData;

        // Force a re-render if this is the last item
        if (this.isLastItem()) {
            this.forceUpdate();
        }

        // Pass control of contenteditable elements over to this component
        if (this.descEl.current) {
            this.descEl.current.textContent += tdliDesc;
        }

        // TODO: delete
        /*if (todoListItemId) {
            try {
                const {description, done} = await getTodoListItem(todoListItemId);

                this.descEl.current.textContent += description;
                this.setState({
                    done,
                });
            } catch (e) {
                logStatus(e);
            }
        }*/
    }

    // Check if this is the last <TodoListItem /> in the <TodoListItem /> list
    isLastItem = () => {
        if (this.descEl.current && this.descEl.current.parentNode) {
            const listItemEl = this.descEl.current.parentNode;
            if (listItemEl.parentNode) {
                const listItemsEl = listItemEl.parentNode;
                return listItemsEl.lastChild === listItemEl
            }
        }
        return false
    };

    getDesc = () => {
        if (this.descEl.current) {
            return this.descEl.current.textContent
        }
        return ''
    };

    handleDoneUpdate = () => {
        const {dbValueData, handleTdliDoneUpdate} = this.props;
        const {todoListItemId} = this.dbKeyData;
        const {tdliDone} = dbValueData;

        if (todoListItemId) {
            handleTdliDoneUpdate(todoListItemId, !tdliDone);
        }
    };

    handleDescUpdate = () => {
        const {handleTdliDescUpdate} = this.props;
        const {todoListItemId} = this.dbKeyData;

        if (this.isLastItem()) {
            handleTdliDescUpdate(todoListItemId, this.getDesc());
        }
    };

    render() {
        const {dbValueData} = this.props;
        const {tdliDone} = dbValueData;

        const lastItem = this.isLastItem();

        return (
            <li className="todo-list-item">
                {!lastItem
                    ? <MaterialIcon className="todo-list-item-dragger md-dark" icon="drag_indicator" />
                    : <div style={{width: '1rem', height: '1rem'}} />
                }
                <div className="todo-list-item-checkbox">
                    <input type="checkbox" checked={tdliDone}
                           onChange={this.handleDoneUpdate} />
                </div>
                <div className="todo-list-item-description"
                     placeholder="List item"
                     ref={this.descEl}
                     onInput={this.handleDescUpdate}
                     contentEditable />
                {!lastItem
                    ? <MaterialIcon className="todo-list-item-deleter md-dark" icon="cancel" />
                    : <div style={{width: '1rem', height: '1rem'}} />
                }
            </li>
        )
    }

    // TODO: delete
    /*handleDoneUpdate = async () => {
        const {todoId, logStatus} = this.props;
        const {done: prevStateDone} = this.state;

        // Update the DOM
        this.setState(prevState => ({done: !prevState.done}));

        // Update database, if applicable
        if (todoId && this.todoListItemId) {
            try {
                const updatedTodoListItem = {
                    todoId,
                    description: this.getDesc(),
                    done: !prevStateDone,
                };
                logStatus((await putTodoListItem(updatedTodoListItem, this.todoListItemId)).msg);
            } catch (e) {
                logStatus(e);
            }
        }
    };*/

    // TODO: delete
    /*handleTDLIDescInput = async () => {
        const {todoId, addNewListItemDOM, handleTDLIAddNew, handleTDLIDescInput, logStatus} = this.props;
        const {done} = this.state;
        const description = this.getDesc();

        if (this.isLastItem()) {
            // Update DOM
            addNewListItemDOM(todoId);

            // Update database
            if (todoId) {
                // Not creating new To-do
                try {
                    const {data} = await addTodoListItem({todoId, description, done});
                    this.todoListItemId = data;
                } catch (e) {
                    logStatus(e);
                }
            } else {
                // Creating a new To-do
                this.todoListItemId = handleTDLIAddNew();
                handleTDLIDescInput(this.todoListItemId, description);
            }
        } else if (this.todoListItemId) {
            // Update database if applicable
            // Currently disabled - Only update database on blur
            /!*try {
                logStatus((await putTodoListItem({todoId, description, done}, this.todoListItemId)).msg);
            } catch (e) {
                logStatus(e);
            }*!/
        }
    };*/

    // TODO: delete
    /*handleTDLIDescBlur = async () => {
        const {todoId, addNewListItemDOM, handleTDLIAddNew, handleTDLIDescBlur, logStatus} = this.props;
        const {done} = this.state;
        const description = this.getDesc();

        // Update database
        if (todoId && this.todoListItemId) {
            // Not creating new To-do
            try {
                logStatus((await putTodoListItem({todoId, description, done}, this.todoListItemId)).msg);
            } catch (e) {
                logStatus(e);
            }
        } else if (this.todoListItemId) {
            // Creating new To-do
            handleTDLIDescBlur(this.todoListItemId, this.getDesc());
        }
    };*/

    // TODO: delete
    /*handleDescriptionBlur = async () => {
        /!*const {todoId, todoListItemId, done, handleBlur} = this.props;
        const description = e.target.textContent;

        // Save data
        if (todoListItemId) {
            if (todoId) {
                // This is an update request
                const updatedTodoListItem = {todoId, description, done};

                try {
                    await putTodoListItem(updatedTodoListItem, todoListItemId);

                    return {todoId, todoListItemId}
                } catch (err) {
                    throw err
                }
            } else {
                // This is a new todo request
                try {
                    const newTodoId = await addTodo({title: ''});
                    const newTodoListItem = {todoId: newTodoId, description, done};
                    const newTodoListItemId = await addTodoListItem(newTodoListItem);

                    return {
                        todoId: newTodoId,
                        todoListItemId: newTodoListItemId,
                    }
                } catch (err) {
                    throw err
                }
            }
        }*!/
    };*/
}

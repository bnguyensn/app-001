import * as React from 'react';
import {getTodoListItem} from '../api/indexedDB/readIDB';
import {addTodo, addTodoListItem, putTodoListItem} from '../api/indexedDB/addItemsIDB';
import MaterialIcon from './MaterialIcon';

/**
 * This is an uncontrolled component due to React not working too well
 * with contenteditable. See https://github.com/facebook/react/issues/2047.
 * Alternatively, one can use https://draftjs.org.
 * */
export default class TodoListItemEdit extends React.PureComponent {
    constructor(props) {
        super(props);
        this.todoListItemId = props.todoListItemId;
        this.listItemDescriptionEl = React.createRef();
        this.state = {
            done: false,
        };
    }

    async componentDidMount() {
        const {todoListItemId, logStatus} = this.props;

        // Force a re-render if this is the last item
        // This is needed because at the very first render, we do not know if
        // this <TodoListItem /> is the last item or not
        if (this.isLastItem()) {
            this.forceUpdate();
        }

        // Update the DOM with initial data, if any
        if (todoListItemId) {
            try {
                const {description, done} = await getTodoListItem(todoListItemId);

                this.listItemDescriptionEl.current.textContent += description;
                this.setState({
                    done,
                });
            } catch (e) {
                logStatus(e);
            }
        }
    }

    // Check if this is the last <TodoListItem /> in a <TodoCard /> i.e. it is
    // used to add new <TodoListItem />
    // On the first render immediately before componentDidMount(), this will
    // always be false. It doesn't matter though because the component will
    // re-render immediately in componentDidMount()
    isLastItem = () => {
        if (this.listItemDescriptionEl.current) {
            const listItemEl = this.listItemDescriptionEl.current.parentNode;
            return listItemEl.parentNode.lastChild === listItemEl
        }
        return false
    };

    getDescription = () => {
        if (this.listItemDescriptionEl.current) {
            return this.listItemDescriptionEl.current.textContent
        }
        return ''
    };

    /** TodoListItem event handlers **/

    handleDoneUpdate = async () => {
        const {todoId, logStatus} = this.props;
        const {done: prevStateDone} = this.state;

        // Update the DOM
        this.setState(prevState => ({done: !prevState.done}));

        // Update database, if applicable
        if (todoId && this.todoListItemId) {
            try {
                const updatedTodoListItem = {
                    todoId,
                    description: this.getDescription(),
                    done: !prevStateDone,
                };
                logStatus((await putTodoListItem(updatedTodoListItem, this.todoListItemId)).msg);
            } catch (e) {
                logStatus(e);
            }
        }
    };

    handleTDLIDescInput = async () => {
        const {todoId, addNewListItemDOM, handleTDLIAddNew, handleTDLIDescInput, logStatus} = this.props;
        const {done} = this.state;
        const description = this.getDescription();

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
            /*try {
                logStatus((await putTodoListItem({todoId, description, done}, this.todoListItemId)).msg);
            } catch (e) {
                logStatus(e);
            }*/
        }
    };

    handleTDLIDescBlur = async () => {
        const {todoId, addNewListItemDOM, handleTDLIAddNew, handleTDLIDescBlur, logStatus} = this.props;
        const {done} = this.state;
        const description = this.getDescription();

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
            handleTDLIDescBlur(this.todoListItemId, this.getDescription());
        }
    };

    // Currently disabled
    handleDescriptionBlur = async () => {
        /*const {todoId, todoListItemId, done, handleBlur} = this.props;
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
        }*/
    };

    render() {
        const {done} = this.state;

        // On the first render immediately before componentDidMount(), this will
        // always be false. It doesn't matter though because the component will
        // re-render immediately in componentDidMount()
        const lastItem = this.isLastItem();

        return (
            <li className="todo-list-item">
                {!lastItem
                    ? <MaterialIcon className="todo-list-item-dragger md-dark" icon="drag_indicator" />
                    : <div style={{width: '1rem', height: '1rem'}} />
                }
                <div className="todo-list-item-checkbox">
                    <input type="checkbox" checked={done}
                           onChange={this.handleDoneUpdate} />
                </div>
                <div className="todo-list-item-description"
                     placeholder="List item"
                     ref={this.listItemDescriptionEl}
                     onInput={this.handleTDLIDescInput}
                     onBlur={this.handleTDLIDescBlur}
                     contentEditable />
                {!lastItem
                    ? <MaterialIcon className="todo-list-item-deleter md-dark" icon="cancel" />
                    : <div style={{width: '1rem', height: '1rem'}} />
                }
            </li>
        )
    }
}

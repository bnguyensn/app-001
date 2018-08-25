import * as React from 'react';
import TodoListItemEdit from './TodoListItemEdit';
import {getTodo, getTodoListItems} from '../api/indexedDB/readIDB';
import MaterialIcon from './MaterialIcon';

/**
 * This has an uncontrolled element due to React not working too well
 * with contenteditable. See https://github.com/facebook/react/issues/2047.
 * Alternatively, one can use https://draftjs.org.
 * */
export default class TodoEdit extends React.PureComponent {
    constructor(props) {
        super(props);
        this.todoCardTitleEl = React.createRef();
        this.keysCount = 0;
        this.state = {
            todoListItems: [],
        };
    }

    async componentDidMount() {
        const {logStatus, todoId} = this.props;

        try {
            let title = '';
            let todoListItems = [];

            // Initialise data, if there is any
            if (todoId) {
                // Get database data
                const titlePromise = getTodo(todoId);
                const todoListItemKeysPromise = getTodoListItems(todoId, 'keysonly');
                const todoTitle = (await titlePromise).title;
                const todoListItemKeys = await todoListItemKeysPromise;

                // Initialise title text
                title += todoTitle;

                // Initialise <TodoListItem />
                // First add all existing <TodoListItem /> from database
                todoListItems = [
                    ...todoListItems,
                    ...todoListItemKeys.map(todoListItemKey => (
                        <TodoListItemEdit key={this.getNewKey()}
                                          todoId={todoId}
                                          todoListItemId={todoListItemKey}
                                          logStatus={logStatus}
                                          addNewListItemDOM={this.addNewListItemDOM} />
                    )),
                ];
            }

            // Update DOM title text
            this.todoCardTitleEl.current.textContent += title;

            // Then add a blank <TodoListItem /> which has the purpose of
            // creating new <TodoListItem />
            todoListItems.push(
                <TodoListItemEdit key={this.getNewKey()}
                                  todoId={todoId}
                                  logStatus={logStatus}
                                  addNewListItemDOM={this.addNewListItemDOM} />,
            );

            // And finally merge with current state to update the virtual DOM
            this.setState(prevState => ({
                todoListItems: [...prevState.todoListItems, ...todoListItems],
            }));
        } catch (e) {
            logStatus(e)
        }
    }

    getTDTitle = () => {
        if (this.todoCardTitleEl.current) {
            return this.todoCardTitleEl.current.textContent
        }
        return ''
    };

    // Can't use database primary keys of todoListItems as key because we have a
    // blank <TodoListItem /> in todoListItems. Thus we generate unique keys
    // based on a global counter (global = with respect to this <TodoEdit />
    // instance.
    getNewKey = () => {
        const key = `key${this.keysCount}`;
        this.keysCount += 1;
        return key
    };

    addNewListItemDOM = (todoId, todoListItemKey = undefined) => {
        const {logStatus} = this.props;

        const NewTodoListItem = (
            <TodoListItemEdit key={this.getNewKey()}
                              todoId={todoId}
                              todoListItemKey={todoListItemKey}
                              logStatus={logStatus}
                              addNewListItemDOM={this.addNewListItemDOM} />
        );

        this.setState(prevState => ({
            todoListItems: [...prevState.todoListItems, NewTodoListItem],
        }));
    };

    /** To-do event handlers **/

    handleTDTitleInput = () => {
        const {handleTitleInput} = this.props;
        handleTitleInput(this.getTDTitle());
    };

    /** TodoListItem event handlers **/

    handleTDLIAddNew = () => {
        const {handleTDLIAddNew} = this.props;
        const newTDLIKey = handleTDLIAddNew();
    };

    handleTDLIDoneChange = (tdliId, newDone) => {
        this.info[tdliId].done = newDone;
    };

    handleTDLIDescInput = (tdliId, newDesc) => {
        this.info[tdliId].description = newDesc;
    };

    render() {
        const {todoListItems} = this.state;

        return (
            <div className="todo-edit">
                <div className="todo-edit-title"
                     placeholder="Title"
                     contentEditable
                     onInput={this.handleTDTitleInput}
                     ref={this.todoCardTitleEl} />
                <ul className="todo-list-items">
                    {todoListItems.length > 0 ? todoListItems : null}
                </ul>
                <div className="todo-card-options-panel">
                    <MaterialIcon className="todo-card-options-panel-btn md-dark"
                                  icon="delete" />
                    <MaterialIcon className="todo-card-options-panel-btn md-dark"
                                  icon="color_lens" />
                </div>
            </div>
        )
    }
}

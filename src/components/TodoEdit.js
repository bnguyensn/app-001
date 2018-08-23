import * as React from 'react';
import TodoListItem from './TodoListItem';
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
        try {
            const {todoId} = this.props;

            let title = '';
            let todoListItems = [];

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
                        <TodoListItem key={this.getNewKey()}
                                      todoId={todoId}
                                      todoListItemId={todoListItemKey}
                                      addNewListItemDOM={this.addNewListItemDOM} />
                    )),
                ];
            }

            // Update DOM title text
            this.todoCardTitleEl.current.textContent += title;

            // Then add a blank <TodoListItem /> which has the purpose of
            // creating new <TodoListItem />
            todoListItems.push(
                <TodoListItem key={this.getNewKey()}
                              todoId={todoId}
                              addNewListItemDOM={this.addNewListItemDOM} />,
            );

            // And finally merge with current state to update DOM <TodoListItem />
            this.setState(prevState => ({
                todoListItems: [...prevState.todoListItems, ...todoListItems],
            }));
        } catch (e) {
            console.log(e);
        }
    }

    addNewListItemDOM = (todoId, todoListItemKey = undefined) => {
        const NewTodoListItem = (
            <TodoListItem key={this.getNewKey()}
                          todoId={todoId}
                          todoListItemKey={todoListItemKey}
                          addNewListItemDOM={this.addNewListItemDOM} />
        );



        this.setState(prevState => ({
            todoListItems: [...prevState.todoListItems, NewTodoListItem],
        }));
    };

    // Can't use todoListItemKey as key because we have a blank <TodoListItem />
    // in todoListItems. Thus we generate unique keys based on a global counter.
    getNewKey = () => {
        const key = `key${this.keysCount}`;
        this.keysCount += 1;
        return key
    };

    render() {
        const {todoListItems} = this.state;

        return (
            <div className="todo-edit">
                <div className="todo-edit-title"
                     ref={this.todoCardTitleEl}
                     placeholder="Title"
                     contentEditable />
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
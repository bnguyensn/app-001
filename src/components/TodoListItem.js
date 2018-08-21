import * as React from 'react';
import {getTodoListItem} from '../api/indexedDB/readIDB';
import {addTodoListItem} from '../api/indexedDB/addItemsIDB';

/**
 * This is an uncontrolled component due to React not working too well
 * with contenteditable. See https://github.com/facebook/react/issues/2047.
 * Alternatively, one can use https://draftjs.org.
 * */
export default class TodoListItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.todoListItemId = props.todoListItemId;
        this.listItemDescriptionEl = React.createRef();
        this.state = {
            done: false,
        };
    }

    async componentDidMount() {
        const {todoListItemId} = this.props;

        if (todoListItemId) {
            try {
                const {description, done} = await getTodoListItem(todoListItemId);

                // Initialise description text and done status
                this.listItemDescriptionEl.current.textContent += description;
                this.setState({
                    done,
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    handleDoneStatusUpdate = () => {
        this.setState(prevState => ({done: !prevState.done}));
    };

    handleDescriptionUpdate = async () => {
        // If this is the last <TodoListItem /> in a <TodoCard />, the first
        // edit will:
        //  - Convert the current <TodoListItem /> to a proper database
        //    <TodoListItem /> and add new data to database
        //  - Add a new blank <TodoListItem /> (DOM only)

        const {todoId, addNewListItemDOM} = this.props;
        const {done} = this.state;

        const description = this.listItemDescriptionEl.current.textContent;

        const listItemEl = this.listItemDescriptionEl.current.parentNode;

        if (listItemEl.parentNode.lastChild === listItemEl) {
            console.log('Time to add a new blank TodoListItem!');

            // Add a new blank <TodoListItem /> (DOM only)
            addNewListItemDOM(todoId);

            // Add new data to database and convert the current <TodoListItem />
            try {
                this.todoListItemId = await addTodoListItem({todoId, description, done});
            } catch (e) {
                console.log(e);
            }
        }
    };

    render() {
        const {done} = this.state;

        return (
            <li className="todo-list-item">
                <input className="todo-list-item-checkbox"
                       type="checkbox" checked={done}
                       onChange={this.handleDoneStatusUpdate} />
                <div className="todo-list-item-description"
                     placeholder="List item"
                     ref={this.listItemDescriptionEl}
                     onInput={this.handleDescriptionUpdate}
                     contentEditable />
            </li>
        )
    }
}

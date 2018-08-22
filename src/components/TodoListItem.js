import * as React from 'react';
import {getTodoListItem} from '../api/indexedDB/readIDB';
import {addTodoListItem} from '../api/indexedDB/addItemsIDB';
import MaterialIcon from './MaterialIcon';

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

        if (this.isLastItem()) {
            // Force a re-render
            this.forceUpdate();
        }

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

        if (this.isLastItem()) {
            console.log('Time to add a new blank TodoListItem!');

            // Add a new blank <TodoListItem /> (DOM only)
            addNewListItemDOM(todoId);

            // Add new data to database and convert the current <TodoListItem />
            try {
                const {data} = await addTodoListItem({todoId, description, done});
                this.todoListItemId = data;
            } catch (e) {
                console.log(e);
            }
        }
    };

    handleDescriptionUnfocus = () => {
        console.log(`TodoListItem primaryKey = ${this.todoListItemId} has been unfocused.`);
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
                           onChange={this.handleDoneStatusUpdate} />
                </div>
                <div className="todo-list-item-description"
                     placeholder="List item"
                     ref={this.listItemDescriptionEl}
                     onInput={this.handleDescriptionUpdate}
                     onBlur={this.handleDescriptionUnfocus}
                     contentEditable />
                {!lastItem
                    ? <MaterialIcon className="todo-list-item-deleter md-dark" icon="cancel" />
                    : <div style={{width: '1rem', height: '1rem'}} />
                }
            </li>
        )
    }
}

import * as React from 'react';
import {getTodoListItem} from '../api/indexedDB/readIDB';

export default class TodoListItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            description: '',
            done: false,
        };
    }

    async componentDidMount() {
        const {todoListItemId} = this.props;

        if (todoListItemId) {
            try {
                // Get todoListItem information from database
                const todoListItem = await getTodoListItem(todoListItemId);

                this.setState({
                    description: todoListItem.description,
                    done: todoListItem.done,
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    handleDoneStatusUpdate = () => {
        this.setState(prevState => ({done: !prevState.done}));
    };

    handleDescriptionUpdate = (e) => {
        const {addNewListItem} = this.props;  // This prop is only available for the last todoListItem
        const {description} = this.state;

        this.setState({
            description: e.currentTarget.textContent,
        });

        // Any first input to the last todoListItem will:
        // - add a new empty todoListItem
        // - add this todoListItem to the database
        // - automatically remove the ability to add todoListItem, thanks to
        // <TodoCard />'s re-render
        if (addNewListItem && description === '') {
            addNewListItem('', false);
        }
    };

    render() {
        const {description, done} = this.state;

        return (
            <li className="todo-list-item">
                <input className="todo-list-item-checkbox"
                       type="checkbox" checked={done} name={description}
                       onChange={this.handleDoneStatusUpdate} />
                <div className="todo-list-item-description"
                     placeholder="List item"
                     onInput={this.handleDescriptionUpdate}
                     contentEditable suppressContentEditableWarning>
                    {description}
                </div>
            </li>
        )
    }
}

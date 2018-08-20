import * as React from 'react';
import TodoListItem from './TodoListItem';
import {getTodoListItems} from '../api/indexedDB/readIDB';
import {addTodoListItem} from '../api/indexedDB/addItemsIDB';

export default class TodoCard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            todoListItemKeys: [],
        };
    }

    async componentDidMount() {
        try {
            const {todoId} = this.props;

            const todoListItemKeys = await getTodoListItems(todoId, 'keysonly');

            this.setState(prevState => ({
                todoListItemKeys: [...prevState.todoListItemKeys, ...todoListItemKeys],
            }));
        } catch (e) {
            console.log(e);
        }
    }

    addNewListItem = async (description, done) => {
        const {todoId} = this.props;

        try {
            const res = await addTodoListItem({todoId, description, done});
            const newTodoListItemKey = res.data;

            this.setState(prevState => ({
                todoListItemKeys: [...prevState.todoListItemKeys, ...newTodoListItemKey],
            }));
        } catch (e) {
            console.log(e);
        }
    };

    render() {
        const {todoId} = this.props;
        const {title, todoListItemKeys} = this.state;

        const todoListItems = todoListItemKeys.length > 0
            ? todoListItemKeys.map(todoListItemKey => (
                <TodoListItem key={todoListItemKey} todoId={todoId} todoListItemId={todoListItemKey} />
            ))
            : [];

        return (
            <div className="todo-card-container">
                <section className="todo-card-title">{title}</section>
                <ul className="todo-list-items">
                    {todoListItems.length > 0 ? todoListItems : false}
                    <TodoListItem addNewListItem={this.addNewListItem} />
                </ul>
            </div>
        )
    }
}

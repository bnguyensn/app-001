import * as React from 'react';

export default class TodoListItem extends React.PureComponent {
    render() {
        const {listItem, updateTodo} = this.props;
        const {description, done} = listItem;

        return (
            <li className="todo-list-item">
                <input className="todo-list-item-checkbox"
                       type="checkbox" checked={done} name={description}
                       onChange={updateTodo} />
                <div className="todo-list-item-description" contentEditable>{description}</div>
            </li>
        )
    }
}

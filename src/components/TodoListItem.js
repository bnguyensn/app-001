import * as React from 'react';

export default class TodoListItem extends React.PureComponent {
    render() {
        const {listItem} = this.props;
        const {description, done} = listItem;

        return (
            <div className="todo-list-item-container">
                <input className="todo-list-item-checkbox" type="checkbox" checked={done} />
                <div className="todo-list-item-description" contentEditable>{description}</div>
            </div>
        )
    }
}

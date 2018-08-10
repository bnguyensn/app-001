import * as React from 'react';
import TodoListItem from './TodoListItem';

function NoListItem() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

export default class TodoCard extends React.PureComponent {
    render() {
        const {todo, updateTodo} = this.props;
        const {id, title, list, done} = todo;
        const listItems = list.map(listItem => (
            <TodoListItem key={listItem.id} listItem={listItem} updateTodo={updateTodo} />
        ));

        return (
            <div className="todo-card-container">
                <section className="todo-card-title">{title}</section>
                <ul className="todo-list-items">{listItems.length > 0 ? listItems : <NoListItem />}</ul>
            </div>
        )
    }
}

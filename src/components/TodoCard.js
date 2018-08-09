import * as React from 'react';
import TodoListItem from './TodoListItem';

function NoListItem() {
    return (
        <div>There doesn&#39;t seem to be anything here.</div>
    )
}

export default class TodoCard extends React.PureComponent {
    render() {
        const {todo} = this.props;
        const {id, title, list, done} = todo;
        const listItems = list.map(listItem => <TodoListItem key={listItem.id} listItem={listItem} />);

        return (
            <div className="todo-card-container">
                <section className="todo-card-title">{title}</section>
                {listItems.length > 0 ? listItems : <NoListItem />}
            </div>
        )
    }
}
